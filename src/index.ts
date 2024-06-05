import * as dotenv from 'dotenv';
import crypto from 'crypto';
dotenv.config();

import * as http from 'http';
import passport from 'passport';
import session from 'express-session';

// import jobs from './api/jobs';
import { NODE_ENV, PORT } from './api/lib/constants';
// import { startdb } from './db';
import { ootpAPI } from './server';
import axios from 'axios';

/** Normalize a port into a number, string, or false. */
const normalizePort = (val: string): number => {
  const connPort = parseInt(val, 10);
  return connPort >= 0 ? connPort : isNaN(connPort) ? 9999 : 0;
};

/** Event listener for HTTP server "error" event. */
const onError = (error: any) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`${error.code}: ${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${error.code}: ${bind} is already in use`);
      process.exit(1);
      break;
    default:
      console.error(`${error.code}: an unknow error occured.`);
      throw error;
  }
};

const nodeEnv: string | undefined = NODE_ENV;
const port: number = normalizePort(PORT || '5001');

/** Event listener for HTTP server "listening" event. */
const onListening = () => {
  const addr = server.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr?.port}`;
  if (process.env.NODE_ENV !== 'test') {
    console.info(`Listening on ${bind} in ${nodeEnv} environment`);
  }
};

/** Initialize api service */
const api = new ootpAPI();
const app = api.app;

app.use(session({ secret: 'secret' }));
app.use(passport.initialize());
app.use(passport.session());

app.set('port', port);

const BOT_TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

/** Create HTTP server. */
const server: http.Server = http.createServer(app);

const decryptData = (encryptedData: any, key: any, iv: any) => {
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(key, 'base64'),
    Buffer.from(iv, 'base64')
  );
  let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

axios
  .post(`${TELEGRAM_API}/setWebhook`, {
    url: 'https://e4c0-102-89-34-210.ngrok-free.app/webhook',
  })
  .then((response) => {
    console.log('Webhook set:', response.data);
  })
  .catch((error) => {
    console.error('Error setting webhook:', error.response.data);
  });

app.post('/webhook', (req, res) => {
  const update = req.body;

  if (update.message && update.message.passport_data) {
    const passportData = update.message.passport_data;

    // Handle each passport data credential
    for (const credential of passportData.data) {
      const encryptedData = credential.data;
      const key = 'YOUR_ENCRYPTION_KEY'; // Your decryption key
      const iv = credential.iv;

      const decryptedData = decryptData(encryptedData, key, iv);
      console.log('Decrypted Data:', decryptedData);
    }
  }

  res.sendStatus(200);
});

app.post('/verify', (req, res) => {
  console.log('Verification data:', req.body);
  // Handle the authentication process here
  res.status(200).json({ success: true });
});

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

export { server, app };
