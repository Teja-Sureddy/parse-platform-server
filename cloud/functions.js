const chalk = require('chalk')


const validationRules = request => { return } // return or throw based on the authorization

const cloud_config = {
    fields: {},
    requireUser: false,
    rateLimit: { requestTimeWindow: 1 * 60 * 1000, requestCount: 10 } // 10 request per minute
}

Parse.Cloud.define("getTime", function (request) {
    const { params, user } = request
    var date = new Date()
    return date
}, cloud_config, validationRules)