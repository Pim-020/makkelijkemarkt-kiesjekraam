export default class Configuration {
    MMARKT_URL: string = `${process.env.REACT_APP_KJK_API_ORIGIN || ''}/api/markt`;
    API_BASE_URL: string = 'https://bewerkdemarkten.tiltshiftapps.nl/api/v1';
    ONLINE: boolean = false;
}
