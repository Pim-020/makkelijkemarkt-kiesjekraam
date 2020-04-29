import express, {
    Request,
    Response,
    NextFunction
} from 'express';

import bodyParser from 'body-parser';
import connectPgSimple = require('connect-pg-simple');
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import morgan from 'morgan';
import path from 'path';
import Pool from 'pg-pool';
import session from 'express-session';
import url from 'url';
import * as reactViews from 'express-react-views';

// Util
// ----

import {
    HTTP_INTERNAL_SERVER_ERROR,
    internalServerErrorPage,
    getQueryErrors,
    isAbsoluteUrl
} from './express-util';

import { requireEnv } from './util';

// KeyCloak
// --------

import Keycloak, {
    GrantedRequest,
    TokenContent
} from 'keycloak-connect';
import { getKeycloakUser } from './keycloak-api';
import { KeycloakRoles } from './permissions';

// API
// ---

import {
    getMarkt,
    getMarktondernemer,
    getMarktondernemersByMarkt
} from './makkelijkemarkt-api';

import {
    getMarktEnriched,
    getMarktenEnabled
} from './model/markt.functions';

// Routes
// ------

import {
    serverHealth,
    serverTime,
    databaseHealth,
    keycloakHealth,
    makkelijkeMarktHealth
} from './routes/status';

import {
    activationPage,
    handleActivation
} from './routes/activation';

import {
    registrationPage,
    handleRegistration
} from './routes/registration';

import {
    attendancePage,
    handleAttendanceUpdate,
    marketAttendancePage,
    handleMarketAttendanceUpdate
} from './routes/market-application';

import {
    marketPreferencesPage,
    updateMarketPreferences
} from './routes/market-preferences';

import {
    dashboardPage
} from './routes/dashboard';

import {
    plaatsvoorkeurenPage,
    updatePlaatsvoorkeuren
} from './routes/market-location';

import {
    activationQRPage
} from './routes/activation-qr';

import {
    deleteUserPage,
    deleteUser,
    publicProfilePage,
    toewijzingenAfwijzingenPage
} from './routes/ondernemer';

import {
    langdurigAfgemeld,
    marktDetail
} from './routes/markt';

import {
    vasteplaatshoudersPage,
    voorrangslijstPage,
    ondernemersNietIngedeeldPage,
    afmeldingenVasteplaatshoudersPage,
    sollicitantentAanwezigheidLijst,
    alleOndernemersAanwezigheidLijst,
} from './routes/markt-marktmeester';

import {
    indelingslijstPage,
    marketAllocationPage,
    indelingPage
} from './routes/market-allocation';

const csrfProtection = csrf({ cookie: true });

requireEnv('DATABASE_URL');
requireEnv('APP_SECRET');

const HTTP_DEFAULT_PORT = 8080;

const parseDatabaseURL = (str: string) => {
    const params = url.parse(str);
    const auth = params.auth.split(':');

    return {
        user: auth[0],
        password: auth[1],
        host: params.hostname,
        port: parseInt(params.port, 10),
        database: params.pathname.split('/')[1],
    };
};

const isMarktondernemer = (req: GrantedRequest) => {
    const accessToken = req.kauth.grant.access_token.content;

    return (
        !!accessToken.resource_access[process.env.IAM_CLIENT_ID] &&
        accessToken.resource_access[process.env.IAM_CLIENT_ID].roles.includes(KeycloakRoles.MARKTONDERNEMER)
    );
};

const isMarktmeester = (req: GrantedRequest) => {
    const accessToken = req.kauth.grant.access_token.content;

    return (
        !!accessToken.resource_access[process.env.IAM_CLIENT_ID] &&
        accessToken.resource_access[process.env.IAM_CLIENT_ID].roles.includes(KeycloakRoles.MARKTMEESTER)
    );
};

const getErkenningsNummer = (req: GrantedRequest) => {
    const tokenContent = req.kauth.grant.access_token.content as TokenContent & any;
    return isMarktondernemer(req) && tokenContent.preferred_username.replace(/\./g, '');
};

const app = express();

// Trick `keycloak-connect` into thinking we're running on HTTPS
app.set('trust proxy', true);
// Initialize React JSX templates for server-side rendering
app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'jsx');
const templateEngine = reactViews.createEngine({ beautify: true });

app.engine('jsx', templateEngine);
app.engine('tsx', templateEngine);

app.use(morgan(morgan.compile(':date[iso] :method :status :url :response-time ms')));

// The `/status/health` endpoint is required for Docker deployments
app.get('/status/health', serverHealth);
app.get('/status/time', serverTime);
app.get('/status/database', databaseHealth);
app.get('/status/keycloak', keycloakHealth);
app.get('/status/makkelijkemarkt', makkelijkeMarktHealth);

// Required for Passport login form
app.use(bodyParser.urlencoded({ extended: true }));
// We need to parse cookies because csurf needs them
app.use(cookieParser());
// app.use(bodyParser.json());

const pool = new Pool(parseDatabaseURL(process.env.DATABASE_URL));
const sessionStore = new (connectPgSimple(session))({ pool });

const keycloak = new Keycloak(
    { store: sessionStore },
    {
        realm: process.env.IAM_REALM,
        'auth-server-url': process.env.IAM_URL,
        'ssl-required': 'external',
        resource: process.env.IAM_CLIENT_ID,
        credentials: {
            secret: process.env.IAM_CLIENT_SECRET,
        },
        'confidential-port': 0,
    },
);

app.use(
    session({
        store: sessionStore,
        secret: process.env.APP_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            sameSite: true
        }
    }),
);

app.use((req, res, next) => {
    res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-XSS-Protection', '1; mode=block');
    res.header('X-Frame-Options', 'SAMEORIGIN');
    next();
});

app.use(
    keycloak.middleware({
        logout: '/logout',
    }),
);

// Put the login route before the expired redirect to prevent an
// endless loop.
app.get('/login', keycloak.protect(), (req: GrantedRequest, res: Response) => {

    if (req.query.next) {
        // To prevent open redirects, filter out absolute URLS
        !isAbsoluteUrl(req.query.next) ? res.redirect(req.query.next) : res.redirect('/');
    } else if (isMarktondernemer(req)) {
        res.redirect('/dashboard/');
    } else if (isMarktmeester(req)) {
        res.redirect('/markt/');
    } else {
        res.redirect('/');
    }
});

app.get('/', (req: Request, res: Response) => {
    res.render('HomePage');
});

app.get('/email/', keycloak.protect(KeycloakRoles.MARKTMEESTER), (req: Request, res: Response) => {
    res.render('EmailPage');
});

app.get(
    '/markt/',
    keycloak.protect(KeycloakRoles.MARKTMEESTER),
    (req: GrantedRequest, res: Response) => {
        return getMarktenEnabled()
            .then((markten: any) => {
                res.render('MarktenPage',{ markten, role: KeycloakRoles.MARKTMEESTER, user: getKeycloakUser(req) });
            }, internalServerErrorPage(res));
});

// app.get(
//     '/environment/',
//     keycloak.protect(KeycloakRoles.MARKTMEESTER),
//     (req: Request, res: Response) => {
//         res.render('EnvironmentPage');
//     }
// );

app.get(
    '/markt/:marktId/',
    keycloak.protect(KeycloakRoles.MARKTMEESTER),
    (req: GrantedRequest, res: Response, next: NextFunction) => {
        getMarktEnriched(req.params.marktId)
            .then((markt: any) => res.render('MarktDetailPage', { markt, role: KeycloakRoles.MARKTMEESTER, user: getKeycloakUser(req) }))
            .catch(next);
    },
);

app.get(
    '/markt/:marktId/langdurig-afgemeld',
    keycloak.protect(KeycloakRoles.MARKTMEESTER),
    (req: GrantedRequest, res: Response, next: NextFunction) =>
        langdurigAfgemeld(
            req,
            res,
            req.params.marktId,
            KeycloakRoles.MARKTMEESTER,
        )
);

app.get(
    '/markt/:marktId/:marktDate/concept-indelingslijst/',
    keycloak.protect(KeycloakRoles.MARKTMEESTER),
    indelingslijstPage,
);

app.get(
    '/markt/:marktId/:marktDate/indelingslijst/',
    keycloak.protect(KeycloakRoles.MARKTMEESTER),
    marketAllocationPage,
);

app.get(
    '/markt/:marktId/:marktDate/indeling/',
    keycloak.protect(KeycloakRoles.MARKTMEESTER),
    indelingPage,
);

app.get(
    '/markt/:marktId/:datum/vasteplaatshouders/',
    keycloak.protect(KeycloakRoles.MARKTMEESTER),
    vasteplaatshoudersPage,
);

app.get(
    '/markt/:marktId/:datum/a-b-lijst/',
    keycloak.protect(KeycloakRoles.MARKTMEESTER),
    voorrangslijstPage
);

app.get(
    '/markt/:marktId/:datum/ondernemers-niet-ingedeeld/',
    keycloak.protect(KeycloakRoles.MARKTMEESTER),
    ondernemersNietIngedeeldPage
);

app.get('/markt/:marktId/:datum/alle-sollicitanten/',
    keycloak.protect(KeycloakRoles.MARKTMEESTER),
    sollicitantentAanwezigheidLijst
);

app.get('/markt/:marktId/:datum/alle-ondernemers/',
    keycloak.protect(KeycloakRoles.MARKTMEESTER),
    alleOndernemersAanwezigheidLijst
);

app.get(
    '/markt/:marktId/:datum/afmeldingen-vasteplaatshouders/',
    keycloak.protect(KeycloakRoles.MARKTMEESTER),
    afmeldingenVasteplaatshoudersPage
);

app.get(
    '/dashboard/',
    keycloak.protect(KeycloakRoles.MARKTONDERNEMER),
    (req: GrantedRequest, res: Response, next: NextFunction) => {
        dashboardPage(req, res, next, getErkenningsNummer(req));
    },
);

app.get(
    '/ondernemer/:erkenningsNummer/activatie-qr.svg',
    keycloak.protect(KeycloakRoles.MARKTMEESTER),
    activationQRPage,
);

app.get('/activeren', activationPage);

app.post('/activeren', handleActivation);

app.get('/registreren', registrationPage);

app.post('/registreren', handleRegistration);

app.get('/welkom', (req: Request, res: Response) => {
    res.render('AccountCreatedPage', {});
});

app.get(
    '/afmelden/:marktId/',
    keycloak.protect(KeycloakRoles.MARKTONDERNEMER),
    csrfProtection,
    (req: GrantedRequest, res: Response) => {
        marketAttendancePage(
            req,
            res,
            getErkenningsNummer(req),
            req.params.marktId,
            req.query,
            KeycloakRoles.MARKTONDERNEMER,
            req.csrfToken(),
        );
    },
);

app.post(
    '/afmelden/:marktId/',
    keycloak.protect(KeycloakRoles.MARKTONDERNEMER),
    csrfProtection,
    (req: GrantedRequest, res: Response, next: NextFunction) =>
        handleMarketAttendanceUpdate(req, res, next, getErkenningsNummer(req)),
);

app.get(
    '/ondernemer/:erkenningsNummer/afmelden/:marktId/',
    keycloak.protect(KeycloakRoles.MARKTMEESTER),
    csrfProtection,
    (req: GrantedRequest, res: Response) => {
        marketAttendancePage(
            req,
            res,
            req.params.erkenningsNummer,
            req.params.marktId,
            req.query,
            KeycloakRoles.MARKTMEESTER,
            req.csrfToken(),
        );
    },
);

app.post(
    '/ondernemer/:erkenningsNummer/afmelden/:marktId/',
    keycloak.protect(KeycloakRoles.MARKTMEESTER),
    csrfProtection,
    (req: Request, res: Response, next: NextFunction) =>
        handleMarketAttendanceUpdate(req, res, next, req.params.erkenningsNummer),
);

app.get(
    '/aanwezigheid/',
    keycloak.protect(KeycloakRoles.MARKTONDERNEMER),
    csrfProtection,
    (req: GrantedRequest, res: Response, next: NextFunction) => {
        attendancePage(
            req, res, next,
            KeycloakRoles.MARKTONDERNEMER,
            getErkenningsNummer(req),
            req.csrfToken()
        );
    },
);

app.post(
    '/aanwezigheid/',
    keycloak.protect(KeycloakRoles.MARKTONDERNEMER),
    csrfProtection,
    (req: GrantedRequest, res: Response, next: NextFunction) =>
        handleAttendanceUpdate(
            req, res, next,
            KeycloakRoles.MARKTONDERNEMER,
            getErkenningsNummer(req)
        )
);

app.get(
    '/voorkeuren/:marktId/',
    keycloak.protect(KeycloakRoles.MARKTONDERNEMER),
    csrfProtection,
    (req: GrantedRequest, res: Response) => {
        plaatsvoorkeurenPage(
            req,
            res,
            getErkenningsNummer(req),
            req.query,
            req.params.marktId,
            KeycloakRoles.MARKTONDERNEMER,
            req.csrfToken(),
        );
    },
);

app.post(
    ['/voorkeuren/:marktId/'],
    keycloak.protect(KeycloakRoles.MARKTONDERNEMER),
    csrfProtection,
    (req: GrantedRequest, res: Response, next: NextFunction) =>
        updatePlaatsvoorkeuren(req, res, next, req.params.marktId, getErkenningsNummer(req)),
);

app.get(
    '/ondernemer/:erkenningsNummer/voorkeuren/:marktId/',
    keycloak.protect(KeycloakRoles.MARKTMEESTER),
    csrfProtection,
    (req: GrantedRequest, res: Response) => {
        plaatsvoorkeurenPage(
            req,
            res,
            req.params.erkenningsNummer,
            req.query,
            req.params.marktId,
            KeycloakRoles.MARKTMEESTER,
            req.csrfToken(),
        );
    },
);

app.post(
    '/ondernemer/:erkenningsNummer/voorkeuren/:marktId/',
    keycloak.protect(KeycloakRoles.MARKTMEESTER),
    csrfProtection,
    (req: Request, res: Response, next: NextFunction) =>
        updatePlaatsvoorkeuren(req, res, next, req.params.marktId, req.params.erkenningsNummer),
);

app.get(
    '/markt-detail/:marktId/',
    keycloak.protect(KeycloakRoles.MARKTONDERNEMER),
    (req: GrantedRequest, res: Response, next: NextFunction) =>
    marktDetail(
        req,
        res,
        next,
        getErkenningsNummer(req),
        KeycloakRoles.MARKTONDERNEMER
    ),
);

app.get(
    '/ondernemer/:erkenningsNummer/markt-detail/:marktId/',
    keycloak.protect(KeycloakRoles.MARKTMEESTER),
    (req: GrantedRequest, res: Response, next: NextFunction) =>
    marktDetail(
        req,
        res,
        next,
        req.params.erkenningsNummer,
        KeycloakRoles.MARKTMEESTER,
    ),
);

app.get(
    '/algemene-voorkeuren/:marktId/',
    keycloak.protect(KeycloakRoles.MARKTONDERNEMER),
    csrfProtection,
    (req: GrantedRequest, res: Response) => {
        marketPreferencesPage(
            req,
            res,
            getErkenningsNummer(req),
            req.params.marktId,
            KeycloakRoles.MARKTONDERNEMER,
            req.csrfToken(),
        );
    },
);

app.post(
    '/algemene-voorkeuren/:marktId/',
    keycloak.protect(KeycloakRoles.MARKTONDERNEMER),
    csrfProtection,
    (req: GrantedRequest, res: Response, next: NextFunction) =>
        updateMarketPreferences(
            req,
            res,
            next,
            getErkenningsNummer(req),
            KeycloakRoles.MARKTONDERNEMER
        ),
);

app.get(
    '/verwijder-ondernemer/',
    keycloak.protect(KeycloakRoles.MARKTMEESTER),
    csrfProtection,
    (req: GrantedRequest, res: Response) => {
        !req.url.endsWith('/') ?
            res.redirect(301, `${req.url}/`) :
            deleteUserPage(
                req,
                res,
                null,
                null,
                req.csrfToken(),
                KeycloakRoles.MARKTMEESTER,
            );
    },
);

app.post(
    '/verwijder-ondernemer/',
    keycloak.protect(KeycloakRoles.MARKTMEESTER),
    csrfProtection,
    (req: GrantedRequest, res: Response) => {
        deleteUser(
            req,
            res,
            req.body.erkenningsNummer
        );
    },
);

app.get(
    '/ondernemer/:erkenningsNummer/algemene-voorkeuren/:marktId/',
    keycloak.protect(KeycloakRoles.MARKTMEESTER),
    csrfProtection,
    (req: GrantedRequest, res: Response) => {
        marketPreferencesPage(
            req,
            res,
            req.params.erkenningsNummer,
            req.params.marktId,
            KeycloakRoles.MARKTMEESTER,
            req.csrfToken(),
        );
    },
);

app.post(
    '/ondernemer/:erkenningsNummer/algemene-voorkeuren/:marktId/',
    keycloak.protect(KeycloakRoles.MARKTMEESTER),
    csrfProtection,
    (req: Request, res: Response, next: NextFunction) =>
        updateMarketPreferences(
            req,
            res,
            next,
            req.params.erkenningsNummer,
            KeycloakRoles.MARKTMEESTER,
        ),
);

app.get(
    '/profile/:erkenningsNummer',
    keycloak.protect(KeycloakRoles.MARKTMEESTER),
    (req: GrantedRequest, res: Response) =>
        publicProfilePage(
            req,
            res,
            req.params.erkenningsNummer,
            KeycloakRoles.MARKTMEESTER,
        )
);

app.get(
    '/ondernemer/:erkenningsNummer/toewijzingen-afwijzingen/',
    keycloak.protect(KeycloakRoles.MARKTMEESTER),
    (req: GrantedRequest, res: Response) =>
        toewijzingenAfwijzingenPage(
            req,
            res,
            req.params.erkenningsNummer,
            KeycloakRoles.MARKTMEESTER
        )
);

app.get(
    '/toewijzingen-afwijzingen/',
    keycloak.protect(KeycloakRoles.MARKTONDERNEMER),
    (req: GrantedRequest, res: Response) =>
        toewijzingenAfwijzingenPage(
            req,
            res,
            getErkenningsNummer(req),
            KeycloakRoles.MARKTONDERNEMER
        )
);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (process.env.APP_ENV === 'production') {
        res.render('ErrorPage', { errorCode: 500, req });
    } else {
        res.render('ErrorPage', { message: err.message, stack: err.stack, errorCode: 500, req });
    }
});

// Static files that are public (robots.txt, favicon.ico)
app.use(express.static('./src/public/'));
app.use(express.static('./dist/public/'));

// Static files that require authorization (business logic scripts for example)
app.use(keycloak.protect(), express.static('./src/www/'));

const port = process.env.PORT || HTTP_DEFAULT_PORT;

app.listen(port, (err: Error | null) => {
    if (err) {
        console.error(err);
    } else {
        console.log(`Listening on port ${port}`);
    }
});
