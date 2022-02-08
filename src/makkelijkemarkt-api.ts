const axios = require('axios');
import { AxiosInstance, AxiosResponse } from 'axios';
import { addDays, MONDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY, requireEnv } from './util';

import {
    MMMarkt,
    MMOndernemerStandalone,
    MMSollicitatieStandalone,
    MMOndernemer,
    MMSollicitatie,
} from './makkelijkemarkt.model';
import {
    IRSVP,
    IMarktondernemer
} from './markt.model';

import { session } from './model/index';
import { upsert } from './sequelize-util';

import {
    A_LIJST_DAYS,
    formatOndernemerName
} from './domain-knowledge';
import { MarktConfig } from 'model/marktconfig';

const packageJSON = require('../package.json');

const MILLISECONDS_IN_SECOND = 1000;
const SECONDS_IN_MINUTE = 60;
const MINUTES_IN_HOUR = 60;

const MAX_RETRY_50X = 10;
const MAX_RETRY_40X = 10;

requireEnv('API_URL');
requireEnv('API_MMAPPKEY');
requireEnv('API_READONLY_USER');
requireEnv('API_READONLY_PASS');

const mmConfig = {
    baseUrl         : process.env.API_URL,
    appKey          : process.env.API_MMAPPKEY,
    loginUrl        : 'login/basicUsername/',
    username        : process.env.API_READONLY_USER,
    password        : process.env.API_READONLY_PASS,
    clientApp       : packageJSON.name,
    clientVersion   : packageJSON.version,
    sessionKey      : 'mmsession',
    sessionLifetime : MILLISECONDS_IN_SECOND * SECONDS_IN_MINUTE * MINUTES_IN_HOUR * 6,
};
const getApi = (): AxiosInstance =>
    axios.create({
        baseURL: mmConfig.baseUrl,
        headers: {
            MmAppKey: mmConfig.appKey,
        },
    });
const login = (api: AxiosInstance) =>
    api.post(mmConfig.loginUrl, {
        username      : mmConfig.username,
        password      : mmConfig.password,
        clientApp     : mmConfig.clientApp,
        clientVersion : mmConfig.clientVersion,
    });

type HttpMethod = "get" | "post";

const createHttpFunction = (api: AxiosInstance, httpMethod: HttpMethod) : ( url: string, token: string, data?) => Promise<AxiosResponse> => {

    switch (httpMethod) {
        case "get":
            return (url: string, token: string) => {
                console.log("## MM API GET CALL: ", url);
                const headers =  {
                    Authorization: `Bearer ${token}`,
                };
                return api.get(url, { headers });
        }
        case "post":
            return (url: string, token: string, data) => {
                console.log("## MM API POST CALL: ", url);
                const headers =  {
                    Authorization: `Bearer ${token}`,
                };
                return api.post(url, data, { headers });
        }
    }
}

const apiBase = (
    url: string,
    httpMethod: HttpMethod = "get",
    requestBody?
): Promise<AxiosResponse> => {
    const api = getApi();

    const httpFunction = createHttpFunction(api, httpMethod)

    let counter50xRetry = 0;
    let counter40xRetry = 0;

    const retry = (api: any) => {
        return login(api)
        .then((res: any) => {
            return upsert(session, {
                sid: mmConfig.sessionKey,
            }, {
                sess: { 'token': res.data.uuid },
            }).then(() => res.data.uuid);
        }).then((token: string) => {
            return httpFunction(url, token, requestBody);
        });
    };

    api.interceptors.response.use((response: any) => {
        return response;
    }, (error: any) => {

        if (error.response.status === 504 ||
            error.response.status === 503) {
            counter50xRetry ++;
            if (counter50xRetry < MAX_RETRY_50X) {
                console.log('RETRY 50x');
                return retry(api);
            }
        }
        counter50xRetry = 0;

        if (error.response.status === 401 ||
            error.response.status === 403) {
            counter40xRetry ++;
            if (counter40xRetry < MAX_RETRY_40X) {
                console.log('RETRY 40x');
                return retry(api);
            }
        }
        counter40xRetry = 0;
        throw(error);
    });

    return session.findByPk(mmConfig.sessionKey)
    .then((sessionRecord: any) => {
        return sessionRecord ?
               httpFunction(url, sessionRecord.dataValues.sess.token, requestBody) :
               retry(api);
    });
};

export const updateRsvp = (
    marktId: string,
    marktDate: string,
    erkenningsNummer: string,
    attending: boolean,
): Promise<IRSVP> =>
    apiBase('rsvp', "post", `{"marktDate": "${marktDate}", "attending": ${attending}, "marktId": ${marktId}, "koopmanErkenningsNummer": "${erkenningsNummer}"}`).then(response => response.data);

//TODO https://dev.azure.com/CloudCompetenceCenter/salmagundi/_workitems/edit/29217
export const deleteRsvpsByErkenningsnummer = (erkenningsNummer) => null;

const getAanmeldingen = (url: string): Promise<IRSVP[]> =>
    apiBase(url).then(response => {
        for( let i=0; i < response.data.length; i++) {
            response.data[i].marktId = response.data[i].markt;
            response.data[i].erkenningsNummer = response.data[i].koopman;
        }
        return response.data;
    });

export const getAanmeldingenByMarktAndDate = (marktId: string, marktDate: string): Promise<IRSVP[]> =>
    getAanmeldingen(`rsvp/markt/${marktId}/date/${marktDate}`);

export const getAanmeldingenByOndernemerEnMarkt = (marktId: string, erkenningsNummer: string): Promise<IRSVP[]> =>
    getAanmeldingen(`rsvp/markt/${marktId}/koopman/${erkenningsNummer}`);

export const getAanmeldingenByOndernemer = (erkenningsNummer: string): Promise<IRSVP[]> =>
    getAanmeldingen(`rsvp/koopman/${erkenningsNummer}`);

export const getMarkt = (
    marktId: string
): Promise<MMMarkt> =>
    apiBase(`markt/${marktId}`).then(response => response.data);


export const getMarkten = (
    includeInactive: boolean = false
): Promise<MMMarkt[]> =>
    apiBase('markt/').then(({ data:markten = [] }) =>
        markten.filter(markt =>
            markt.kiesJeKraamActief && (
                includeInactive ||
                markt.kiesJeKraamFase === 'wenperiode' ||
                markt.kiesJeKraamFase === 'live' ||
                markt.kiesJeKraamFase === 'activatie'
            )
        )
    );

export const getMarktenForOndernemer = (
    ondernemer: Promise<MMOndernemerStandalone> | MMOndernemerStandalone,
    includeInactive: boolean = false
): Promise<MMMarkt[]> => {
    return Promise.all([
        getMarkten(includeInactive),
        ondernemer
    ])
    .then(([
        markten,
        ondernemer
    ]) => {
        return ondernemer.sollicitaties.reduce((result, sollicitatie) => {
            const markt = markten.find(({ id }) => id === sollicitatie.markt.id);
            return markt ? result.concat(markt) : result;
        }, []);
    });
};

export const getOndernemers = (): Promise<MMSollicitatieStandalone[]> =>
    apiBase('koopman/').then(response => response.data);

export const getOndernemer = (
    erkenningsNummer: string
): Promise<MMOndernemerStandalone> => {
    return apiBase(`koopman/erkenningsnummer/${erkenningsNummer}`)
    .then(response => {
        if (!response || !response.data) {
            throw Error('Ondernemer niet gevonden');
        }

        // Filter inactieve sollicitaties, aangezien we die nooit gebruiken binnen
        // dit systeem.
        const ondernemer = response.data;
        ondernemer.sollicitaties = ondernemer.sollicitaties.filter(sollicitatie => {
            return !sollicitatie.doorgehaald;
        });
        return ondernemer;
    });
};

export const getOndernemersByMarkt = (
    marktId: string
): Promise<IMarktondernemer[]> => {
    return apiBase(`sollicitaties/markt/${marktId}?listLength=10000&includeDoorgehaald=0`)
    .then(response => {
        const sollicitaties: MMSollicitatieStandalone[] = response.data;
        return sollicitaties.map(sollicitatie => {
            const {
                koopman,
                sollicitatieNummer,
                status,
                markt,
                vastePlaatsen
            } = sollicitatie;

            return {
                description      : formatOndernemerName(koopman),
                erkenningsNummer : koopman.erkenningsnummer,
                plaatsen         : vastePlaatsen,
                voorkeur: {
                    marktId          : String(markt.id),
                    erkenningsNummer : koopman.erkenningsnummer,
                    maximum          : Math.max(1, (vastePlaatsen || []).length),
                },
                sollicitatieNummer,
                status,
            };
        });
    });
};

export const getALijst = (
    marktId: string,
    marktDate: string
): Promise<MMOndernemer[]> => {
    const day = new Date(marktDate).getDay();

    if (A_LIJST_DAYS.includes(day)) {
        const monday = addDays(marktDate, MONDAY - day),
            thursday = addDays(marktDate, THURSDAY - day);

        return apiBase(`rapport/aanwezigheid/${marktId}/${monday}/${thursday}`).then(response => response.data);
    } else {
        return new Promise(resolve => resolve([]));
    }
};

export const checkActivationCode = (
    username: string,
    code: string
): Promise<any> =>
    getOndernemer(username)
    .then(ondernemer => {
        if (!ondernemer.pasUid) {
            throw Error('Incorrect username/password');
        }

        return typeof code === 'string' &&
               code.length > 0 &&
               code === ondernemer.pasUid;
    });

export const checkLogin = (): Promise<any> => {
    const api = getApi();
    return login(api).then((res: AxiosResponse) =>
        console.log('Login OK'),
    );
};

export const createMarktconfiguratie = (marktId: number, marktConfig: JSON): Promise<AxiosResponse> =>
    apiBase(`markt/${marktId}/marktconfiguratie`, "post", marktConfig).then(response => {
        return response.data
    }).catch(err => {
        throw(err);
    });


export const getLatestMarktconfiguratie = (marktId: number): Promise<AxiosResponse | void>  =>
    apiBase(`markt/${marktId}/marktconfiguratie/latest`).then(response => {
        console.log(response)
        return response.data
    }).catch(err => {throw(err)});

