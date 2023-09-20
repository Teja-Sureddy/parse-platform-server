const chalk = require('chalk')


const validationRules = request => { return } // return or throw based on the authorization
const getTimeconfig = { requireUser: false, rateLimit: { requestTimeWindow: 1 * 60 * 1000, requestCount: 10 } } // 1 min

Parse.Cloud.define("getTime", function (request) {
    var date = new Date()
    return date
}, getTimeconfig, validationRules)


const getParamsConfig = { requireUser: true, fields: { text: { required: true, type: String, error: "Text Required." } } }

Parse.Cloud.define("getParams", function (request) {
    const { params } = request
    console.log(params);
    return params
}, getParamsConfig)


Parse.Cloud.define("getConfig", async function (request) {
    const config = await Parse.Config.get()
    return config.attributes
})


// TRIGGERS
Parse.Cloud.beforeSave(Parse.User, request => {
    const { object } = request;
    if (!object.get("email")) {
        throw "Email required.";
    }
    else{
        const acl = new Parse.ACL();
        acl.setRoleReadAccess("admin", true);
        acl.setRoleWriteAccess("admin", true);
        acl.setPublicReadAccess(false);
        acl.setPublicWriteAccess(false);
        object.setACL(acl);
    }
});