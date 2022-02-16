import express, { Request, Response, NextFunction } from 'express';
import { GrantedRequest } from 'keycloak-connect';

import { Roles, keycloak } from '../authentication';
import { callApiGeneric, HttpMethod } from '../makkelijkemarkt-api';

const router = express.Router();
const subroutes = [
    '/branche/all',
    '/obstakel/all',
    '/plaatseigenschap/all',
    '/markt/:marktId',
    '/markt/:marktId/marktconfiguratie/latest', // GET
    '/markt/:marktId/marktconfiguratie', // POST
];

const isProtectionDisabled = Boolean(process.env.DISABLE_MM_API_DISPATCH_PROTECTION);
const applyProtectionIfNeeded = () => {
    if (isProtectionDisabled) {
        return (req: Request, res: Response, next: NextFunction) => {
            next();
        };
    }
    return keycloak.protect(token => token.hasRole(Roles.MARKTBEWERKER));
};

subroutes.forEach((subroute: string) => {
    router.all(subroute, applyProtectionIfNeeded(), async (req: GrantedRequest, res: Response) => {
        console.log(req.url);
        try {
            const result = await callApiGeneric(req.url, req.method.toLowerCase() as HttpMethod, req.body);
            return res.send(result);
        } catch (error) {
            res.status(error.response.status);
            return res.send({ statusText: error.response.statusText, message: error.response.data });
        }
    });
});

export default router;
