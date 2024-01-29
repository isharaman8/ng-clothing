import * as _ from 'lodash';

export const parseObject = (obj: object, defaultValue: any) => {
  return obj && typeof obj === 'object' ? obj : defaultValue;
};

export const parseArray = (arr: Array<any>, defaultValue: any) => {
  return Array.isArray(arr) ? arr : defaultValue;
};

export const parseNumber = (number: any, defaultValue: any) => {
  return number && !isNaN(number) ? Number(number) : defaultValue;
};

export const parseBoolean = (bool: any, defaultValue: any) => {
  return _.includes([true, 'true'], bool) ? true : _.includes([false, 'false'], bool) ? false : defaultValue;
};

export const _notEmpty = (obj: any = {}): boolean => {
  if (!_.isObject(obj)) {
    obj = {};
  }

  obj = _.omitBy(obj, (value) => value === null || value === undefined);

  return !_.isEmpty(obj);
};
