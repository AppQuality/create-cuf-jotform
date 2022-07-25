import { APIGatewayEvent } from "aws-lambda";

const body = JSON.stringify({
  title: "My test form",
  questions: [
    {
      title: "Quale è il tuo nome?",
      type: "text",
      cufId: 1,
    },
    {
      title: "Quale è la tua banca?",
      type: "multiselect",
      cufId: 2,
      options: [
        { id: 1, name: "Banca1" },
        { id: 2, name: "Banca2" },
      ],
    },
    {
      title: "Quant figli hai?",
      type: "select",
      cufId: 3,
      options: [
        { id: 3, name: "0" },
        { id: 4, name: "1000" },
      ],
    },
  ],
});
const event: APIGatewayEvent = {
  body: body,
  headers: {},
  multiValueHeaders: {},
  httpMethod: "",
  isBase64Encoded: false,
  path: "",
  pathParameters: {},
  queryStringParameters: {},
  multiValueQueryStringParameters: {},
  stageVariables: {},
  requestContext: {
    accountId: "",
    apiId: "",
    authorizer: {},
    connectedAt: 0,
    connectionId: "",
    domainName: "",
    protocol: "",
    httpMethod: "",
    identity: {
      accessKey: "",
      accountId: "",
      apiKey: "",
      apiKeyId: "",
      caller: "",
      cognitoAuthenticationProvider: "",
      cognitoAuthenticationType: "",
      cognitoIdentityId: "",
      cognitoIdentityPoolId: "",
      sourceIp: "",
      user: "",
      userArn: "",
      userAgent: "",
      principalOrgId: "",
      clientCert: {
        clientCertPem: "",
        serialNumber: "",
        subjectDN: "",
        issuerDN: "",
        validity: {
          notAfter: "",
          notBefore: "",
        },
      },
    },
    path: "",
    stage: "",
    requestId: "",
    requestTimeEpoch: 0,
    resourceId: "",
    resourcePath: "",
  },
  resource: "",
};

import { main } from "../lambda";
require("dotenv").config();

async function test() {
  const res = await main(event);
  console.log(res);
}

test();
