const inquirer = require("inquirer");
const axios = require("axios")
const ora = require("ora");
const chalk = require("chalk");

async function manageVps(id) {
    const spinner = ora("Loading...").start()
    choices = []
    const vps = {}
    offlineChoices = [
        "Start",
        "Reinstall OS",
        "Go back",
    ]
    onlineChoices = [
        "Stop",
        "Restart",
        "Power off",
        "Reinstall OS",
        "Go back"
    ]
    await axios.get("/index.php", {
        params: {
            svs: id,
            act: "vpsmanage"
        }
    }).then((response) => {
        // scuffed
        spinner.stop()
        if(response.data.info.status == 1) {
            vps.info = response.data.info;
            choices.push(...onlineChoices)
        } else {
            vps.info = response.data.info;
            choices.push(...offlineChoices)
        }
    })
    console.clear()
    console.log(chalk.bold.green(`Managing: ${vps.info.hostname}`))
    process.stdout.write(chalk.bold.green("VPS status: "))
    process.stdout.write(vps.info.status == 1 ? chalk.bold.green("Online\n") : chalk.bold.red("Offline\n"))
    await inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "What action would you like to perform?",
            choices: choices
        }
    ]).then( async (answer) => {
        switch(answer.action) {
            case "Start":
                await startVps(id)
                break;
            case "Stop":
                await stopVps(id)
                break;
            case "Restart":
                await restartVps(id)
                break;
            case "Power off":
                await shutdownVps(id)
                break;
            case "Reinstall OS":
                await reinstallVps(id)
                break;
            case "Go back":
                console.clear()
                require("./manage").manage()
                break;
        }
    })
}

async function startVps(id) {
    const spinner = ora("Loading...").start()
    await axios.get("/index.php", {
        params: {
            act: "start",
            svs: id,
            do: 1
        }
    }).then((response) => {
        spinner.stop();
        if(response.data.done) {
            console.log(chalk.bold.green("The VPS was started successfully."))
        } else {
            console.log(chalk.bold.red("There was a problem starting your VPS. Are you sure it's not already started?"))
        }
        setTimeout(() => {
            console.clear()
            manageVps(id)
        }, 5000)
    })
}

async function stopVps(id) {
    const spinner = ora("Loading...").start()
    await axios.get("/index.php", {
        params: {
            act: "stop",
            svs: id,
            do: 1
        }
    }).then((response) => {
        spinner.stop();
        if(response.data.done) {
            console.log(chalk.bold.green("The VPS was stopped successfully."))
        } else {
            console.log(chalk.bold.red("There was a problem stopping your VPS. Are you sure it's not already stopped?"))
        }
        setTimeout(() => {
            console.clear()
            manageVps(id)
        }, 5000)
    })
}

async function restartVps(id) {
    const spinner = ora("Loading...").start()
    await axios.get("/index.php", {
        params: {
            act: "restart",
            svs: id,
            do: 1
        }
    }).then((response) => {
        spinner.stop();
        if(response.data.done) {
            console.log(chalk.bold.green("The VPS was restarted successfully."))
        } else {
            console.log(chalk.bold.red("There was a problem restarting your VPS."))
        }
        setTimeout(() => {
            console.clear()
            manageVps(id)
        }, 5000)
    })
}

async function shutdownVps(id) {
    const spinner = ora("Loading...").start()
    await axios.get("/index.php", {
        params: {
            act: "poweroff",
            svs: id,
            do: 1
        }
    }).then((response) => {
        spinner.stop();
        if(response.data.done) {
            console.log(chalk.bold.green("The VPS was powered off successfully."))
        } else {
            console.log(chalk.bold.red("There was a problem powering off your VPS."))
        }
        setTimeout(() => {
            console.clear()
            manageVps(id)
        }, 5000)
    })
}

async function reinstallVps(id) {
    const spinner = ora("Loading...").start()
    osList = []
    const osListWithIds = {};
    choices = {}
    await axios("/", {
        method: 'post',
        params: {
            act: "ostemplate",
            svs: id,
        },
        headers: { 
            'Content-Type': 'text/plain'
        },
        data: 'reinsos=0&newos=0&newpass=Test123&conf=Test123'
    }).then( async (response) => {
        for (const os in response.data.oslist.kvm) {
            const versions = response.data.oslist.kvm[os];
            for  (const number in versions) {
                osList.push(versions[number].name);
                osListWithIds[versions[number].name] = number;
            }
        }
        spinner.stop()
        await inquirer.prompt([
            {
                type: "list",
                name: "os",
                message: "What OS would you like to install?",
                choices: osList
            }
        ]).then( async (answer) => {
            spinner.start()
            choices.os = osListWithIds[answer.os]
            spinner.stop()
            console.log(choices.os)
            await inquirer.prompt([
                {
                    type: "password",
                    name: "password",
                    message: "Enter the password you would like to use."
                }
            ]).then( async (answer) => {
                spinner.start()
                choices.password = answer.password;
                await axios("/", {
                    method: 'post',
                    params: {
                        act: "ostemplate",
                        svs: id,
                    },
                    data: `reinsos=1&newos=${choices.os}&newpass=${choices.password}&conf=${choices.password}`
                }).then((response) => {
                    spinner.stop()
                    if(response.data.done) {
                        console.log(chalk.bold.green("The VPS was reinstalled successfully."))
                    } else {
                        console.log(chalk.bold.red("There was a problem reinstalling your VPS."))
                    }
                    setTimeout(() => {
                        console.clear()
                        manageVps(id)
                    }, 5000)
                })
            })
        })
    })
}



module.exports = {
    manageVps
}