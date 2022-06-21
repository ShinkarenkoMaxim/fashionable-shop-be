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

const createProduct = async (event) => {
  const client = new Client(dbOptions);

  await client.connect();

  let response;

  try {
    const data = JSON.parse(event.body);
    const hasFields =
      data &&
      data.hasOwnProperty('title') &&
      data.hasOwnProperty('description') &&
      data.hasOwnProperty('price');

    if (hasFields) {
      const query = `INSERT INTO products(title, description, price) VALUES ('${data.title}', '${data.description}', '${data.price}');`;

      await client.query(query);

      response = {
        statusCode: 201,
        headers: ACCESS_HEADERS,
        body: JSON.stringify(
          {
            ok: true,
            message: 'New product success created',
          },
          null,
          2
        ),
      };
    } else {
      response = {
        statusCode: 404,
        headers: ACCESS_HEADERS,
        body: JSON.stringify(
          {
            ok: false,
            message: 'Body does not contain the required fields',
          },
          null,
          2
        ),
      };
    }
  } catch (err) {
    if (err instanceof SyntaxError) {
      response = {
        statusCode: 400,
        headers: ACCESS_HEADERS,
        body: JSON.stringify(err.message, null, 2),
      };
    } else {
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
    }
  } finally {
    client.end();
  }

  return response;
};

export default createProduct;
