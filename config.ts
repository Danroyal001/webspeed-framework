import envOptions from './env';

const config = {

    name: 'WebSpeed',
    PORT: 8080,

    ...envOptions

} as Record<any, any>;

export default config;
