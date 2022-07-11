import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
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

const catalogBatchProcess = async (event, context, callback) => {
  // Logging incoming request
  console.log(event);

  // const sns = new SNSClient({ region: 'eu-west-1' });
  const dbClient = new Client(dbOptions);

  let response;
  try {
    await dbClient.connect();

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

    console.log('Parse records');

    for (const record of event.Records) {
      const data = JSON.parse(record.body);
      const hasFields =
        data &&
        data.hasOwnProperty('title') &&
        data.hasOwnProperty('description') &&
        data.hasOwnProperty('price');

      if (hasFields) {
        await dbClient.query('BEGIN');

        const query = `INSERT INTO products(title, description, price) VALUES ('${data.title}', '${data.description}', '${data.price}');`;
        await dbClient.query(query);

        await dbClient.query('COMMIT');

        console.log(
          `Row ${JSON.stringify(
            data
          )} sucessfully created. Trying send notification.`
        );
      } else {
        console.log('Wrong csv data');

        response = {
          statusCode: 400,
          body: JSON.stringify(
            {
              ok: true,
              message: 'Wrong csv data. File missing required fields.',
            },
            null,
            2
          ),
        };

        break;
      }
    }
  } catch (err) {
    response = {
      statusCode: 502,
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
    dbClient.end();
  }

  return response;
};

export default catalogBatchProcess;
