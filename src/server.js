const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
import http from 'http';

import Notif from './utils/Notification';

const bodyParser = require('body-parser');
const dotenv = require('dotenv');

const swaggerDoc = require('./swagger.json');

import routes from './router';

dotenv.config();
const server = express();

server.use(helmet());
server.use(cors());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

server.use(
  morgan('dev', {
    skip: () => (process.env.NODE_ENV === 'test' ? true : false),
  })
);
server.use(express.static(path.join(__dirname, '../doc')));
server.use(express.static(path.join(__dirname, '../dev-doc')));

// log all requests to logger.log
if (process.env.NODE_ENV === 'production') {
  const date = new Date();
  const filename =
    date.getDay() +
    '-' +
    date.getMonth() +
    '-' +
    date.getFullYear() +
    'logger.logs';
  server.use(
    morgan('common', {
      skip: (req, res) => res.statusCode < 400,
      stream: fs.createWriteStream(path.join(__dirname, filename), {
        flags: 'a',
      }),
    })
  );
}

server.use('/api', routes);
server.use((error, req, res, next) => {
  if (error) {
    res.status(500).json({ error });
  } else {
    next();
  }
});

server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
server.all('/doc', function (req, res) {
  res.sendFile(path.join(__dirname, '../doc/index.html'));
});
server.all('/dev-doc', function (req, res) {
  res.sendFile(path.join(__dirname, '../dev-doc/index.html'));
});

server.all(['/', '/ping'], function (req, res) {
  res.status(200).json('success');
});

server.use(function (req, res) {
  res.status(404).json({ error: 'path not found' });
});

const socketServer = http.createServer(server);
const Notification = new Notif(socketServer);
Notification.start();

export default { server, Notification };
