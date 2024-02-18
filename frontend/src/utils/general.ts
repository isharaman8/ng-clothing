import _ from 'lodash';

export const parseObject = (obj: object, defaultValue: any) => {
	return _.isObject(obj) ? obj : defaultValue;
};

export const parseArray = (arr: Array<any>, defaultValue: any) => {
	return _.isArray(arr) ? arr : defaultValue;
};

export const parseNumber = (number: any, defaultValue: any) => {
	return number && !isNaN(number) ? Number(number) : defaultValue;
};

export const parseBoolean = (bool: any, defaultValue: any) => {
	return [true, 'true'].includes(bool) ? true : [false, 'false'].includes(bool) ? false : defaultValue;
};

export const _notEmpty = (obj: any = {}): boolean => {
	return !_.isEmpty(obj);
};

export const parseString = (value: any, defaultValue: any) => {
	return typeof value === 'string' ? value : defaultValue;
};
