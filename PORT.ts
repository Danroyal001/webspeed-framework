import config from "./config";

// set the server port to listen to
const PORT = process.env.PORT || config.PORT || 8080;

export default PORT;
