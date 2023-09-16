require('dotenv').config();
const constants = require('./constants')
const express = require("express");
const ParseServer = require("parse-server").ParseServer;
const ParseDashboard = require("parse-dashboard");
var S3Adapter = require('@parse/s3-files-adapter');
const { ApiPayloadConverter } = require('parse-server-api-mail-adapter');
const { SES, SendEmailCommand } = require('@aws-sdk/client-ses');


const sesClient = new SES(constants.SES);
const app = express()


// SERVER
const api = new ParseServer({
  // Common
  appName: constants.APP_NAME,
  appId: process.env.APP_ID,
  masterKey: process.env.MASTER_KEY,
  readOnlyMasterKey: process.env.READ_ONLY_MASTER_KEY,
  publicServerURL: `${process.env.HOST}:${process.env.PORT}${process.env.API_PATH}`,
  databaseURI: process.env.DB_URI,
  cloud: "./cloud/main.js",
  liveQuery: { classNames: constants.LIVE_QUERY_CLASSES },
  allowOrigin: "*",
  logLevel: 'error',

  // Schema, Security
  schema: { definitions: [constants.USER_SCHEMA, constants.LIVE_SCHEMA] },
  allowClientClassCreation: true,
  enableAnonymousUsers: true,
  revokeSessionOnPasswordChange: true,

  // S3
  fileUpload: {
    enableForPublic: false,
    enableForAnonymousUser: false,
    enableForAuthenticatedUser: true,
  },
  filesAdapter: new S3Adapter(
    process.env.AWS_ACCESS,
    process.env.AWS_SECRET,
    process.env.AWS_S3_BUCKET,
    { region: process.env.AWS_REGION }
  ),

  // Password
  accountLockout: {
    threshold: 3, // 3 failed log-in attempts
    duration: 5, // 5 minutes
    unlockOnPasswordReset: true
  },
  passwordPolicy: {
    validatorPattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/,
    doNotAllowUsername: true,
    maxPasswordHistory: 5
  },

  // Email
  /*
  verifyUserEmails: true,
  emailVerifyTokenValidityDuration: 1 * 60 * 60, // 1hr
  emailAdapter: {
    module: 'parse-server-api-mail-adapter',
    options: {
      sender: process.env.EMAIL_FROM,
      templates: {
        passwordResetEmail: {
          subjectPath: './views/templates/email/password_reset_email_subject.txt',
          textPath: './views/templates/email/password_reset_email.txt',
          htmlPath: './views/templates/email/password_reset_email.html'
        },
        verificationEmail: {
          subjectPath: './views/templates/email/verification_email_subject.txt',
          textPath: './views/templates/email/verification_email.txt',
          htmlPath: './views/templates/email/verification_email.html'
        },
        customEmail: {
          subjectPath: './views/templates/email/custom_email_subject.txt',
          textPath: './views/templates/email/custom_email.txt',
          htmlPath: './views/templates/email/custom_email.html',
          placeholders: { appName: constants.APP_NAME },
        }
      },
      apiCallback: async ({ payload, locale }) => {
        const awsSesPayload = ApiPayloadConverter.awsSes(payload);
        const command = new SendEmailCommand(awsSesPayload);
        await sesClient.send(command);
      }
    }
  },
  */

  // Social Auth
  auth: {
    google: {
      id: process.env.SOCIAL_GOOGLE_ID,
      id_token: process.env.SOCIAL_GOOGLE_TOKEN,
      access_token: process.env.SOCIAL_GOOGLE_ACCESS
    },
    facebook: {
      id: process.env.SOCIAL_FB_ID,
      access_token: process.env.SOCIAL_FB_ACCESS,
      expiration_date: process.env.SOCIAL_FB_EXPIRE
    },
    // More
  },

  // Push Notification
  /*
  push: {
    android: {
      senderId: "",
      apiKey: "",
    },
    ios: {
      pfx: "",
      passphrase: "",
      bundleId: ""
    },
  },
  */

  // Server-rate-limiting
  rateLimit: {
    requestPath: '*',
    requestTimeWindow: 10 * 60 * 1000, // 10 mins
    requestCount: 1000,
  },
})


// DASHBOARD
var options = { allowInsecureHTTP: true }
var dashboard = new ParseDashboard({
  apps: [
    {
      appId: process.env.APP_ID,
      masterKey: process.env.MASTER_KEY,
      readOnlyMasterKey: process.env.READ_ONLY_MASTER_KEY,
      serverURL: `${process.env.HOST}:${process.env.PORT}${process.env.API_PATH}`,
      appName: constants.APP_NAME,
    },
  ],
  users: [
    {
      user: process.env.ADMIN_USER,
      pass: process.env.ADMIN_PASS,
    },
    {
      user: process.env.ADMIN_USER + 'r',
      pass: process.env.ADMIN_PASS,
      readOnly: true
    }
  ]
}, options)


api.start()
app.use(process.env.API_PATH, api.app)
app.use(process.env.DASHBOARD_PATH, dashboard)

app.get("/", (req, res) => { res.send("Hello!") })

const httpServer = require("http").createServer(app)
httpServer.listen(process.env.PORT, "localhost", function () {
  console.log(`
  Parse is running on port ${process.env.PORT}.
  ${process.env.HOST}:${process.env.PORT}${process.env.DASHBOARD_PATH}\n`)
})

ParseServer.createLiveQueryServer(httpServer)


// https://docs.parseplatform.org/parse-server/guide/
// https://docs.parseplatform.org/cloudcode/guide/
// https://docs.parseplatform.org/js/guide/
// https://parseplatform.org/parse-server/api/master/ParseServerOptions.html
// https://webhook.site/
