import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { Vpc } from "aws-cdk-lib/aws-ec2";
import { Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import * as path from "path";

import { StackConfig } from "../interfaces/stack-settings";

export class ApiGatewayLambdaStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props?: StackProps,
    config?: StackConfig
  ) {
    super(scope, id, props);

    //Check environment type
    const isProd = config?.env === "prod";

    const envConfig = isProd
      ? require("./env-config-production.json")
      : require("./env-config-staging.json");

    // create a role for the lambda
    const lambdaRole = new Role(this, `${config?.projectName}-role`, {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        {
          managedPolicyArn:
            "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
        },
        {
          managedPolicyArn:
            "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole",
        },
      ],
    });

    const getExistingVpc = Vpc.fromLookup(this, "ImportVPC", {
      vpcId: "vpc-3e2dcd5a",
    });
    // Create a lambda function to process the queue
    const lambda = new NodejsFunction(this, `${config?.projectName}-lambda`, {
      memorySize: isProd ? 1024 : 512,
      timeout: Duration.seconds(5),
      runtime: Runtime.NODEJS_14_X,
      handler: "main",
      role: lambdaRole,
      vpc: getExistingVpc,
      entry: path.join(__dirname, `/../lambda/index.ts`),
      environment: {
        ...envConfig,
      },
    });

    const api = new LambdaRestApi(this, `${config?.projectName}-api`, {
      handler: lambda,
    });
  }
}
