// third party imports
import * as _ from 'lodash';
import * as bcrypt from 'bcrypt';
import { CreateOrUpdateUserDto } from 'src/dto';

export const _getParsedUserBody = (body: CreateOrUpdateUserDto): CreateOrUpdateUserDto => {
  const { uid, name, email, roles, password, active, username, profile_picture } = body;

  const payload: any = {
    name: _.defaultTo(name, null),
    uid: _.defaultTo(uid, null),
    email: _.defaultTo(email, null),
    roles: _.defaultTo(roles, null),
    active: _.defaultTo(active, true),
    username: _.defaultTo(username, null),
    password: _.defaultTo(password, null),
    profile_picture: _.defaultTo(profile_picture, null),
  };

  if (password) {
    const saltRounds = 8;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);

    // additional property of hashed_password
    payload.hashed_password = hashedPassword;
  }

  if (!payload.roles) {
    payload.roles = ['user'];
  }

  return payload;
};

export const _getParsedParams = (params: any = {}) => {
  return {
    userId: params.user_id,
  };
};

export const _getParsedUserResponsePayload = (user: any) => {
  user = JSON.parse(JSON.stringify(user));

  // delete unnecessary properties
  delete user.$setOnInsert;
  delete user._id;
  delete user.__v;
  delete user.password;
  delete user.active;
  delete user.roles;
  delete user.created_at;
  delete user.updated_at;

  return user;
};
