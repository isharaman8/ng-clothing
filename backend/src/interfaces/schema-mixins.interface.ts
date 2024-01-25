export interface PurchaseProduct {
  uid: string;
  price: number;
  name: string;
  images: Array<string>;
  qty: number;
}

export interface UploadedImage {
  key: string;
  url: string;
  size: number;
  bucket: string;
  urlExpiryDate: string;
  uid: string;
}
