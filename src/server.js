require('dotenv').config();
import express from 'express';
import fileUpload from 'express-fileupload';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';

// import swaggerDocument from './swagger.json';

// import router from "./router";

const server = express();
server.use(cors());
server.use(express.json());

server.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    useTempFiles: true,
    tempFileDir: '/tmp/',
  })
);

server.use(
  morgan('tiny', {
    skip: () => (process.env.DB_ENV === 'test' ? true : false),
  })
);
server.use(helmet());

server.get('/', (req, res) => res.send('welcome to kc portfolio services'));
// server.use("/api", router);
// server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

server.use('/*', (req, res) => {
  return res.status(404).json({ error: 'path not found' });
});

server.use((err, req, res, next) => {
  // const error =
  //   process.env.NODE_EV === "production" ? "internal server error" : err;
  res.status(500).json({ error });
});

export default server;
