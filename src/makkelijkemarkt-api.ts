import {type} from "os";

const axios = require('axios');
import { AxiosInstance, AxiosResponse } from 'axios';
import { addDays, MONDAY, THURSDAY, requireEnv } from './util';

import {
    MMMarkt,
    MMOndernemerStandalone,
    MMSollicitatieStandalone,
    MMOndernemer,
    MMMarktPlaatsvoorkeuren,
    MMarktondernemerVoorkeur,
} from './makkelijkemarkt.model';

import {
    BrancheId,
    IRSVP,
    IMarktondernemer,
    IPlaatsvoorkeur,
    IMarktondernemerVoorkeur,
    IMarktondernemerVoorkeurRow,
} from './markt.model';

import { session } from './model/index';
import { upsert } from './sequelize-util';

import {
    A_LIJST_DAYS,
    formatOndernemerName,
} from './domain-knowledge';
import { MarktConfig } from 'model/marktconfig';

import {
    indelingVoorkeurMerge,
    indelingVoorkeurSort,
} from './pakjekraam-api';

const packageJSON = require('../package.json');

const MILLISECONDS_IN_SECOND = 1000;
const SECONDS_IN_MINUTE = 60;
const MINUTES_IN_HOUR = 60;

const MAX_RETRY_50X = 10;
const MAX_RETRY_40X = 10;
const EMPTY_BRANCH: BrancheId = "000-EMPTY"

requireEnv('API_URL');
requireEnv('API_MMAPPKEY');
requireEnv('API_KEY');

const mmConfig = {
    baseUrl         : process.env.API_URL,
    appKey          : process.env.API_MMAPPKEY,
    loginUrl        : 'login/apiKey/',
    apiKey          : process.env.API_KEY,
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
        api_key        : mmConfig.apiKey,
        clientApp     : mmConfig.clientApp,
        clientVersion : mmConfig.clientVersion,
    });

export type HttpMethod = 'get' | 'post' | 'put' | 'delete';

const createHttpFunction = (api: AxiosInstance, httpMethod: HttpMethod): ( url: string, token: string, data?) => Promise<AxiosResponse> => {
    return (url: string, token: string, data?: JSON): Promise<AxiosResponse> => {
        console.log(`## MM API ${httpMethod} CALL: `, url);
        const headers =  {
            Authorization: `Bearer ${token}`,
        };

        switch (httpMethod) {
            case 'get': return api.get(url, { headers });
            case 'post': return api.post(url, data,{ headers });
            case 'put': return api.put(url, data,{ headers });
            case 'delete': return api.delete(url, { headers });
        }
    };
};

const apiBase = (
    url: string,
    httpMethod: HttpMethod = "get",
    requestBody?,
    throwError: boolean = false
): Promise<AxiosResponse> => {
    const api = getApi();

    const httpFunction = createHttpFunction(api, httpMethod);

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
        if (throwError) throw error;
        return error;
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

const convertApiPlaatsvoorkeurenToIPlaatsvoorkeurArray = (
    plaatsvoorkeuren: MMMarktPlaatsvoorkeuren[]
): IPlaatsvoorkeur[] => {
    let result = [];
    plaatsvoorkeuren.forEach( (pv) => {
        result = result.concat(
            pv.plaatsen.map( (plaats, index) => ({
                "marktId": pv.markt,
                "erkenningsNummer": pv.koopman,
                "plaatsId": plaats,
                "priority": plaatsvoorkeuren.length - index,
            }))
        )
    })
    return result;
}

const convertIPlaatsvoorkeurArrayToApiPlaatsvoorkeuren = (
    plaatsvoorkeuren: IPlaatsvoorkeur[]
): MMMarktPlaatsvoorkeuren => {
    if( plaatsvoorkeuren.length < 1 ) {
        console.log("empty call to convertIPlaatsvoorkeurArrayToApiPlaatsvoorkeuren");
        return null;
    }

    let markt = plaatsvoorkeuren[0].marktId;
    let koopman = plaatsvoorkeuren[0].erkenningsNummer;

    plaatsvoorkeuren.reverse().forEach( (pv) => {
        if(pv.marktId !== markt || pv.erkenningsNummer !== koopman) {
            console.log("call to convertIPlaatsvoorkeurArrayToApiPlaatsvoorkeuren has wrong input data");
            return null;
        }
    })

    plaatsvoorkeuren.sort( (a, b) => b.priority - a.priority );

    return {
        "markt": plaatsvoorkeuren[0].marktId,
        "koopman": plaatsvoorkeuren[0].erkenningsNummer,
        "plaatsen": plaatsvoorkeuren.map( (pv) => parseInt(pv.plaatsId) ),
    }
}

export const getPlaatsvoorkeuren = (
    marktId: string
): Promise<IPlaatsvoorkeur[]> =>
    getPlaatsvoorkeurenByMarkt(marktId);

export const getPlaatsvoorkeurenOndernemer = (
    erkenningsNummer: string
): Promise<IPlaatsvoorkeur[]> =>
    apiBase(`plaatsvoorkeur/koopman/${erkenningsNummer}`).then(
        response => convertApiPlaatsvoorkeurenToIPlaatsvoorkeurArray(response.data)
);

//TODO https://dev.azure.com/CloudCompetenceCenter/salmagundi/_workitems/edit/29217
export const deletePlaatsvoorkeurenByErkenningsnummer = (erkenningsNummer: string) => null;

export const getPlaatsvoorkeurenByMarkt = (
    marktId: string
): Promise<IPlaatsvoorkeur[]> =>
    apiBase(`plaatsvoorkeur/markt/${marktId}`).then(
        response => convertApiPlaatsvoorkeurenToIPlaatsvoorkeurArray(response.data)
);

export const getPlaatsvoorkeurenByMarktEnOndernemer = (
    marktId: string, erkenningsNummer: string
): Promise<IPlaatsvoorkeur[]> =>
    apiBase(`plaatsvoorkeur/markt/${marktId}/koopman/${erkenningsNummer}`).then(
        response => convertApiPlaatsvoorkeurenToIPlaatsvoorkeurArray(response.data)
);

export const updatePlaatsvoorkeur = (
    plaatsvoorkeuren: IPlaatsvoorkeur[]
): Promise<IPlaatsvoorkeur> => {
    let pv =  convertIPlaatsvoorkeurArrayToApiPlaatsvoorkeuren(plaatsvoorkeuren);
    return apiBase('plaatsvoorkeur', 'post', JSON.stringify(pv) ).then(response => response.data);
}

const convertMMarktondernemerVoorkeurToIMarktondernemerVoorkeur = (
    marktvoorkeuren: MMarktondernemerVoorkeur[]
): IMarktondernemerVoorkeur[] => {
    let result = [];

    marktvoorkeuren.forEach( (vk) => {
        let branches = [];
        let inrichting = [];

        if (vk.hasInrichting) {
            inrichting = ['eigen-materieel'];
        }

        if (vk.branche) {
            branches.push(vk.branche as BrancheId);
        }

        if (vk.isBak) {
            branches.push('bak' as BrancheId);
        }

        result.push( {
            erkenningsNummer: vk.koopman,
            marktId: vk.markt,
            marktDate: null,
            minimum: vk.minimum,
            maximum: vk.maximum,
            krachtStroom: null,
            kraaminrichting: inrichting,
            anywhere: vk.anywhere,
            branches: branches,
            verkoopinrichting: inrichting,
        })

        if (vk.absentFrom) result[result.length-1].absentFrom = vk.absentFrom;
        if (vk.absentUntil) result[result.length-1].absentUntil = vk.absentUntil;
    })

    return result;
}

const convertIMarktondernemerVoorkeurToMMarktondernemerVoorkeur = (
    marktvoorkeur: IMarktondernemerVoorkeur
): MMarktondernemerVoorkeur => {
    let isBak = false;
    let branche = null;
    if( marktvoorkeur.branches !== null ){
        if (marktvoorkeur.branches.includes("bak")) isBak = true;
        branche = marktvoorkeur.branches[0] as BrancheId;
    }

    let hasInrichting = marktvoorkeur.verkoopinrichting[0] || marktvoorkeur.kraaminrichting ? true: false;

    let result: MMarktondernemerVoorkeur = {
        "koopman": marktvoorkeur.erkenningsNummer,
        "markt": marktvoorkeur.marktId,
        "anywhere": marktvoorkeur.anywhere,
        "minimum": marktvoorkeur.minimum,
        "maximum": marktvoorkeur.maximum,
        "hasInrichting": hasInrichting,
        "isBak": isBak,
        "branche": branche
    }

    if (marktvoorkeur.absentFrom) result.absentFrom = marktvoorkeur.absentFrom;
    if (marktvoorkeur.absentUntil) result.absentUntil = marktvoorkeur.absentUntil;

    return result;
}

export const updateMarktVoorkeur = (
    marktvoorkeur: IMarktondernemerVoorkeur
): Promise<MMarktondernemerVoorkeur> =>
    apiBase(
        'marktvoorkeur',
        'post',
        JSON.stringify(convertIMarktondernemerVoorkeurToMMarktondernemerVoorkeur(marktvoorkeur))
).then(response => response.data);

export const getIndelingVoorkeur = (
    erkenningsNummer: string,
    marktId: string = null,
    marktDate: string = null,
): Promise<IMarktondernemerVoorkeur> =>
    apiBase(
        `marktvoorkeur/markt/${marktId}/koopman/${erkenningsNummer}`
).then(response =>
    convertMMarktondernemerVoorkeurToIMarktondernemerVoorkeur(response.data)
        .sort(indelingVoorkeurSort)
        .reduce(indelingVoorkeurMerge, null)
);

export const getIndelingVoorkeuren = (
    marktId: string,
    marktDate: string = null,
): Promise<IMarktondernemerVoorkeur[]> =>
    getVoorkeurenByMarkt(marktId)

//TODO https://dev.azure.com/CloudCompetenceCenter/salmagundi/_workitems/edit/29217
export const deleteVoorkeurenByErkenningsnummer = ( erkenningsNummer: string ) => null;

export const convertVoorkeurToVoorkeurRow = (
    obj: IMarktondernemerVoorkeur
): IMarktondernemerVoorkeurRow => ({
    ...obj,
    brancheId: obj.branches[0] as BrancheId || EMPTY_BRANCH,
    parentBrancheId: obj.branches.includes('bak') ? 'bak' : '',
    inrichting: obj.verkoopinrichting[0] || '',
});

export const getVoorkeurByMarktEnOndernemer = (
    marktId: string,
    erkenningsNummer: string
): Promise<IMarktondernemerVoorkeurRow> =>
    apiBase(`marktvoorkeur/markt/${marktId}/koopman/${erkenningsNummer}`
).then(response =>
    convertVoorkeurToVoorkeurRow(
        convertMMarktondernemerVoorkeurToIMarktondernemerVoorkeur(response.data)[0]
    )
);

export const getVoorkeurenByMarkt = (
    marktId: string
): Promise<IMarktondernemerVoorkeur[]> =>
    apiBase(`marktvoorkeur/markt/${marktId}`
).then(response =>
    convertMMarktondernemerVoorkeurToIMarktondernemerVoorkeur(response.data)
);

export const getVoorkeurenByOndernemer = (
    erkenningsNummer: string
): Promise<IMarktondernemerVoorkeur[]> =>
    apiBase(`marktvoorkeur/koopman/${erkenningsNummer}`
).then(response =>
    convertMMarktondernemerVoorkeurToIMarktondernemerVoorkeur(response.data)
);

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

export const callApiGeneric = async (endpoint: string, method: HttpMethod, body?: JSON): Promise<AxiosResponse> => {
    const result = await apiBase(endpoint, method, body, true);

    return result.data;
};
