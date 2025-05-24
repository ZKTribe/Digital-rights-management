// src/lib/database/index.ts
import { Content } from '@/entities/content.entity';
import AppDataSource from './data-source';

export async function getDataSource() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource;
}

// Optional: Export repositories for easier access
export async function getContentRepository() {
  const ds = await getDataSource();
  return ds.getRepository(Content);
}