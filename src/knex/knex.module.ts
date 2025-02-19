import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import knex, { Knex } from 'knex';
import * as path from 'path';

@Global()
@Module({
  providers: [
    {
      provide: 'KNEX_CONNECTION',
      useFactory: (configService: ConfigService): Knex => {
        return knex({
          client: 'pg',
          connection: {
            host: configService.get<string>('PGHOST'),
            port: configService.get<number>('PGPORT'),
            user: configService.get<string>('PGUSER'),
            password: configService.get<string>('PGPASSWORD'),
            database: configService.get<string>('PGDB'),
          },
          migrations: {
            directory: path.join(process.cwd(), 'migrations'),
            tableName: 'knex_migrations',
            extension: 'js',
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['KNEX_CONNECTION'],
})
export class KnexModule {}
