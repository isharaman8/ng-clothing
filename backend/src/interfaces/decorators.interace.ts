import { Request, Response } from 'express';

export interface CRequest extends Request {
  user?: any;
}

export interface CResponse extends Response {}
