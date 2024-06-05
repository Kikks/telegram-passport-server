import { Request, Response } from 'express';
import passport from 'passport';

import { SUCCESSFUL } from '../../lib/constants';
import { failure, success } from '../../lib/response';
import { generateToken } from '../../lib/token';
import { Auth0User, OUser } from '../interfaces/user.intf';
import UserService from '../services/user.svc';
import { validateLoginInputs, validateRegisterInputs } from '../validators/auth.vld';

const handleRegisterAdmin = async (req: Request, res: Response) => {
  try {
    const authData = validateRegisterInputs(req, res);
    const user = await UserService.registerAdmin({
      userDetails: authData,
      password: authData.password,
    });

    return success({
      res,
      data: user,
      message: SUCCESSFUL,
      httpCode: 200,
    });
  } catch (error: any) {
    return failure({
      res,
      message: error.message || 'An error occured while registering admin.',
      errStack: error.stack,
      httpCode: error.code || 500,
    });
  }
};

const handleLoginAdmin = async (req: Request, res: Response) => {
  try {
    validateLoginInputs(req, res);
    return passport.authenticate('local', function (err: any, user: OUser) {
      if (err) {
        return failure({
          res,
          message: err,
          httpCode: 500,
        });
      }

      if (!user) {
        return failure({
          res,
          message: 'Email or password is incorrect',
          httpCode: 401,
        });
      }

      return success({
        res,
        data: {
          user,
          token: generateToken({
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          }),
        },
        message: SUCCESSFUL,
        httpCode: 200,
      });
    })(req, res);
  } catch (error: any) {
    return failure({
      res,
      message: error.message || 'An error occured while logging admin in.',
      errStack: error.stack,
      httpCode: error.code || 500,
    });
  }
};

const handleLogin = async (req: Request, res: Response) => {
  try {
    const userObject: Auth0User = res.locals.user;
    const country = req.body?.country;

    const existingUser = await UserService.getUser({ email: userObject?.email });
    let savedUser: OUser;

    if (existingUser) {
      if (
        existingUser.firstName !== userObject?.given_name ||
        existingUser.lastName !== userObject?.family_name ||
        existingUser.image !== userObject?.picture
      ) {
        existingUser.firstName = userObject?.given_name;
        existingUser.lastName = userObject?.family_name;
        existingUser.image = userObject?.picture;
        existingUser.country = country || 'NG';
        await existingUser.save();
      }

      savedUser = existingUser;
    } else {
      const newUser = await UserService.createUser({
        email: userObject?.email,
        firstName: userObject?.given_name,
        lastName: userObject?.family_name,
        image: userObject?.picture,
        role: 'user',
      });
      savedUser = newUser;
    }

    return success({
      res,
      data: savedUser,
      message: SUCCESSFUL,
      httpCode: 200,
    });
  } catch (error) {
    return failure({
      res,
      message: error.message || 'An error occured while logging user in.',
      errStack: error.stack,
      httpCode: error.code || 500,
    });
  }
};

export { handleRegisterAdmin, handleLoginAdmin, handleLogin };
