import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const products = require('../productsList.json');

const getProductsById = async (event) => {
  const { id } = event.pathParameters;
  const productInfo = products.find((product) => product.id === id);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(productInfo),
  };
};

export default getProductsById;
