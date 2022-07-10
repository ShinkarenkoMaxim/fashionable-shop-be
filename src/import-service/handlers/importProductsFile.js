import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const ACCESS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
};

const importProductsFile = async (event) => {
  // Logging incoming request
  console.log(event);

  let response;
  try {
    const s3Client = new S3Client({ region: 'eu-west-1' });
    const filePath = 'uploaded/' + event.queryStringParameters.name;
    const command = new PutObjectCommand({
      Bucket: 'fashionable-shop-uploaded',
      Key: filePath,
    });
    const url = await getSignedUrl(s3Client, command);

    return {
      statusCode: 200,
      headers: ACCESS_HEADERS,
      body: url,
    };
  } catch (err) {
    // Logging errors to CloudWatch
    console.log(err);

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
  }

  return response;
};

export default importProductsFile;
