import config from "./config";

// set the server port to listen to
const PORT = Number(process.env.PORT) || Number(config.PORT) || 8080;

export default PORT;
