import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ParserService } from './parser.service';

@Injectable()
export class SchedulerService {
  constructor(private readonly parserService: ParserService) {}

  @Cron('0 * * * *')
  async getData() {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    await this.parserService.getAndSaveTariffsForBoxes(formattedDate);
  }

  @Cron('0 * * * *')
  async writeToGoogleSheets() {
    const data = await this.parserService.getDataFromDB();
    await this.parserService.writeToGoogleSheets(data);
  }
}
