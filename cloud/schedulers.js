const schedule = require('node-schedule')
const chalk = require('chalk')


const rule = new schedule.RecurrenceRule()
rule.second = new schedule.Range(0, 59, 60) // Every 60 seconds

schedule.scheduleJob(rule, async function (request, response) {
    // Triggers cloud function 'getTime'
    var date = await Parse.Cloud.run("getTime")
    res = `\nDate from ${chalk.redBright('NODE')} scheduler: ${date}`
    console.log(chalk.blue(res))

    // Triggers all cloud jobs
    Parse.Cloud.getJobsData().then((res) => {
        console.log('Jobs data: ', res)
        res['jobs'].forEach(async (job) => {
            await Parse.Cloud.startJob(job, {})
        })
    })
})