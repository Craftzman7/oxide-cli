const inquirer = require("inquirer");
const chalk = require("chalk");
const axios = require('axios').default;

async function setup() {
    console.log(chalk.bold.greenBright("Hello and welcome to the Oxide hosting CLI tool!"))
    console.log(chalk.bold.greenBright("Please answer the questions below to get started!"))
    const questions = [
    {
        type: "input",
        name: "key",
        message: "What is your API key? (If you don't know you can find it on your vps.oxide.host account page)",
    },
    {
        type: "input",
        name: "pass",
        message: "What is your API password?",
    }
    ]
    await inquirer.prompt(questions).then( async (answers) => {
        await axios.get("/index.php", {
            params: {
                act: "listvs",
                api: "json",
                apikey: answers.key,
                apipass: answers.pass
            }
        }).then(function (response) {
            if(response.data.act == 'login') {
                console.log(chalk.bold.red("Authentication failed! Restarting setup in 5 seconds..."))
                setTimeout(() => {
                    console.clear()
                    setup()
                }, 5000)
            } else {
                console.log(chalk.bold.greenBright(`Authentication successful! Welcome, ${response.data.preferences.fname}.`))
            }
        })
    })
    
}

module.exports = {
    setup,
};