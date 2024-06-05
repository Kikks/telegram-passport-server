import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { auth0Options, getKey } from '../../clients/jwks';
import { JWT_SECRET_KEY } from '../lib/constants';
import { failure } from '../lib/response';

const checkAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split('Bearer ')[1];

    try {
      const user = jwt.verify(token, JWT_SECRET_KEY as string) as any;

      if (!user) return failure({ message: 'Invalid/Expired Token.', httpCode: 403, res });
      if (user?.role !== 'admin') return failure({ message: 'Unauthorized.', httpCode: 403, res });

      res.locals.user = user;
      return next();
    } catch (error) {
      return failure({
        message: 'Invalid/Expired Token.',
        httpCode: 403,
        res,
      });
    }
  } else {
    return failure({
      message: 'Authentication header must be provided.',
      httpCode: 401,
      res,
    });
  }
};

const checkUser = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split('Bearer ')[1];
    if (token) {
      try {
        return jwt.verify(token, getKey, auth0Options, (err, decoded) => {
          if (err) {
            return failure({
              message: 'Could not verify token.',
              httpCode: 500,
              res,
            });
          }

          res.locals.user = decoded;
          return next();
        });
      } catch (error) {
        return failure({
          message: 'Invalid/Expired Token.',
          httpCode: 403,
          res,
        });
      }
    }
    return failure({
      message: 'Authentication token must be "Bearer [token]"',
      httpCode: 401,
      res,
    });
  }
  return failure({
    message: 'Authentication header must be provided.',
    httpCode: 401,
    res,
  });
};

export { checkAdmin, checkUser };
