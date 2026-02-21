import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { DocumentModel } from '@/models/Document'

export async function GET() {
  try {
    await connectToDatabase()
    const documents = await DocumentModel.find({}, { versions: 0 })
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean()

    return NextResponse.json(documents)
  } catch (error) {
    console.error('[Documents API] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const body = await request.json()

    const document = new DocumentModel({
      title: body.title || 'Untitled Document',
      body: body.body || {},
      versions: [],
    })

    await document.save()

    console.info(`[Documents API] Created document: ${document._id}`)
    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error('[Documents API] POST error:', error)
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 })
  }
}
