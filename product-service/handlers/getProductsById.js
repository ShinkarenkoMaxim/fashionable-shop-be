import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { Client } = require('pg');

const { PG_HOST, PG_PORT, PG_DATABASE, PG_USERNAME, PG_PASSWORD } = process.env;

const dbOptions = {
  host: PG_HOST,
  port: PG_PORT,
  database: PG_DATABASE,
  user: PG_USERNAME,
  password: PG_PASSWORD,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 5000,
};

const ACCESS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
};

const getProductsById = async (event) => {
  const { id: productId } = event.pathParameters;

  const client = new Client(dbOptions);

  await client.connect();

  let response;

  try {
    const query = `SELECT * FROM products WHERE id='${productId}';`;
    const { rows: product } = await client.query(query);

    if (product.length > 0) {
      response = {
        statusCode: 200,
        headers: ACCESS_HEADERS,
        body: JSON.stringify(product, null, 2),
      };
    } else {
      response = {
        statusCode: 404,
        headers: ACCESS_HEADERS,
        body: JSON.stringify(
          {
            ok: 'false',
            message: 'Product not found',
          },
          null,
          2
        ),
      };
    }
  } catch (err) {
    console.log('Database request error', err);

    response = {
      statusCode: 502,
      headers: ACCESS_HEADERS,
      body: JSON.stringify(
        {
          ok: 'false',
          message: 'Internal Server Error',
        },
        null,
        2
      ),
    };
  } finally {
    client.end();
  }

  return response;
};

export default getProductsById;
