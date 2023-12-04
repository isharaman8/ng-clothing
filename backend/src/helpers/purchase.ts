import * as _ from 'lodash';
import { nanoid } from 'nanoid';
import { parseArray, parseBoolean } from 'src/utils';

export const _getPurchasePayload = (purchase: any = {}, oldPurchase: any = {}, user: any = {}) => {
  return {
    user_id: user.uid,
    uid: _.defaultTo(oldPurchase.uid, nanoid()),
    verified: parseBoolean(purchase.verified, false),
    products: parseArray(purchase.products, oldPurchase.products),
  };
};
