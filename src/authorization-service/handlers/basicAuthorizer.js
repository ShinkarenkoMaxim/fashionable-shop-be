const basicAuthorizer = (event, ctx, cb) => {
  // Logging incoming request
  console.log(event);

  if (event.type !== 'TOKEN') {
    cb('Unauthorized');
  }

  try {
    const { authorizationToken, methodArn } = event;
    const encodedData = authorizationToken.split(' ')[1];
    const [username, password] = parseCredentials(encodedData);

    console.log(`Received credentials: ${username} ${password}`);

    const storedUserPassword = process.env[username];
    const effect =
      !storedUserPassword || storedUserPassword !== password ? 'Deny' : 'Allow';

    console.log('Access effect:', effect);

    const policy = generatePolicy(encodedData, methodArn, effect);

    cb(null, policy);
  } catch (err) {
    cb(`Unauthorized: ${err.message}`);
  }
};

const parseCredentials = (encodedData) =>
  Buffer.from(encodedData, 'base64').toString('utf-8').split(':');

const generatePolicy = (principalId, resource, effect) => ({
  principalId,
  policyDocument: {
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'execute-api:Invoke',
        Effect: effect,
        Resource: resource,
      },
    ],
  },
});

export default basicAuthorizer;
