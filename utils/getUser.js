const fs = require("fs")
const envPaths = require("env-paths")
const chalk = require("chalk")
const axios = require("axios")

async function getUser() {
    const configRaw = await fs.readFileSync(envPaths("oxide-cli", { suffix: "" }).config + "/config.json", { encoding:'utf8', flag:'r' })
    data = {}
    try {
        const config = JSON.parse(configRaw)
        await axios.get("/index.php", {
            params: {
                act: "listvs",
            }
        }).then(function (response) {
            if(response.data.act == 'login') {
                console.log(chalk.bold.red("Authentication failed! Running first time setup..."))
                setTimeout(() => {
                    console.clear()
                    setup()
                }, 5000)
            } else {
                data = response.data;
            }
        })
        return data;
    } catch (err) {
        console.log(chalk.bold.red("Error reading configuration file!"))
        process.exit(1)
    }
}

module.exports = {
    getUser
}