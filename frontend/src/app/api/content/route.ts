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