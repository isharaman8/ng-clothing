export interface PurchaseProduct {
  uid: string;
  price: number;
  name: string;
  images: Array<string>;
  slug: string;
  qty: number;
  size: number;
  available_sizes: Object;
  status?: string;
}

export interface UploadedImage {
  key: string;
  url: string;
  size: number;
  bucket: string;
  urlExpiryDate: string;
  uid: string;
}

export interface SizeType {
  L: number;
  S: number;
  XL: number;
  XXL: number;
  XXXL: number;
  M: number;
  'S/M': number;
  'M/L': number;
}
