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
  if (!event.body) {
    return {
      body: "Empty request",
      statusCode: 400,
    };
  }
  const body: FormBody = JSON.parse(event.body);

  const jotform = new Jotform(process.env.JOTFORM_API_KEY);
  await jotform.create(body);
  await jotform.moveToFolder(process.env.JOTFORM_CUF_FOLDER_ID);

  return {
    body: JSON.stringify({ body: event.body }),
    statusCode: 200,
  };
}
