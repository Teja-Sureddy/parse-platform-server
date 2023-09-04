const chalk = require('chalk')


Parse.Cloud.job("Time Job", async (request) => {
    const { params, user, log, message, jobId } = request
    // You can check the status using Parse.Cloud.getJobStatus(<id>) or from _JobStatus class
    console.log("Job id:", jobId)

    var date = await Parse.Cloud.run("getTime")
    res = `Date from ${chalk.redBright('JOB ')} scheduler: ${date}`

    message(res)
    console.log(chalk.green(res))
    log.info(chalk.green(res))
})