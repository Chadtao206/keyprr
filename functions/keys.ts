import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda";
import {
  DynamoDBClient,
  DynamoDBClientConfig,
  PutItemCommand,
  GetItemCommand,
} from "@aws-sdk/client-dynamodb";
import { nanoid } from "nanoid";
import crypto from "crypto";

const { AWS_REGION, accessKeyId, secretAccessKey, IS_OFFLINE, KEYPRR_SECRET } =
  process.env;

const algorithm = "aes-256-ctr";

const config: DynamoDBClientConfig = {
  region: AWS_REGION,
  credentials: {
    accessKeyId: accessKeyId || "",
    secretAccessKey: secretAccessKey || "",
  },
};
//use env variables in local access only
const client =
  IS_OFFLINE === "true" ? new DynamoDBClient(config) : new DynamoDBClient({});

const encrypt = (text: string) => {
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, KEYPRR_SECRET || "", iv);

  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return {
    iv: iv.toString("hex"),
    content: encrypted.toString("hex"),
  };
};

const decrypt = (hash: { iv: string; content: string }) => {
  const decipher = crypto.createDecipheriv(
    algorithm,
    KEYPRR_SECRET || "",
    Buffer.from(hash.iv, "hex")
  );

  const decrpyted = Buffer.concat([
    decipher.update(Buffer.from(hash.content, "hex")),
    decipher.final(),
  ]);

  return decrpyted.toString();
};

const sendJSON = (body: { [key: string]: any }, statusCode = 200) => {
  return {
    statusCode,
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Allow-Headers":
        "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent,X-Amzn-Trace-Id",
      "Access-Control-Max-Age": "600", //10 min cached preflight
      "Access-Control-Expose-Headers":
        "Content-Type,X-Amz-Date,X-Api-Key,X-Amz-User-Agent,X-Amzn-Trace-Id",
    },
  };
};

export const get: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
) => {
  try {
    const params = event.pathParameters;
    if (!params) return sendJSON({ message: "Bad request" }, 400);
    const { keyid } = params;
    if (!keyid) return sendJSON({ message: "No key id provided" }, 400);
    const command = new GetItemCommand({
      TableName: "key-store-dev",
      Key: {
        pk: {
          S: keyid,
        },
      },
    });
    const { Item } = await client.send(command);
    if (!Item) return sendJSON({ success: false, data: "" });
    const decrypted = decrypt({
      iv: Item.iv.S || "",
      content: Item.content.S || "",
    });

    return sendJSON({ success: true, data: decrypted });
  } catch (err) {
    return sendJSON({ success: false, data: err });
  }
};

export const create: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
) => {
  const { body } = event;
  if (!body) return sendJSON({ message: "No payload received" }, 400);
  const { secret } = JSON.parse(body);
  if (!secret) return sendJSON({ message: "No secret to store" }, 400);
  const { iv, content } = encrypt(secret);
  const uuid = nanoid();
  const ddbDoc = {
    pk: {
      S: uuid,
    },
    iv: {
      S: iv,
    },
    content: {
      S: content,
    },
  };
  const command = new PutItemCommand({
    TableName: "key-store-dev",
    Item: ddbDoc,
  });
  await client.send(command);

  return sendJSON({ success: true, data: uuid });
};
