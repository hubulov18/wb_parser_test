import { Inject, Injectable } from '@nestjs/common';
import knex, { Knex } from 'knex';
import axios from 'axios';
import {
  IBoxTariffsResponse,
  IGoogleSheetBoxTariff,
} from './types';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';

@Injectable()
export class ParserService {
  constructor(
    @Inject('KNEX_CONNECTION') private readonly knex: Knex,
    private readonly configService: ConfigService,
  ) {}
  auth = new google.auth.GoogleAuth({
    keyFile: './credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  async getAndSaveTariffsForBoxes(date: string) {
    const data = await this.makeTariffsForBoxesRequest(date);
    const formatedData: IGoogleSheetBoxTariff[] = data.warehouseList.map(
      (el) => {
        return { dtNextBox: data.dtNextBox, dtTillMax: data.dtTillMax, ...el };
      },
    );
    await this.saveTariffsInDB(formatedData);
  }

  private async saveTariffsInDB(data: IGoogleSheetBoxTariff[]) {
    for (const row of data) {
      await this.knex.raw(
        `
      INSERT INTO box_tariffs (
        dt_next_box, dt_till_max, box_delivery_and_storage_expr, 
        box_delivery_base, box_delivery_liter, box_storage_base, 
        box_storage_liter, warehouse_name, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      ON CONFLICT (warehouse_name, dt_till_max)
      DO UPDATE SET
        dt_next_box = EXCLUDED.dt_next_box,
        dt_till_max = EXCLUDED.dt_till_max,
        box_delivery_and_storage_expr = EXCLUDED.box_delivery_and_storage_expr,
        box_delivery_base = EXCLUDED.box_delivery_base,
        box_delivery_liter = EXCLUDED.box_delivery_liter,
        box_storage_base = EXCLUDED.box_storage_base,
        box_storage_liter = EXCLUDED.box_storage_liter,
        updated_at = NOW();
    `,
        [
          row.dtNextBox,
          row.dtTillMax,
          row.boxDeliveryAndStorageExpr,
          row.boxDeliveryBase,
          row.boxDeliveryLiter,
          row.boxStorageBase,
          row.boxStorageLiter,
          row.warehouseName,
        ],
      );
    }
  }

  private async makeTariffsForBoxesRequest(
    date: string,
  ): Promise<IBoxTariffsResponse> {
    try {
      const response: any = await axios.get(
        'https://common-api.wildberries.ru/api/v1/tariffs/box',
        {
          headers: {
            Authorization: this.configService.get('API_KEY'),
          },
          params: {
            date,
          },
        },
      );
      return response.data.response.data;
    } catch (error) {
      console.error('Error fetching tariffs:', error);
      throw new Error('Failed to fetch tariffs data');
    }
  }

  async getDataFromDB(): Promise<any> {
    const now = new Date();
    now.setDate(now.getDate());

    const midnight = new Date(now);
    midnight.setHours(0, 0, 0, 0);
    const startOfDay = midnight.toISOString();

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    const endOfDayStr = endOfDay.toISOString();

    return this.knex('box_tariffs')
      .select('*')
      .where('updated_at', '>=', startOfDay)
      .andWhere('updated_at', '<=', endOfDayStr);
  }



  snakeToCamel(obj: any): IGoogleSheetBoxTariff {
    return {
      dtNextBox: obj.dt_next_box,
      dtTillMax: obj.dt_till_max,
      boxDeliveryAndStorageExpr: obj.box_delivery_and_storage_expr,
      boxDeliveryBase: obj.box_delivery_base,
      boxDeliveryLiter: obj.box_delivery_liter,
      boxStorageBase: obj.box_storage_base,
      boxStorageLiter: obj.box_storage_liter,
      warehouseName: obj.warehouse_name,
    };
  }

  async writeToGoogleSheets(dataFromDB) {
    const sheets = google.sheets({ version: 'v4', auth: this.auth });
    const tables: string[] = this.configService.get('TABLE_LINKS').split(',');
    const headers = [
      'dtNextBox',
      'dtTillMax',
      'boxDeliveryAndStorageExpr',
      'boxDeliveryBase',
      'boxDeliveryLiter',
      'boxStorageBase',
      'boxStorageLiter',
      'warehouseName',
      'date',
    ];

    const today = new Date().toISOString().split('T')[0];

    const data = dataFromDB.map(this.snakeToCamel);

    const values = data.map((el) => [
      el.dtNextBox,
      el.dtTillMax,
      el.boxDeliveryAndStorageExpr,
      el.boxDeliveryBase,
      el.boxDeliveryLiter,
      el.boxStorageBase,
      el.boxStorageLiter,
      el.warehouseName,
      today,
    ]);

    for (const table of tables) {
      try {
        const res = await sheets.spreadsheets.values.get({
          spreadsheetId: table,
          range: 'stocks_coefs!A1:I',
        });

        const existingRows = res.data.values || [];
        const headerRow = existingRows[0] || headers;
        const dataRows = existingRows.slice(1);

        const filteredRows = dataRows.filter((row) => row[8] !== today);

        await sheets.spreadsheets.values.update({
          spreadsheetId: table,
          range: 'stocks_coefs!A1:I',
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [headerRow, ...filteredRows, ...values] },
        });
      } catch (e) {
        console.log(e);
      }
    }
  }
}
