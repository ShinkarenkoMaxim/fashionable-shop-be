import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import csv from 'csv-parser';

const importFileParser = async (event) => {
  const s3Client = new S3Client({ region: 'eu-west-1' });

  let response;
  try {
    for (let record of event.Records) {
      const objectKey = record.s3.object.key;
      const command = new GetObjectCommand({
        Bucket: 'fashionable-shop-uploaded',
        Key: objectKey,
      });

      const data = await s3Client.send(command);
      const stream = data.Body; // Get readable stream from body field

      stream
        .pipe(csv())
        .on('data', (data) => {
          console.log(data);
        })
        .on('end', () => {
          console.log('End of reading CSV');
        });
    }

    response = {
      statusCode: 200,
    };
  } catch (err) {
    // Logging errors to CloudWatch
    console.log(err);

    if (err instanceof SyntaxError) {
      response = {
        statusCode: 400,
        body: JSON.stringify(err.message, null, 2),
      };
    } else {
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
    }
  }

  return response;
};

export default importFileParser;
