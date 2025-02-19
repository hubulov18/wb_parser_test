import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { ParserService } from './parser.service';
import { KnexModule } from '../knex/knex.module';

@Module({
  imports: [KnexModule],
  providers: [SchedulerService, ParserService],
  exports: [ParserService],
})
export class SchedulerModule {}
