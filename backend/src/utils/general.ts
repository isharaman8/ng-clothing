export const parseObject = (obj: object, defaultValue: any) => {
  return obj && typeof obj === 'object' ? obj : defaultValue;
};

export const parseArray = (arr: Array<any>, defaultValue: any) => {
  return Array.isArray(arr) ? arr : defaultValue;
};
