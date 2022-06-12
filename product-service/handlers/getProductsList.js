import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const products = require('../productsList.json');

const getProductsList = async () => {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(products),
  };
};

export default getProductsList;
