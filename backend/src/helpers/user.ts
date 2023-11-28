// third party imports
import * as _ from 'lodash';

export const _getUserPayload = (user: any = {}, oldUser: any = {}) => {
  const payload: any = {
    age: _.defaultTo(user.age, oldUser.age),
    active: _.defaultTo(user.active, true),
    uid: _.defaultTo(user.uid, oldUser.uid),
    name: _.defaultTo(user.name, oldUser.name),
    email: _.defaultTo(user.email, oldUser.email),
    roles: _.defaultTo(user.roles, oldUser.roles),
    username: _.defaultTo(user.username, oldUser.username),
    password: _.defaultTo(user.password, oldUser.password),
    profile_picture: _.defaultTo(user.profile_picture, oldUser.profile_picture),
  };

  return payload;
};
