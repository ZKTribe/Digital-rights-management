// scripts/migrate.ts
import AppDataSource from '@/lib/database/data-source';

AppDataSource.initialize()
  .then(() => AppDataSource.runMigrations())
  .catch(console.error);