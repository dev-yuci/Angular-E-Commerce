import { KDVRateType } from "./product.model";

export class OrderModel{
    id: string = "";
    orderNumber: string = "";
    orderNumberPrefix: string = "";
    orderNumberSuffix: number = 0;
    date: string = "";
    productImageURL: string = "";
    productName: string = "";
    productPrice: number = 0;
    productQuantity: number = 0;
    productKDVRate: KDVRateType = 0;
    totalAmount: number = 0;
    totalKDV: number = 0;
    total: number = 0;
}