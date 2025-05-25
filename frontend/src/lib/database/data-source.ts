import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import path from 'path';
import { Content } from '@/entities/content.entity';
import { License } from '@/entities/license.entity';


config();

const configService = new ConfigService();

const entityClasses = [Content, License];

const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: configService.get('MYSQL_HOST'),
  port: parseInt(configService.get('MYSQL_PORT') || '3306', 10),
  username: configService.get('MYSQL_USER'),
  password: configService.get('MYSQL_PASSWORD'),
  database: configService.get('MYSQL_DATABASE'),
  // ssl: {
  //   rejectUnauthorized: false,
  // },
  
  entities: entityClasses,
  migrations: [
    path.join(__dirname, 'migrations', '*.{js,ts}')
  ],
  synchronize: false,
};

const AppDataSource = new DataSource(dataSourceOptions);

export default AppDataSource;
