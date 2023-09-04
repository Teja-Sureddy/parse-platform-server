require('./functions')
require('./jobs')
require('./schedulers')


// SEND EMAIL
Parse.Cloud.define("SendEmail", function (request) {
    const { params, user } = request

    Parse.Cloud.sendEmail({
        templateName: "customEmail",
        placeholders: { username: user.username },
        user: user
    });
})