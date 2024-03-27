export interface Params {
  user_id?: string;
  cart_uid?: string;
  review_uid?: string;
  product_uid?: string;
  purchase_uid?: string;
  category_uid?: string;
  user_address_uid?: string;
}

export interface QueryParams {
  q?: string;
  token?: string;
  price?: number;
  gender?: string;
  active?: boolean;
  reviews?: boolean;
  verified?: boolean;
  max_price?: number;
  min_price?: number;
  page_size?: number;
  addresses?: boolean;
  page_number?: number;
  uid?: string | string[];
  slug?: string | string[];
  name?: string | string[];
  email?: string | string[];
  user_id?: string | string[];
  username?: string | string[];
  order_type?: string | string[];
  product_uid?: string | string[];
  purchase_uid?: string | string[];
  required_size?: string | string[];
}
