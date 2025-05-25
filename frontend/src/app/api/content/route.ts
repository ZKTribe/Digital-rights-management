// src/app/api/content/route.ts
import { NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database'; // Correct import path
import { Content } from '@/entities/content.entity';

export async function POST(req: Request) {
  const data = await req.json();

  try {
    const AppDataSource = await getDataSource();
    const contentRepo = AppDataSource.getRepository(Content);

    const content = contentRepo.create({
      title: data.title,
      description: data.description,
      ipfsHash: data.ipfsHash,
      creatorAddress: data.creatorAddress,
      contentType: data.contentType
    });

    await contentRepo.save(content);

    return NextResponse.json({
      success: true,
      contentId: content.id
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Database error' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const data = await req.json();
  const { contentId, onChainId } = data;

  if (!contentId || !onChainId) {
    return NextResponse.json(
      { error: 'contentId and onChainId are required' },
      { status: 400 }
    );
  }

  try {
    const AppDataSource = await getDataSource();
    const contentRepo = AppDataSource.getRepository(Content);

    const content = await contentRepo.findOneBy({ id: contentId });
    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    content.onChainId = onChainId;
    await contentRepo.save(content);

    return NextResponse.json({ success: true, content });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Database error' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const creatorAddress = searchParams.get('creatorAddress')

  if (!creatorAddress) {
    return NextResponse.json(
      { error: 'creatorAddress is required' },
      { status: 400 }
    )
  }

  try {
    const AppDataSource = await getDataSource()
    const contentRepo = AppDataSource.getRepository(Content)

    const contents = await contentRepo.find({
      where: { creatorAddress },
      order: { createdAt: 'DESC' },
    })

    return NextResponse.json(contents)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Database error' },
      { status: 500 }
    )
  }
}
