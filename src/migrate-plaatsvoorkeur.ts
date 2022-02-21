import { updatePlaatsvoorkeur } from './makkelijkemarkt-api';
import { plaatsvoorkeur } from './model/index';
import { Plaatsvoorkeur } from 'model/plaatsvoorkeur.model';

let plaatsvoorkeurenByKoopmanAndMarkt = [];

plaatsvoorkeur.findAll<Plaatsvoorkeur>({
    where: {},
    raw: true,
}).then( plaatsvoorkeuren => {
    plaatsvoorkeuren.forEach( p => {
        if(!plaatsvoorkeurenByKoopmanAndMarkt[p.erkenningsNummer]){
            plaatsvoorkeurenByKoopmanAndMarkt[p.erkenningsNummer] = [];
        }
        if(!plaatsvoorkeurenByKoopmanAndMarkt[p.erkenningsNummer][p.marktId]){
            plaatsvoorkeurenByKoopmanAndMarkt[p.erkenningsNummer][p.marktId] = [];
        }
        plaatsvoorkeurenByKoopmanAndMarkt[p.erkenningsNummer][p.marktId].push(p);
    })
    plaatsvoorkeurenByKoopmanAndMarkt.forEach( koopman => {
        koopman.forEach( koopmanAndMarkt => {
            console.log(koopmanAndMarkt);
            updatePlaatsvoorkeur(koopmanAndMarkt)
            .then( (result) => {
                if ( result ){
                console.log(result);
                plaatsvoorkeur.destroy({
                    where: {
                        erkenningsNummer: koopmanAndMarkt[0].erkenningsNummer,
                        marktId: koopmanAndMarkt[0].marktId,
                    },
                });
                } else {
                    console.log(`${koopmanAndMarkt[0].erkenningsNummer} with marktId ${koopmanAndMarkt[0].marktId} failed`)
                }
            }).catch(() => console.log(`${koopmanAndMarkt[0].erkenningsNummer} with marktId ${koopmanAndMarkt[0].marktId} failed`));
        });
    });
});
