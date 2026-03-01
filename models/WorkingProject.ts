import mongoose, { Schema, Document as MongoDocument } from 'mongoose'

export interface ISection {
  id: string
  title: string
  content: Record<string, unknown> // ProseMirror JSON
  createdAt: Date
  updatedAt: Date
  versions?: Array<{
    id: string
    content: Record<string, unknown>
    savedAt: Date
    description?: string
  }>
}

export interface IChapter {
  id: string
  title: string
  index: number
  sections: ISection[]
  createdAt: Date
  updatedAt: Date
}

export interface IWorkingProject extends MongoDocument {
  userId: mongoose.Types.ObjectId
  googleFileId?: string
  title: string
  description?: string
  chapters: IChapter[]
  bibliography?: Array<{
    citeKey: string
    authors: string[]
    title: string
    year: number
    url?: string
    type: string
  }>
  isEditing: boolean
  lastSyncAt?: Date
  lastEditedAt: Date
  wordCount?: number
  createdAt: Date
  updatedAt: Date
}

const SectionSchema = new Schema<ISection>({
  id: { type: String, required: true },
  title: { type: String, default: 'Untitled Section' },
  content: { type: Schema.Types.Mixed, default: {} },
  versions: [
    {
      id: { type: String, required: true },
      content: { type: Schema.Types.Mixed, required: true },
      savedAt: { type: Date, default: Date.now },
      description: { type: String },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

const ChapterSchema = new Schema<IChapter>({
  id: { type: String, required: true },
  title: { type: String, required: true, default: 'Untitled Chapter' },
  index: { type: Number, required: true },
  sections: [SectionSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

const WorkingProjectSchema = new Schema<IWorkingProject>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    googleFileId: { type: String },
    title: { type: String, required: true, default: 'Untitled Project' },
    description: { type: String },
    chapters: [ChapterSchema],
    bibliography: [
      {
        citeKey: { type: String, required: true },
        authors: { type: [String], required: true },
        title: { type: String, required: true },
        year: { type: Number },
        url: { type: String },
        type: { type: String, default: 'book' },
      },
    ],
    isEditing: { type: Boolean, default: true },
    lastSyncAt: { type: Date },
    lastEditedAt: { type: Date, default: Date.now },
    wordCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

// TTL Index: Auto-delete WorkingProject if not edited for 24 hours
WorkingProjectSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 86400 })

// Index for faster lookups by userId
WorkingProjectSchema.index({ userId: 1 })
WorkingProjectSchema.index({ googleFileId: 1 })

export const WorkingProjectModel =
  mongoose.models.WorkingProject || mongoose.model<IWorkingProject>('WorkingProject', WorkingProjectSchema)
