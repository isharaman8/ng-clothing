export const USER_ROLES = Object.freeze({
  user: 'user',
  admin: 'admin',
});

export const ALLOWED_USER_ROLES = Object.freeze({
  user: ['admin'],
  product: ['admin'],
  category: ['admin'],
  upload: ['user', 'admin'],
  review: ['user', 'admin'],
});

export const ALLOWED_MIMETYPES = Object.freeze({
  image: ['image/png', 'image/jpeg'],
});

export const ALLOWED_PRODUCT_SIZES = Object.freeze({
  M: 0,
  L: 0,
  S: 0,
  XL: 0,
  XXL: 0,
  XXXL: 0,
  'S/M': 0,
  'M/L': 0,
});

export const ALLOWED_GENDERS = ['male', 'female'];

export const ALLOWED_PURCHASE_STATUS = Object.freeze({
  verified: 'verified',
  cancelled: 'cancelled',
  fulfilled: 'fulfilled',
  delivered: 'delivered',
  in_transit: 'in_transit',
  pending_verification: 'pending_verification',
});

export const ALLOWED_RATING = [1, 2, 3, 4, 5];

export const MAX_PRESIGNED_URL_DURATION = 604800000;

export const REVIEW_USER_PROJECTION = Object.freeze({
  uid: 1,
  name: 1,
  profile_picture: 1,
});

export const ADDRESS_TYPE_ENUM = Object.freeze({
  home: 'home',
  work: 'work',
});

export const SENDGRID_TEMPLATE_UIDS = {
  verify_email: 'd-c97debc9d396462cb3349859e184d002',
};
