import mongoose, { Schema, Document as MongoDocument } from 'mongoose'

export interface IUser extends MongoDocument {
  email: string
  name?: string
  image?: string
  googleId: string
  accessToken?: string
  refreshToken?: string
  tokenExpiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String },
    image: { type: String },
    googleId: { type: String, required: true, unique: true },
    accessToken: { type: String }, // Encrypted in production
    refreshToken: { type: String }, // Encrypted in production
    tokenExpiresAt: { type: Date },
  },
  { timestamps: true }
)

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
