'use strict';

import dotenv from 'dotenv';
dotenv.config();

const bcrypt = require('bcryptjs');
const password = bcrypt.hashSync('testng', Number(process.env.BCRYPT_SALT));

module.exports = {
  // eslint-disable-next-line no-unused-vars
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [
      {
        firstName: 'kingsley',
        lastName: 'eneja',
        email: 'eneja.kc@gmail.com',
        password,
        image:
          'https://res.cloudinary.com/dmx0a3nqi/image/upload/t_media_lib_thumb/v1571040003/gbart8vc5ervfmccdqlm.png',
      },
      {
        firstName: 'chiamaka',
        lastName: 'eneja',
        email: 'enejapeacemc@gmail.com',
        password,
      },
    ]);
  },

  // eslint-disable-next-line no-unused-vars
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  },
};
