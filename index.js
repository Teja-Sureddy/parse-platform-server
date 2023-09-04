require('dotenv').config();
const express = require("express");
const ParseServer = require("parse-server").ParseServer;
const ParseDashboard = require("parse-dashboard");
var S3Adapter = require('@parse/s3-files-adapter');
const { ApiPayloadConverter } = require('parse-server-api-mail-adapter');
const { SES, SendEmailCommand } = require('@aws-sdk/client-ses');

const sesClient = new SES({
  accessKeyId: process.env.AWS_ACCESS,
  secretAccessKey: process.env.AWS_SECRET,
  region: process.env.AWS_S3_REGION
});

const app = express()
const APP_NAME = 'Application1'
const PERMISSIONS = {
  "class1": {
    create: { "role:admin": true },
    read: {},
    update: {},
    delete: { "role:admin": true }
  },
}
const LIVE_QUERY_CLASSES = ['class1']
const USER_SCHEMA = {
  className: "_User",
  fields: {
    first_name: { type: "String", required: true },
    phone: { type: "Number", required: true },
    is_active: { type: "Boolean", default: true },
    birth_date: { type: "Date" },
    location: { type: "GeoPoint" },
    zone: { type: "Polygon" },
    picture: { type: "File" },
    tags: { type: "Array" },
    metadata: { type: "Object" },
    city: { type: "Pointer", targetClass: "City" },
    friends: { type: "Relation", targetClass: "_User" },
  },
  indexes: {
    birthdateIndex: { birth_date: 1 },
    nameAndPhoneIndex: { first_name: 1, phone: 1 },
    // The special prefix _p_ is used to create indexes on pointer fields
    cityPointerIndex: { _p_city: 1 },
    friendsIndex: { friends: 1 }
  },
  classLevelPermissions: {
    find: { requiresAuthentication: true },
    count: { requiresAuthentication: true },
    get: { requiresAuthentication: true },
    create: { "role:Admin": true },
    update: { "role:Admin": true },
    delete: { "role:Admin": true },
    protectedFields: {
      // These fields will be protected from all other users. AuthData and password are already protected by default
      "*": ["authData", "emailVerified", "password", "username"],
    }
  },
}

// SERVER
const api = new ParseServer({
  // Common
  appName: APP_NAME,
  appId: process.env.APP_ID,
  masterKey: process.env.MASTER_KEY,
  publicServerURL: `${process.env.HOST}:${process.env.PORT}${process.env.API_PATH}`,
  databaseURI: process.env.DB_URI,
  allowOrigin: "*",
  logLevel: 'error',

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
  // verifyUserEmails: true,
  // emailVerifyTokenValidityDuration: 1 * 60 * 60, // 1hr
  // emailAdapter: {
  //   module: 'parse-server-api-mail-adapter',
  //   options: {
  //     sender: process.env.EMAIL_FROM,
  //     templates: {
  //       passwordResetEmail: {
  //         subjectPath: './views/templates/email/password_reset_email_subject.txt',
  //         textPath: './views/templates/email/password_reset_email.txt',
  //         htmlPath: './views/templates/email/password_reset_email.html'
  //       },
  //       verificationEmail: {
  //         subjectPath: './views/templates/email/verification_email_subject.txt',
  //         textPath: './views/templates/email/verification_email.txt',
  //         htmlPath: './views/templates/email/verification_email.html'
  //       },
  //       customEmail: {
  //         subjectPath: './views/templates/email/custom_email_subject.txt',
  //         textPath: './views/templates/email/custom_email.txt',
  //         htmlPath: './views/templates/email/custom_email.html',
  //         placeholders: { appName: APP_NAME },
  //       }
  //     },
  //     apiCallback: async ({ payload, locale }) => {
  //       const awsSesPayload = ApiPayloadConverter.awsSes(payload);
  //       const command = new SendEmailCommand(awsSesPayload);
  //       await sesClient.send(command);
  //     }
  //   }
  // },

  // Schema
  schema: { definitions: [USER_SCHEMA] },

  // Cloud
  cloud: "./cloud/main.js",

  // Amazon S3
  filesAdapter: new S3Adapter(
    process.env.AWS_ACCESS,
    process.env.AWS_SECRET,
    process.env.AWS_S3_BUCKET,
    { region: process.env.AWS_REGION }
  ),

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

  // Security
  allowClientClassCreation: false,
  enableAnonymousUsers: true,
  revokeSessionOnPasswordChange: true,
  classLevelPermissions: PERMISSIONS,

  // LiveQuery
  liveQuery: { classNames: LIVE_QUERY_CLASSES },

  // Push Notification
  // push: {
  //   android: {
  //     senderId: "",
  //     apiKey: "",
  //   },
  //   ios: {
  //     pfx: "",
  //     passphrase: "",
  //     bundleId: ""
  //   },
  // },

  // Server-rate-limiting (1000 requests per 10 mins)
  rateLimit: {
    requestPath: '*',
    requestTimeWindow: 10 * 60 * 1000,
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
      serverURL: `${process.env.HOST}:${process.env.PORT}${process.env.API_PATH}`,
      appName: APP_NAME
    },
  ],
  users: [
    {
      user: process.env.ADMIN_USER,
      pass: process.env.ADMIN_PASS
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
