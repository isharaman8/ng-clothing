export const USER_ROLES = Object.freeze({
  admin: 'admin',
  user: 'user',
});

export const ALLOWED_USER_ROLES = Object.freeze({
  user: ['admin'],
  upload: ['admin'],
  product: ['admin'],
  category: ['admin'],
  review: ['user', 'admin'],
});

export const ALLOWED_MIMETYPES = Object.freeze({
  image: ['image/png', 'image/jpeg'],
});

export const ALLOWED_PRODUCT_SIZES = Object.freeze({
  L: 0,
  S: 0,
  XL: 0,
  XXL: 0,
  XXXL: 0,
  M: 0,
  'S/M': 0,
  'M/L': 0,
});

export const ALLOWED_GENDERS = ['male', 'female'];

export const ALLOWED_PURCHASE_STATUS = Object.freeze({
  pending_verification: 'pending_verification',
  verified: 'verified',
  cancelled: 'cancelled',
  fulfilled: 'fulfilled',
  in_transit: 'in_transit',
  delivered: 'delivered',
});

export const ALLOWED_RATING = [1, 2, 3, 4, 5];

export const MAX_PRESIGNED_URL_DURATION = 604800000;

export const REVIEW_USER_PROJECTION = Object.freeze({
  name: 1,
  uid: 1,
  profile_picture: 1,
});

export const PRODUCT_GET_PROJECTION = Object.freeze({
  name: 1,
  uid: 1,
  description: 1,
  images: 1,
});
