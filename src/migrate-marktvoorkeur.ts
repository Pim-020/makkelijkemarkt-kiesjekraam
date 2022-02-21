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
        updateMarktVoorkeur(convertedVoorkeur).then( (result) => {
            if ( result ){
                Voorkeur.destroy({
                    where: {
                        erkenningsNummer: convertedVoorkeur.erkenningsNummer,
                        marktId: convertedVoorkeur.marktId,
                    },
                })
                console.log(`SUCCESS: ${result}`);
            } else {
                console.log(`FAIL: ${result}`);
            }
        })
    })
});

