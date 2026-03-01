import mongoose, { Schema, Document as MongoDocument } from 'mongoose'

export type SessionAction = 'opened' | 'edited' | 'synced' | 'closed' | 'deleted' | 'created'

export interface ISessionLog extends MongoDocument {
  userId: mongoose.Types.ObjectId
  projectId?: mongoose.Types.ObjectId
  action: SessionAction
  details?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

const SessionLogSchema = new Schema<ISessionLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'WorkingProject' },
    action: {
      type: String,
      enum: ['opened', 'edited', 'synced', 'closed', 'deleted', 'created'],
      required: true,
    },
    details: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
)

// TTL Index: Auto-delete SessionLog after 30 days
SessionLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 })

// Index for faster lookups
SessionLogSchema.index({ userId: 1, createdAt: -1 })
SessionLogSchema.index({ projectId: 1 })

export const SessionLogModel =
  mongoose.models.SessionLog || mongoose.model<ISessionLog>('SessionLog', SessionLogSchema)
