const chalk = require('chalk')


const validationRules = request => { return } // return or throw based on the authorization

const cloud_config = {
    fields: {},
    requireUser: false,
    rateLimit: {
        requestTimeWindow: 1 * 60 * 1000, // 1 min
        requestCount: 10
    }
}

Parse.Cloud.define("getTime", function (request) {
    const { params, user } = request
    var date = new Date()
    return date
}, cloud_config, validationRules)


Parse.Cloud.define("getParams", function (request) {
    const { params, user } = request
    console.log(params);
    return params
}, {
    fields: {
        text: {
            required: true, type: String, error: "Text Required."
        },
    }
})


// SEND EMAIL
Parse.Cloud.define("SendEmail", function (request) {
    const { params, user } = request

    Parse.Cloud.sendEmail({
        templateName: "customEmail",
        placeholders: { username: user.username },
        user: user
    });
})


// TRIGGERS
Parse.Cloud.beforeSave(Parse.User, request => {
    const user = request.object;
    if (!user.get("email")) {
        throw "Every user must have an email address.";
    }
});