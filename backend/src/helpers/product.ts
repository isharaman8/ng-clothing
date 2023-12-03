// third party imports
import * as _ from 'lodash';
import { nanoid } from 'nanoid';

// inner imports
import { CreateOrUpdateProductDto } from 'src/dto';
import { parseArray, parseBoolean, parseNumber } from 'src/utils';

export const _getProductPayload = (
  product: any = {},
  oldProduct: any = {},
  user: any = {},
): CreateOrUpdateProductDto => {
  const payload = {
    uid: _.defaultTo(oldProduct.uid, nanoid()),
    name: _.defaultTo(product.name, oldProduct.name),
    user_id: _.defaultTo(oldProduct.user_id, user.uid),
    price: parseNumber(product.price, oldProduct.price),
    images: parseArray(product.images, oldProduct.images),
    active: parseBoolean(product.active, oldProduct.active),
  };

  return payload;
};
