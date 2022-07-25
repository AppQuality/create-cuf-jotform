import { APIGatewayProxyResultV2, APIGatewayEvent } from "aws-lambda";
import { Response } from "aws-sdk";
import fetch, { Headers } from "node-fetch";
import Jotform from "./Jotform";

export async function main(
  event: APIGatewayEvent
): Promise<APIGatewayProxyResultV2> {
  if (!process.env.JOTFORM_API_KEY || !process.env.JOTFORM_CUF_FOLDER_ID) {
    return {
      body: "Jotform is not configured",
      statusCode: 500,
    };
  }
  let body: FormBody;
  try {
    if (!event.body) throw new Error("Empty body");
    body = JSON.parse(event.body);
    checkBodyStructure(body);
  } catch (e) {
    return {
      body: JSON.stringify({
        error: "INVALID_BODY",
        message: (e as { message: string }).message,
      }),
      statusCode: 400,
    };
  }

  const jotform = new Jotform(process.env.JOTFORM_API_KEY);
  await jotform.create(body);
  await jotform.setThankYouPage(
    "https://webhook.site/effd43fc-1cd5-4c03-9146-22a037eba368"
  );
  await jotform.moveToFolder(process.env.JOTFORM_CUF_FOLDER_ID);

  return {
    body: JSON.stringify({ body: event.body }),
    statusCode: 200,
  };

  function checkBodyStructure(body: FormBody) {
    if (!body.title) throw new Error("Title is required");
  }
}
