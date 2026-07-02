const asciiToBase64 = (asciiString: string) => {
    const buffer = Buffer.from(asciiString);
    return buffer.toString('base64');
}

export default asciiToBase64;
