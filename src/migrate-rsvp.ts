import { updateRsvp,getAanmeldingenByOndernemer } from './makkelijkemarkt-api';
import { rsvp } from './model/index';
import { RSVP } from './model/rsvp.model';

rsvp.findAll<RSVP>({
    where: {},
    raw: true
}).then(
    rsvps => {
        rsvps.forEach(r => {
            console.log(r);
            updateRsvp(r.marktId, r.marktDate, r.erkenningsNummer, r.attending);
            rsvp.destroy({
                where: {
                    id: r.id
                }
            });
        })
    }
);

