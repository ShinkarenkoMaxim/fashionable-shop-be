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

const getProductsList = async () => {
  // Logging incoming request
  console.log(event);

  const client = new Client(dbOptions);

  await client.connect();

  let response;

  try {
    const query =
      'SELECT * FROM products LEFT JOIN stocks s on products.id = s.product_id;';
    const { rows: products } = await client.query(query);

    response = {
      statusCode: 200,
      headers: ACCESS_HEADERS,
      body: JSON.stringify(products, null, 2),
    };
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

export default getProductsList;
