// third party imports
import * as _ from 'lodash';
import { nanoid } from 'nanoid';

export const _getUserPayload = (user: any = {}, oldUser: any = {}) => {
  const payload: any = {
    active: _.defaultTo(user.active, true),
    uid: _.defaultTo(oldUser.uid, nanoid()),
    name: _.defaultTo(user.name, oldUser.name),
    email: _.defaultTo(user.email, oldUser.email),
    roles: _.defaultTo(user.roles, oldUser.roles),
    username: _.defaultTo(user.username, oldUser.username),
    password: _.defaultTo(user.hashed_password, oldUser.password),
    profile_picture: _.defaultTo(user.profile_picture, oldUser.profile_picture),
  };

  return payload;
};
