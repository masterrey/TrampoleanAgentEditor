import mongoose, { Schema, Document as MongoDocument } from 'mongoose'

export interface IBibliography extends MongoDocument {
  projectId: mongoose.Types.ObjectId
  citeKey: string
  authors: string[]
  title: string
  year: number
  url?: string
  type: string // 'book', 'journal', 'paper', 'article', 'website', etc.
  tags?: string[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const BibliographySchema = new Schema<IBibliography>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'WorkingProject', required: true },
    citeKey: { type: String, required: true },
    authors: { type: [String], required: true },
    title: { type: String, required: true },
    year: { type: Number, required: true },
    url: { type: String },
    type: { type: String, default: 'book' },
    tags: { type: [String], default: [] },
    notes: { type: String },
  },
  { timestamps: true }
)

// Index for faster lookups
BibliographySchema.index({ projectId: 1, citeKey: 1 })
BibliographySchema.index({ citeKey: 1 })

export const BibliographyModel =
  mongoose.models.Bibliography || mongoose.model<IBibliography>('Bibliography', BibliographySchema)
