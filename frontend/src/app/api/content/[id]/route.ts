// src/app/api/content/[id]/route.ts
import { NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database';
import { Content } from '@/entities/content.entity';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const contentId = params.id;

    if (!contentId) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }

    console.log('API: Fetching content with ID:', contentId);

    const AppDataSource = await getDataSource();
    const contentRepo = AppDataSource.getRepository(Content);

    const content = await contentRepo.findOne({
      where: { id: parseInt(contentId) }
    });

    if (!content) {
      console.log('API: Content not found for ID:', contentId);
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    console.log('API: Successfully found content:', content.title);
    return NextResponse.json(content);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Database error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const contentId = params.id;
    const data = await req.json();

    if (!contentId) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }

    console.log('API: Updating content with ID:', contentId);

    const AppDataSource = await getDataSource();
    const contentRepo = AppDataSource.getRepository(Content);

    const existingContent = await contentRepo.findOne({
      where: { id: parseInt(contentId) }
    });

    if (!existingContent) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    await contentRepo.update(parseInt(contentId), {
      title: data.title || existingContent.title,
      description: data.description || existingContent.description,
      contentType: data.contentType || existingContent.contentType
    });

    const updatedContent = await contentRepo.findOne({
      where: { id: parseInt(contentId) }
    });

    return NextResponse.json({
      success: true,
      content: updatedContent
    });

  } catch (error) {
    console.error('API Update Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Database error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const contentId = params.id;

    if (!contentId) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }

    console.log('API: Deleting content with ID:', contentId);

    const AppDataSource = await getDataSource();
    const contentRepo = AppDataSource.getRepository(Content);

    const existingContent = await contentRepo.findOne({
      where: { id: parseInt(contentId) }
    });

    if (!existingContent) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    await contentRepo.delete(parseInt(contentId));

    return NextResponse.json({
      success: true,
      message: 'Content deleted successfully'
    });

  } catch (error) {
    console.error('API Delete Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Database error' },
      { status: 500 }
    );
  }
}