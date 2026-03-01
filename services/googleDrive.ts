import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'

interface ProjectMetadata {
  projectId: string
  title: string
  owner: string
  createdAt: string
  lastEditedAt: string
  wordCount: number
  chapterCount: number
  hasAIMemory: boolean
  bibliography: { count: number }
  fileVersion: string
}

/**
 * Initialize Google Drive client with OAuth2
 */
function initializeDrive(accessToken: string) {
  const oauth2Client = new OAuth2Client()
  oauth2Client.setCredentials({ access_token: accessToken })
  return google.drive({ version: 'v3', auth: oauth2Client })
}

/**
 * Ensure TrampoleanAgent folder exists in user's Google Drive
 * Returns folder ID
 */
export async function ensureTrampoleanFolder(accessToken: string): Promise<string> {
  const drive = initializeDrive(accessToken)

  try {
    // Search for existing folder
    const response = await drive.files.list({
      q: "name='TrampoleanAgent' and mimeType='application/vnd.google-apps.folder' and trashed=false",
      spaces: 'drive',
      fields: 'files(id)',
      pageSize: 1,
    })

    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0].id!
    }

    // Create folder if it doesn't exist
    const createResponse = await drive.files.create({
      requestBody: {
        name: 'TrampoleanAgent',
        mimeType: 'application/vnd.google-apps.folder',
      },
      fields: 'id',
    })

    return createResponse.data.id!
  } catch (error) {
    console.error('[GoogleDrive] Error ensuring TrampoleanAgent folder:', error)
    throw error
  }
}

/**
 * List all projects in user's TrampoleanAgent folder
 */
export async function listProjects(accessToken: string): Promise<
  Array<{
    fileId: string
    name: string
    metadata?: ProjectMetadata
  }>
> {
  try {
    const drive = initializeDrive(accessToken)
    const folderId = await ensureTrampoleanFolder(accessToken)

    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      spaces: 'drive',
      fields: 'files(id, name, modifiedTime, webViewLink)',
      pageSize: 50,
      orderBy: 'modifiedTime desc',
    })

    const projects = response.data.files || []

    // Fetch metadata for each project
    const projectsWithMetadata = await Promise.all(
      projects.map(async (file) => {
        try {
          const metaFile = await drive.files.list({
            q: `'${file.id}' in parents and name='project.meta.json' and trashed=false`,
            spaces: 'drive',
            fields: 'files(id)',
            pageSize: 1,
          })

          let metadata: ProjectMetadata | undefined = undefined

          if (metaFile.data.files && metaFile.data.files.length > 0) {
            const metaContent = await drive.files.get(
              {
                fileId: metaFile.data.files[0].id!,
                alt: 'media',
              },
              { responseType: 'text' }
            )

            metadata = JSON.parse(metaContent.data as string)
          }

          return {
            fileId: file.id || '',
            name: file.name || 'Untitled',
            metadata,
          }
        } catch (err) {
          console.error(`[GoogleDrive] Error fetching metadata for ${file.name}:`, err)
          return {
            fileId: file.id || '',
            name: file.name || 'Untitled',
          }
        }
      })
    )

    return projectsWithMetadata
  } catch (error) {
    console.error('[GoogleDrive] Error listing projects:', error)
    throw error
  }
}

/**
 * Download project from Google Drive
 * Returns { projectData, metadata }
 */
export async function downloadProject(
  accessToken: string,
  projectFolderId: string
): Promise<{ projectData: Record<string, unknown>; metadata: ProjectMetadata }> {
  try {
    const drive = initializeDrive(accessToken)

    // Get project.json
    const projectFilesResponse = await drive.files.list({
      q: `'${projectFolderId}' in parents and name='project.json' and trashed=false`,
      spaces: 'drive',
      fields: 'files(id)',
      pageSize: 1,
    })

    if (!projectFilesResponse.data.files || projectFilesResponse.data.files.length === 0) {
      throw new Error('project.json not found in Google Drive folder')
    }

    const projectContent = await drive.files.get(
      {
        fileId: projectFilesResponse.data.files[0].id!,
        alt: 'media',
      },
      { responseType: 'text' }
    )

    const projectData = JSON.parse(projectContent.data as string)

    // Get project.meta.json
    const metaFilesResponse = await drive.files.list({
      q: `'${projectFolderId}' in parents and name='project.meta.json' and trashed=false`,
      spaces: 'drive',
      fields: 'files(id)',
      pageSize: 1,
    })

    let metadata: ProjectMetadata = {
      projectId: projectData.id || 'unknown',
      title: projectData.title || 'Untitled',
      owner: 'unknown',
      createdAt: new Date().toISOString(),
      lastEditedAt: new Date().toISOString(),
      wordCount: 0,
      chapterCount: 0,
      hasAIMemory: false,
      bibliography: { count: 0 },
      fileVersion: '1.0',
    }

    if (metaFilesResponse.data.files && metaFilesResponse.data.files.length > 0) {
      const metaContent = await drive.files.get(
        {
          fileId: metaFilesResponse.data.files[0].id!,
          alt: 'media',
        },
        { responseType: 'text' }
      )

      metadata = JSON.parse(metaContent.data as string)
    }

    return { projectData, metadata }
  } catch (error) {
    console.error('[GoogleDrive] Error downloading project:', error)
    throw error
  }
}

/**
 * Upload project to Google Drive
 * Creates or updates project folder with project.json and project.meta.json
 */
export async function uploadProject(
  accessToken: string,
  projectName: string,
  projectData: Record<string, unknown>,
  metadata: ProjectMetadata,
  existingProjectFolderId?: string
): Promise<string> {
  try {
    const drive = initializeDrive(accessToken)
    const parentFolderId = await ensureTrampoleanFolder(accessToken)

    let projectFolderId = existingProjectFolderId

    // Create project folder if it doesn't exist
    if (!projectFolderId) {
      const folderResponse = await drive.files.create({
        requestBody: {
          name: projectName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [parentFolderId],
        },
        fields: 'id',
      })

      projectFolderId = folderResponse.data.id!
    }

    // Upload project.json
    const projectJsonId = await getOrCreateFile(
      drive,
      projectFolderId,
      'project.json',
      JSON.stringify(projectData, null, 2),
      'application/json'
    )

    // Upload project.meta.json
    await getOrCreateFile(
      drive,
      projectFolderId,
      'project.meta.json',
      JSON.stringify(metadata, null, 2),
      'application/json'
    )

    console.info(`[GoogleDrive] Project uploaded successfully: ${projectFolderId}`)
    return projectFolderId
  } catch (error) {
    console.error('[GoogleDrive] Error uploading project:', error)
    throw error
  }
}

/**
 * Helper: Get or create a file in a folder
 */
async function getOrCreateFile(
  drive: any,
  parentFolderId: string,
  fileName: string,
  fileContent: string,
  mimeType: string
): Promise<string> {
  // Check if file exists
  const existingResponse = await drive.files.list({
    q: `'${parentFolderId}' in parents and name='${fileName}' and trashed=false`,
    spaces: 'drive',
    fields: 'files(id)',
    pageSize: 1,
  })

  if (existingResponse.data.files && existingResponse.data.files.length > 0) {
    // Update existing file
    const fileId = existingResponse.data.files[0].id!

    await drive.files.update({
      fileId,
      media: {
        mimeType,
        body: fileContent,
      },
    })

    return fileId
  }

  // Create new file
  const createResponse = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [parentFolderId],
      mimeType,
    },
    media: {
      mimeType,
      body: fileContent,
    },
    fields: 'id',
  })

  return createResponse.data.id!
}

/**
 * Delete project folder from Google Drive
 */
export async function deleteProject(accessToken: string, projectFolderId: string): Promise<void> {
  try {
    const drive = initializeDrive(accessToken)

    await drive.files.delete({
      fileId: projectFolderId,
    })

    console.info(`[GoogleDrive] Project deleted: ${projectFolderId}`)
  } catch (error) {
    console.error('[GoogleDrive] Error deleting project:', error)
    throw error
  }
}
