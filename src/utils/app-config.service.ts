/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  get DATABASE_URL(): string {
    return this.configService.get<string>('DATABASE_URL')!;
  }

  get API_KEY(): string {
    return this.configService.get<string>('API_KEY')!;
  }

  get GOOGLE_SHEETS_ID(): string {
    return this.configService.get<string>('GOOGLE_SHEETS_ID')!;
  }

  get TABLE_LINKS(): string {
    return this.configService.get<string>('TABLE_LINKS')!;
  }
}
