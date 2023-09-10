const chalk = require('chalk')


const validationRules = request => { return } // return or throw based on the authorization
const cloud_config = { requireUser: false, rateLimit: { requestTimeWindow: 1 * 60 * 1000, requestCount: 10 } } // 1 min

Parse.Cloud.define("getTime", function (request) {
    var date = new Date()
    return date
}, cloud_config, validationRules)


const paramsConfig = { fields: { text: { required: true, type: String, error: "Text Required." } } }

Parse.Cloud.define("getParams", function (request) {
    const { params } = request
    console.log(params);
    return params
}, paramsConfig)


Parse.Cloud.define("getConfig", async function (request) {
    const config = await Parse.Config.get()
    return config.attributes
})


// TRIGGERS
Parse.Cloud.beforeSave(Parse.User, request => {
    const user = request.object;
    if (!user.get("email")) {
        throw "Every user must have an email address.";
    }
});