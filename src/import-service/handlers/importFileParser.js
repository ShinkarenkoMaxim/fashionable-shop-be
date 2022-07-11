import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import csv from 'csv-parser';

const importFileParser = async (event) => {
  const bucketName = 'fashionable-shop-uploaded';
  const s3Client = new S3Client({ region: 'eu-west-1' });
  const sqsClient = new SQSClient({ region: 'eu-west-1' });

  let response;
  try {
    for (let record of event.Records) {
      const objectKey = record.s3.object.key;
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      });
      const response = await s3Client.send(command);

      const moveFileOperation = async () => {
        console.log('End of reading CSV');
        console.log('Move file to parsed');

        const copyCommand = new CopyObjectCommand({
          Bucket: bucketName,
          CopySource: bucketName + '/' + objectKey,
          Key: objectKey.replace('uploaded', 'parsed'),
        });

        console.log('Start copying operation');
        await s3Client.send(copyCommand);

        const deleteCommand = new DeleteObjectCommand({
          Bucket: bucketName,
          Key: objectKey,
        });

        console.log('Start deleting operation');
        await s3Client.send(deleteCommand);

        console.log('Copy of object', objectKey, 'is created');
      };

      const streamProcessing = (stream) => {
        return new Promise((resolve, reject) => {
          stream
            .pipe(csv())
            .on('error', (err) => reject(err))
            .on('data', async (row) => {
              console.log('Send row to queue:', JSON.stringify(row, null, 2));

              try {
                const command = new SendMessageCommand({
                  MessageBody: JSON.stringify(row),
                  QueueUrl: process.env.SQS_URL,
                });
                await sqsClient.send(command);
              } catch (err) {
                console.log('Error with sending message to SQS:', err);
              }
            })
            .on('end', async () => {
              await moveFileOperation();
              resolve();
            });
        });
      };

      // Async getting stream
      await streamProcessing(response.Body); // Get readable stream from body field
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
