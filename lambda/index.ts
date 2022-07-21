import { APIGatewayProxyResultV2, APIGatewayEvent } from "aws-lambda";

export async function main(
  event: APIGatewayEvent
): Promise<APIGatewayProxyResultV2> {
  return {
    body: JSON.stringify({ body: event.body }),
    statusCode: 200,
  };
}
