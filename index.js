const envPaths = require("env-paths")
const fs = require("fs")
const { setup } = require("./utils/setup")
const { manage } = require("./utils/manage")
const axios = require("axios").default;

// TODO: Wrap this all in a main function
console.clear()

axios.defaults.baseURL = 'https://virtualizor.oxide.host:4083';

// ok shutup this is scuffed and i could have made it 10x better. cry.
if (!fs.existsSync(envPaths("oxide-cli", { suffix: "" }).config) || !fs.existsSync(envPaths("oxide-cli", { suffix: "" }).config + "/config.json")) {
  fs.mkdirSync(envPaths("oxide-cli", { suffix: "" }).config, {
    recursive: true,
  });
    
  setup()

} else {
  const configRaw = fs.readFileSync(envPaths("oxide-cli", { suffix: "" }).config + "/config.json", { encoding:'utf8', flag:'r' })
  const config = JSON.parse(configRaw)

  axios.defaults.params = {
    api: "json",
    apikey: config.key,
    apipass: config.pass
  }
  
  manage()
}