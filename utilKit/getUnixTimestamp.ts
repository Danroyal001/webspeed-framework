const getUnixTimestamp = () => Date.now() || (new Date).getTime();

export default getUnixTimestamp;
