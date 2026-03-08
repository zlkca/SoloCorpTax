const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

async function uploadFile(key, body, contentType) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
    ServerSideEncryption: 'AES256',
  };

  return s3.upload(params).promise();
}

async function getSignedUrl(key, expiresIn = 3600) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Expires: expiresIn,
  };

  return s3.getSignedUrlPromise('getObject', params);
}

async function deleteFile(key) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
  };

  return s3.deleteObject(params).promise();
}

module.exports = {
  s3,
  uploadFile,
  getSignedUrl,
  deleteFile,
  BUCKET_NAME,
};
