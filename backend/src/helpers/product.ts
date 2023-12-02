import * as _ from 'lodash';
import { nanoid } from 'nanoid';
import { CreateOrUpdateProductDto } from 'src/dto';
import { parseArray } from 'src/utils/general';

export const _getProductPayload = (
  product: any = {},
  oldProduct: any = {},
  user: any = {},
): CreateOrUpdateProductDto => {
  const payload = {
    uid: _.defaultTo(oldProduct.uid, nanoid()),
    name: _.defaultTo(product.name, oldProduct.name),
    price: _.defaultTo(product.price, oldProduct.price),
    active: _.defaultTo(product.active, oldProduct.active),
    images: parseArray(product.images, oldProduct.images),
    user_id: _.defaultTo(oldProduct.user_id, user.uid),
  };

  return payload;
};
