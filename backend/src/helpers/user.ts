// third party imports
import * as _ from 'lodash';
import { nanoid } from 'nanoid';

// inner imports
import { CreateOrUpdateUserDto } from 'src/dto';
import { parseArray, parseBoolean } from 'src/utils';

export const _getUserPayload = (user: any = {}, oldUser: any = {}): CreateOrUpdateUserDto => {
  const payload = {
    active: parseBoolean(user.active, true),
    uid: _.defaultTo(oldUser.uid, nanoid()),
    name: _.defaultTo(user.name, oldUser.name),
    email: _.defaultTo(user.email, oldUser.email),
    roles: parseArray(user.roles, oldUser.roles),
    username: _.defaultTo(user.username, oldUser.username),
    password: _.defaultTo(user.hashed_password, oldUser.password),
    profile_picture: _.defaultTo(user.profile_picture, oldUser.profile_picture),
  };

  return payload;
};
