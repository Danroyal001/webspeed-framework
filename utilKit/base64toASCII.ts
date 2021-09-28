const base64toASCII = (base64string: string) => {
    const buffer = Buffer.from(base64string, 'base64');
    return buffer.toString('ascii');
}

export default base64toASCII;
