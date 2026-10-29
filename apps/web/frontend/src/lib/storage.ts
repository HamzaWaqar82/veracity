import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";

export const BUCKET_NAME = "assets";

function getS3Client(): S3Client | null {
  const endpoint = process.env.AWS_ENDPOINT_URL_S3;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION || "us-east-2";

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    return null;
  }

  return new S3Client({
    endpoint,
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true, // Required: Neon Object Storage requires path-style addressing
  });
}

export const s3 = getS3Client();

export type StorageHealthResult = {
  ok: boolean;
  bucket: string;
  testKey?: string;
  roundTripVerified?: boolean;
  error?: string;
};

export async function uploadAsset(
  key: string,
  content: string | Uint8Array | Buffer,
  contentType = "text/plain"
) {
  const client = getS3Client();
  if (!client) {
    throw new Error("Neon Object Storage environment variables are missing.");
  }

  const body = typeof content === "string" ? Buffer.from(content) : content;

  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  return { bucket: BUCKET_NAME, key };
}

export async function getAsset(key: string): Promise<string> {
  const client = getS3Client();
  if (!client) {
    throw new Error("Neon Object Storage environment variables are missing.");
  }

  const response = await client.send(
    new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
  );

  const bytes = await response.Body?.transformToByteArray();
  if (!bytes) {
    return "";
  }
  return new TextDecoder().decode(bytes);
}

export async function deleteAsset(key: string) {
  const client = getS3Client();
  if (!client) {
    throw new Error("Neon Object Storage environment variables are missing.");
  }

  await client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
  );
}

export async function listAssets(prefix?: string) {
  const client = getS3Client();
  if (!client) {
    throw new Error("Neon Object Storage environment variables are missing.");
  }

  const response = await client.send(
    new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
    })
  );

  return (response.Contents || []).map((item) => ({
    key: item.Key,
    size: item.Size,
    lastModified: item.LastModified,
  }));
}

export async function checkStorageHealth(): Promise<StorageHealthResult> {
  const client = getS3Client();
  if (!client) {
    return {
      ok: false,
      bucket: BUCKET_NAME,
      error: "Neon Object Storage credentials (AWS_*) are not configured in environment.",
    };
  }

  const testKey = `health-check/${Date.now()}-probe.txt`;
  const probeData = `neon-storage-verification-${Date.now()}`;

  try {
    // 1. Put
    await uploadAsset(testKey, probeData, "text/plain");

    // 2. Get & verify
    const readBack = await getAsset(testKey);
    const verified = readBack === probeData;

    // 3. Clean up
    await deleteAsset(testKey);

    return {
      ok: verified,
      bucket: BUCKET_NAME,
      testKey,
      roundTripVerified: verified,
    };
  } catch (err: unknown) {
    return {
      ok: false,
      bucket: BUCKET_NAME,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
