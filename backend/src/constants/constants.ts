export const USER_ROLES = Object.freeze({
  admin: 'admin',
  user: 'user',
});

export const ALLOWED_USER_ROLES = Object.freeze({
  user: ['admin'],
  upload: ['admin'],
  product: ['admin'],
});

export const ALLOWED_MIMETYPES = Object.freeze({
  image: ['image/png', 'image/jpeg'],
});
