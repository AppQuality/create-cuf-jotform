import { APIGatewayProxyResultV2, APIGatewayEvent } from "aws-lambda";
import Jotform from "./Jotform";

const defaultHeaders = {
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
};
export async function main(
  event: APIGatewayEvent
): Promise<APIGatewayProxyResultV2> {
  if (
    !process.env.JOTFORM_API_KEY ||
    !process.env.JOTFORM_CUF_FOLDER_ID ||
    !process.env.THANKYOU_PAGE_REDIRECT_URL
  ) {
    return {
      body: "Jotform is not configured",
      headers: defaultHeaders,
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
      headers: defaultHeaders,
      statusCode: 400,
    };
  }

  const jotform = new Jotform(process.env.JOTFORM_API_KEY);

  try {
    const completedUrl = jotform.getCreateFormUrl(body);
    if (completedUrl.length > 7700) {
      throw new Error("TOO_LONG_REQUEST: Failed to create form.");
    }
  } catch (e) {
    return {
      body: JSON.stringify({
        error: "INVALID_BODY",
        message: (e as { message: string }).message,
      }),
      headers: defaultHeaders,
      statusCode: 431,
    };
  }

  await jotform.create(body);
  await jotform.setThankYouPage(process.env.THANKYOU_PAGE_REDIRECT_URL);
  await jotform.moveToFolder(process.env.JOTFORM_CUF_FOLDER_ID);
  return {
    body: JSON.stringify({
      url: `${jotform.jotformUrl}?testerId={Extra.crypted_id}`,
    }),
    headers: defaultHeaders,
    statusCode: 200,
  };

  function checkBodyStructure(body: FormBody) {
    if (!body.title) throw new Error("Title is required");
    if (!body.questions) throw new Error("At least one question is required");
    body.questions.forEach((question) => {
      if (!question.title) throw new Error("Question title is required");
      if (!question.type) throw new Error("Question type is required");
      if (!question.cufId) throw new Error("CustomUserField_ID is required");
      if (
        (question.type === "select" || question.type === "multiselect") &&
        !question.options
      )
        throw new Error("Question options are required");
    });
  }
}
