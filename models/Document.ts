import mongoose, { Schema, Document as MongoDocument } from 'mongoose'

export interface IDocumentVersion {
  id: string
  body: Record<string, unknown>
  savedAt: Date
  description?: string
}

export interface IDocument extends MongoDocument {
  title: string
  body: Record<string, unknown>
  versions: IDocumentVersion[]
  createdAt: Date
  updatedAt: Date
}

const DocumentVersionSchema = new Schema<IDocumentVersion>({
  id: { type: String, required: true },
  body: { type: Schema.Types.Mixed, required: true },
  savedAt: { type: Date, default: Date.now },
  description: { type: String },
})

const DocumentSchema = new Schema<IDocument>(
  {
    title: { type: String, required: true, default: 'Untitled Document' },
    body: { type: Schema.Types.Mixed, default: {} },
    versions: { type: [DocumentVersionSchema], default: [] },
  },
  { timestamps: true }
)

export const DocumentModel =
  mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema)
