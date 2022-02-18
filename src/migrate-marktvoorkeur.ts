import { updateMarktVoorkeur, convertVoorkeurToVoorkeurRow } from './makkelijkemarkt-api';
import { voorkeur } from './model/index';
import { Voorkeur } from './model/voorkeur.model';
import {convertVoorkeur} from './pakjekraam-api';

voorkeur.findAll<Voorkeur>({
    where: {},
    raw: true,
}).then( voorkeuren => {
    voorkeuren.forEach(v => {
        const convertedVoorkeur = convertVoorkeur(v);
        console.log(convertedVoorkeur);
        updateMarktVoorkeur(convertedVoorkeur).then( () =>
            Voorkeur.destroy({
                where: {
                    erkenningsNummer: convertedVoorkeur.erkenningsNummer,
                    marktId: convertedVoorkeur.marktId,
                },
            })
        ).catch(() => console.log(`${convertedVoorkeur.erkenningsNummer} with marktId ${convertedVoorkeur.marktId} failed`));
    })
})

