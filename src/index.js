require('dotenv').config();

import server from './server';

const port = process.env.PORT || 3000;

server.listen(port, () => {
  const { log } = console;
  log(`*** server running on port ${port} ***`);
});
