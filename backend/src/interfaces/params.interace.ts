export interface Params {
  product_uid?: string;
  user_id?: string;
  purchase_uid?: string;
}

export interface QueryParams {
  product_uid?: string | string[];
  name?: string | string[];
  active?: boolean;
  price?: number;
  min_price?: number;
  user_id?: string | string[];
  max_price?: number;
  uid?: string | string[];
}
