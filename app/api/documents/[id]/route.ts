import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { DocumentModel } from '@/models/Document'
import { v4 as uuidv4 } from 'uuid'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await connectToDatabase()
    const document = await DocumentModel.findById(id).lean()

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    return NextResponse.json(document)
  } catch (error) {
    console.error('[Documents API] GET by ID error:', error)
    return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await connectToDatabase()
    const body = await request.json()

    // Get current document to save version
    const current = await DocumentModel.findById(id)
    if (!current) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Save current version before updating
    const version = {
      id: uuidv4(),
      body: current.body,
      savedAt: new Date(),
      description: body.versionDescription || `Auto-save ${new Date().toLocaleString()}`,
    }

    const updated = await DocumentModel.findByIdAndUpdate(
      id,
      {
        $set: {
          title: body.title || current.title,
          body: body.body || current.body,
        },
        $push: {
          versions: {
            $each: [version],
            $slice: -20, // Keep last 20 versions
          },
        },
      },
      { new: true }
    ).lean()

    console.info(`[Documents API] Updated document: ${id}`)
    return NextResponse.json(updated)
  } catch (error) {
    console.error('[Documents API] PUT error:', error)
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await connectToDatabase()
    const deleted = await DocumentModel.findByIdAndDelete(id)

    if (!deleted) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    console.info(`[Documents API] Deleted document: ${id}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Documents API] DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
  }
}
