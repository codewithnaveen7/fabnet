const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { randomUUID } = require('crypto');
const path = require('path');
const config = require('../config/env');
const ApiError = require('../utils/ApiError');

let client;

function getClient() {
  if (!config.s3.isConfigured) {
    throw ApiError.internal('S3 storage is not configured. Set S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY.');
  }
  if (!client) {
    client = new S3Client({
      endpoint: config.s3.endpoint,
      region: config.s3.region,
      credentials: {
        accessKeyId: config.s3.accessKeyId,
        secretAccessKey: config.s3.secretAccessKey,
      },
      forcePathStyle: true,
    });
  }
  return client;
}

function safeFileName(originalName) {
  const base = path.basename(originalName || 'file').replace(/[^a-zA-Z0-9._-]/g, '_');
  return base.slice(0, 180) || 'file';
}

function buildObjectKey(ownerId, kind, type, originalName) {
  const name = safeFileName(originalName);
  const id = randomUUID();
  if (kind === 'rfq') {
    return `rfqs/${ownerId}/drawings/${id}-${name}`;
  }
  if (kind === 'cert') {
    return `suppliers/${ownerId}/certs/${type}/${id}-${name}`;
  }
  return `suppliers/${ownerId}/docs/${type}/${id}-${name}`;
}

async function uploadObject({ key, body, contentType }) {
  const s3 = getClient();
  await s3.send(
    new PutObjectCommand({
      Bucket: config.s3.bucket,
      Key: key,
      Body: body,
      ContentType: contentType || 'application/octet-stream',
    })
  );
  return key;
}

async function deleteObject(key) {
  if (!key) return;
  if (!config.s3.isConfigured) return;
  const s3 = getClient();
  try {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: config.s3.bucket,
        Key: key,
      })
    );
  } catch {
    // Best-effort delete; DB row is source of truth for UI
  }
}

async function getPresignedGetUrl(key, expiresIn = 300) {
  const s3 = getClient();
  const command = new GetObjectCommand({
    Bucket: config.s3.bucket,
    Key: key,
  });
  const url = await getSignedUrl(s3, command, { expiresIn });
  return { url, expiresIn };
}

module.exports = {
  buildObjectKey,
  uploadObject,
  deleteObject,
  getPresignedGetUrl,
  safeFileName,
};
