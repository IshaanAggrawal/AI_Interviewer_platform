import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import config from "../config";

const s3Client = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

/**
 * Uploads a file buffer to S3.
 */
export async function uploadToS3(params: {
  key: string;
  body: Buffer;
  contentType: string;
}) {
  const command = new PutObjectCommand({
    Bucket: config.aws.s3Bucket,
    Key: params.key,
    Body: params.body,
    ContentType: params.contentType,
  });

  await s3Client.send(command);

  return {
    key: params.key,
    bucket: config.aws.s3Bucket,
    url: `https://${config.aws.s3Bucket}.s3.${config.aws.region}.amazonaws.com/${params.key}`,
  };
}

/**
 * Generates a pre-signed URL for downloading a file from S3.
 * URL is valid for 1 hour by default.
 */
export async function getPresignedDownloadUrl(key: string, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: config.aws.s3Bucket,
    Key: key,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn });
  return { url, expiresIn };
}

/**
 * Generates a pre-signed URL for uploading a file directly to S3 from the frontend.
 * URL is valid for 1 hour by default.
 */
export async function getPresignedUploadUrl(key: string, contentType: string, expiresIn = 3600) {
  const command = new PutObjectCommand({
    Bucket: config.aws.s3Bucket,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn });
  return { 
    url, 
    expiresIn,
    key,
    publicUrl: `https://${config.aws.s3Bucket}.s3.${config.aws.region}.amazonaws.com/${key}`
  };
}
