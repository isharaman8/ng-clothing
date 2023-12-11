export interface PurchaseProduct {
  uid: string;
  price: number;
  name: string;
  images: Array<UploadedImage>;
}

export interface UploadedImage {
  key: string;
  url: string;
  size: number;
  bucket: string;
  urlExpiryDate: string;
  uid: string;
}
