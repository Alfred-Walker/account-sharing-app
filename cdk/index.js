"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//index.ts
const cdk = require("@aws-cdk/core");
const stack_1 = require("./stack");
const app = new cdk.App();
new stack_1.Stack(app, 'ReactAppStack');
