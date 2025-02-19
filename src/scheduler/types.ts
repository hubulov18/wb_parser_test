export interface IBoxTariffsResponse {
  dtNextBox: string;
  dtTillMax: string;
  warehouseList: IWarehouseListItem[];
}

interface IWarehouseListItem {
  boxDeliveryAndStorageExpr: number;
  boxDeliveryBase: number;
  boxDeliveryLiter: number;
  boxStorageBase: number;
  boxStorageLiter: number;
  warehouseName: string;
}

export interface IGoogleSheetBoxTariff {
  dtNextBox: string;
  dtTillMax: string;
  boxDeliveryAndStorageExpr: number;
  boxDeliveryBase: number;
  boxDeliveryLiter: number;
  boxStorageBase: number;
  boxStorageLiter: number;
  warehouseName: string;
}
