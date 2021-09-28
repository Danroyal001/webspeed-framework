import colors from 'colors';

const TODO = (task: string, _filename = __filename) => {
    return console.warn(colors.bgRed(colors.white(`${task}\nFound in ${_filename}`)));
}

export default TODO;
