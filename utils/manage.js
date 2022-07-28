const chalk = require("chalk")
const ora = require("ora")
const { getUser } = require("./getUser")
const inquirer = require("inquirer")
const { manageVps } = require("./manageVps")

async function manage() {
    // please help
    const spinner = ora("Loading...").start()
    const user = await getUser()
    const vpsList = user.vs;
    const vpsListWithIds = {}
    vpsNames = []
    for (vps in vpsList) {
        vpsNames.push(vpsList[vps].hostname);
        // please i beg you
        vpsListWithIds[vpsList[vps].hostname] = vpsList[vps].vpsid;
    }
    spinner.stop();
    console.clear()
    console.log(chalk.bold.greenBright(`Welcome, ${user.preferences.fname}!`))
    await inquirer.prompt([
        {
            type: "list",
            name: "service",
            message: "Which service do you want to manage?",
            choices: vpsNames
        }
    ]).then((answer) => {
        manageVps(vpsListWithIds[answer.service])
    });
}

module.exports = {
    manage
}