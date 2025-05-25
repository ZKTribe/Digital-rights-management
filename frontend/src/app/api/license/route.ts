import { NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database';
import { Content } from '@/entities/content.entity';
import { License, LicenseDuration } from '@/entities/license.entity';

export async function POST(req: Request) {
  const data = await req.json();

  try {
    const AppDataSource = await getDataSource();
    const contentRepo = AppDataSource.getRepository(Content);
    const licenseRepo = AppDataSource.getRepository(License);

    const content = await contentRepo.findOne({
      where: { id: data.contentId },
    });

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    const license = licenseRepo.create({
      content,
      duration: data.duration,
      price: data.price,
      isActive: data.isActive ?? true,
    });

    await licenseRepo.save(license);

    return NextResponse.json({
      success: true,
      licenseId: license.id,
      contentId: content.id,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Database error' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const contentId = searchParams.get('contentId');

  try {
    const AppDataSource = await getDataSource();
    const licenseRepo = AppDataSource.getRepository(License);

    // Case 1: Specific content's licenses
    if (contentId) {
      const contentIdNum = parseInt(contentId);
      if (isNaN(contentIdNum)) {
        return NextResponse.json({ error: 'Invalid contentId' }, { status: 400 });
      }

      const licenses = await licenseRepo.find({
        where: { content: { id: contentIdNum } },
        relations: ['content'],
        order: { updatedAt: 'DESC' },
      });

      return NextResponse.json(licenses);
    }

    // Case 2: Marketplace – fetch all content with active licenses
    const licensedContent = await licenseRepo.find({
      where: { isActive: true },
      relations: ['content'],
      order: { updatedAt: 'DESC' },
    });

    const transformedContent = licensedContent.map((license) => ({
      id: license.content.id.toString(),
      title: license.content.title,
      description: license.content.description,
      ipfsHash: license.content.ipfsHash,
      creatorAddress: license.content.creatorAddress,
      contentType: license.content.contentType,
      isActive: license.content.isActive,
      createdAt: license.content.createdAt,
      licenseId: license.id,
      price: license.price,
      duration: license.duration,
      durationLabel: license.getDisplayName(),
      licenseIsActive: license.isActive,
    }));

    return NextResponse.json(transformedContent);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Database error' },
      { status: 500 }
    );
  }
}
