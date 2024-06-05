import dotenv from 'dotenv';
import { VerifyOptions } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

dotenv.config();

const client = jwksClient({
  jwksUri: `${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
});

const auth0Options: VerifyOptions = {
  audience: process.env.AUTH0_CLIENT_ID,
  issuer: `${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256'],
};

const getKey = (header: any, cb: any) => {
  client.getSigningKey(header.kid, function (_: any, key: any) {
    const signingKey = key?.publicKey || key?.rsaPublicKey;
    cb(null, signingKey);
  });
};

export { getKey, auth0Options };
