import {Client as WorkflowClient} from "@upstash/workflow";

import {QSTASH_TOKEN,QSTASH_URL,UPSTASH_URL} from "./env.js";

const baseUrl = QSTASH_URL || UPSTASH_URL;

export const workflowClient = new WorkflowClient({
baseUrl,
token:QSTASH_TOKEN,


})