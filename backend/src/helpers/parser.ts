// third party imports
import * as _ from 'lodash';
import * as nid from 'nanoid';
import * as bcrypt from 'bcrypt';
import { CreateOrUpdateUserDto } from 'src/dto';

export const _getParsedUserBody = (body: CreateOrUpdateUserDto) => {
  const {
    uid,
    name,
    email,
    roles,
    password,
    active,
    username,
    profile_picture,
  } = body;

  const payload: any = {
    name: _.defaultTo(name, null),
    uid: _.defaultTo(uid, nid.nanoid()),
    email: _.defaultTo(email, null),
    roles: _.defaultTo(roles, null),
    active: _.defaultTo(active, true),
    username: _.defaultTo(username, null),
    profile_picture: _.defaultTo(profile_picture, null),
  };

  if (password) {
    const saltRounds = 8;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);

    payload.password = hashedPassword;
  }

  if (!payload.roles) {
    payload.roles = ['user'];
  }

  return payload;
};
