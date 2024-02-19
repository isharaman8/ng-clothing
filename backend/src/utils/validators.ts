export const _isValidQueryParam = (param: string) => {
  const regexPattern = /^[^\\]*\\[^\\]*$/;

  return regexPattern.test(param);
};
