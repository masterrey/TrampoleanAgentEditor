import { WorkingProjectModel, IWorkingProject } from '@/models/WorkingProject'
import { downloadProject, uploadProject } from './googleDrive'
import mongoose from 'mongoose'

/**
 * Load project from Google Drive into MongoDB workspace
 * This creates a temporary WorkingProject document for editing
 */
export async function loadProjectToWorkspace(
  userId: string,
  googleFileId: string,
  accessToken: string
): Promise<IWorkingProject> {
  try {
    // Check if project already exists in workspace
    const existingProject = await WorkingProjectModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      googleFileId,
      isEditing: true,
    })

    if (existingProject) {
      console.info(`[ProjectSync] Project already in workspace: ${googleFileId}`)
      return existingProject
    }

    // Download from Google Drive
    const { projectData, metadata } = await downloadProject(accessToken, googleFileId)

    // Validate project structure
    validateProjectStructure(projectData)

    // Create WorkingProject in MongoDB
    const workingProject = new WorkingProjectModel({
      userId: new mongoose.Types.ObjectId(userId),
      googleFileId,
      title: projectData.title || metadata.title || 'Untitled Project',
      description: projectData.description,
      chapters: projectData.chapters || [],
      bibliography: projectData.bibliography || [],
      isEditing: true,
      lastSyncAt: new Date(),
      lastEditedAt: new Date(),
      wordCount: metadata.wordCount || 0,
    })

    await workingProject.save()

    console.info(`[ProjectSync] Project loaded to workspace: ${workingProject._id}`)
    return workingProject
  } catch (error) {
    console.error('[ProjectSync] Error loading project to workspace:', error)
    throw error
  }
}

/**
 * Save project from MongoDB to Google Drive
 * Then delete from MongoDB (cleanup)
 */
export async function saveProjectToGDrive(
  userId: string,
  workingProjectId: string,
  accessToken: string
): Promise<{ googleFileId: string; savedAt: Date }> {
  try {
    // Get working project
    const workingProject = await WorkingProjectModel.findOne({
      _id: new mongoose.Types.ObjectId(workingProjectId),
      userId: new mongoose.Types.ObjectId(userId),
    })

    if (!workingProject) {
      throw new Error('Working project not found')
    }

    // Prepare project data (remove MongoDB metadata)
    const projectData = {
      id: workingProject._id.toString(),
      title: workingProject.title,
      description: workingProject.description,
      chapters: workingProject.chapters,
      bibliography: workingProject.bibliography,
      createdAt: workingProject.createdAt,
      updatedAt: workingProject.updatedAt,
    }

    // Calculate word count (simple implementation)
    let wordCount = 0
    workingProject.chapters.forEach((chapter: any) => {
      chapter.sections.forEach((section: any) => {
        // Extract text from ProseMirror JSON (simplified)
        if (section.content && typeof section.content === 'object') {
          const text = extractTextFromJSON(section.content)
          wordCount += text.split(/\s+/).filter(Boolean).length
        }
      })
    })

    // Prepare metadata
    const metadata = {
      projectId: workingProject._id.toString(),
      title: workingProject.title,
      owner: userId,
      createdAt: workingProject.createdAt.toISOString(),
      lastEditedAt: workingProject.lastEditedAt.toISOString(),
      wordCount,
      chapterCount: workingProject.chapters.length,
      hasAIMemory: false, // TODO: implement AI memory detection
      bibliography: { count: workingProject.bibliography?.length || 0 },
      fileVersion: '1.0',
    }

    // Upload to Google Drive
    const googleFileId = await uploadProject(
      accessToken,
      workingProject.title,
      projectData,
      metadata,
      workingProject.googleFileId
    )

    // Update last sync time
    workingProject.lastSyncAt = new Date()
    await workingProject.save()

    console.info(`[ProjectSync] Project saved to GDrive: ${googleFileId}`)

    return {
      googleFileId,
      savedAt: new Date(),
    }
  } catch (error) {
    console.error('[ProjectSync] Error saving project to GDrive:', error)
    throw error
  }
}

/**
 * Delete working project from MongoDB and Google Drive
 */
export async function deleteProject(
  userId: string,
  workingProjectId: string,
  accessToken?: string
): Promise<void> {
  try {
    const workingProject = await WorkingProjectModel.findOne({
      _id: new mongoose.Types.ObjectId(workingProjectId),
      userId: new mongoose.Types.ObjectId(userId),
    })

    if (!workingProject) {
      throw new Error('Working project not found')
    }

    // Delete from Google Drive if accessToken provided and googleFileId exists
    if (accessToken && workingProject.googleFileId) {
      const { deleteProject: deleteFromGDrive } = await import('./googleDrive')
      try {
        await deleteFromGDrive(accessToken, workingProject.googleFileId)
      } catch (err) {
        console.error('[ProjectSync] Error deleting from GDrive:', err)
        // Continue with MongoDB deletion even if GDrive fails
      }
    }

    // Delete from MongoDB
    await WorkingProjectModel.deleteOne({
      _id: new mongoose.Types.ObjectId(workingProjectId),
    })

    console.info(`[ProjectSync] Project deleted: ${workingProjectId}`)
  } catch (error) {
    console.error('[ProjectSync] Error deleting project:', error)
    throw error
  }
}

/**
 * Validate project structure
 */
export function validateProjectStructure(data: unknown): void {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid project structure: must be an object')
  }

  const project = data as Record<string, unknown>

  if (!project.title || typeof project.title !== 'string') {
    throw new Error('Invalid project structure: missing or invalid title')
  }

  if (project.chapters && !Array.isArray(project.chapters)) {
    throw new Error('Invalid project structure: chapters must be an array')
  }

  if (project.bibliography && !Array.isArray(project.bibliography)) {
    throw new Error('Invalid project structure: bibliography must be an array')
  }
}

/**
 * Extract plain text from ProseMirror JSON structure
 * Simplified implementation - recursively extracts text
 */
function extractTextFromJSON(obj: unknown): string {
  if (typeof obj === 'string') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(extractTextFromJSON).join(' ')
  }

  if (obj && typeof obj === 'object') {
    const record = obj as Record<string, unknown>
    const text = (record.text || '') as string
    const content = record.content as unknown
    const marks = record.marks as unknown

    let result = text

    if (content && Array.isArray(content)) {
      result += ' ' + content.map(extractTextFromJSON).join(' ')
    }

    if (marks && Array.isArray(marks)) {
      result += ' ' + marks.map(extractTextFromJSON).join(' ')
    }

    return result
  }

  return ''
}
