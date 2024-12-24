import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [__dirname + '/**/*.entity{.js,.ts}'],
  migrations: [__dirname + '/migrations/*{.js,.ts}'],
  synchronize: false,
  logging: false,
});

module.exports = {
  AppDataSource
};
