import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ParserService } from './scheduler/parser.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
  ) {}

  @Get()
  async getHello(): Promise<string> {
    return this.appService.getHello();
  }
}
