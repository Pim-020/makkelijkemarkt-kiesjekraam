import {
    getMarkten,
    postBranche,
    postMarktConfiguratie,
    postObstakel,
    postPlaatseigenschap
} from './makkelijkemarkt-api';
import { IBranche } from './markt.model';
import { MarktConfig } from './model';
import { MMMarkt } from './makkelijkemarkt.model';

export interface IBrancheInput {
    afkorting: string,
    omschrijving: string,
    color: string
}

export interface IObstakelInput {
    naam: string
}

export interface IPlaatsEigenschapInput {
    naam: string
}

export interface IMarktConfiguratieInput {
    geografie: any,
    locaties: any,
    marktOpstelling: any,
    paginas: any,
    branches: any
}

const branches = new Map<string, IBrancheInput>();
const obstakels = new Map<string, IObstakelInput>();
const plaatseigenschappen = new Map<string, IPlaatsEigenschapInput>();

export const migrateConfig = async (): Promise<boolean> => {
    const markten = await getMarkten(true);

    console.log('Markten opzoeken in config: ', markten.map(markt => markt.naam));

    const promises = markten.map(markt => {
        return handleMarkt(markt);
    });

    await Promise.all(promises);

    await handleBranches();
    await handleObstakels();
    await handlePlaatsEigenschappen();

    return true;
};

const handleMarkt = async (markt: MMMarkt) => {
    let config;

    try {
        config = await MarktConfig.get(markt.afkorting);
    } catch (e) {
        console.log(`Markt ${markt.naam} niet gevonden in KJK`);
        return;
    }

    config.branches.forEach((branche: IBranche) => {
        const id = branche.brancheId;

        if (branches.get(id)) {
            return;
        }

        branches.set(id, {
            afkorting: branche.brancheId,
            omschrijving: branche.description,
            color: branche.color.replace('#', '')
        });
    });

    config.obstakels.forEach(obstakel => {
        obstakel.obstakel.forEach((name: string) => {
            if (obstakels.get(name)) {
                return;
            }

            obstakels.set(name, { naam: name });
        });
    });

    config.marktplaatsen.forEach(locatie => {
        if (!locatie.properties) {
            return;
        }

        locatie.properties.forEach((property: string) => {
            if (plaatseigenschappen.get(property)) {
                return;
            }

            plaatseigenschappen.set(property, { naam: property });
        });
    });

    await handleConfig(markt, config);
};

const handleBranches = async () => {
    const unresolvedPosts = [];

    for (const [_, value] of branches) {
        unresolvedPosts.push(postBranche(value));
    }

    console.log(`Saving ${branches.size} branches`);

    await Promise.all(unresolvedPosts.map(post => post.catch(e => e)));
};

const handleObstakels = async () => {
    const unresolvedPosts = [];

    for (const [_, value] of obstakels) {
        unresolvedPosts.push(postObstakel(value));
    }

    console.log(`Saving ${obstakels.size} obstakels`);

    await Promise.all(unresolvedPosts.map(post => post.catch(e => e)));
};

const handlePlaatsEigenschappen = async () => {
    const unresolvedPosts = [];

    for (const [_, value] of plaatseigenschappen) {
        unresolvedPosts.push(postPlaatseigenschap(value));
    }

    console.log(`Saving ${plaatseigenschappen.size} plaatseigenschappen`);

    await Promise.all(unresolvedPosts.map(post => post.catch(e => e)));
};

const handleConfig = async (markt: MMMarkt, config) => {
    const id = markt.id;

    const marktConfiguratie: IMarktConfiguratieInput = {
        geografie: { obstakels: config.obstakels },
        branches: config.branches,
        paginas: config.paginas,
        marktOpstelling: { rows: config.rows },
        locaties: config.marktplaatsen
    };

    await postMarktConfiguratie(id, marktConfiguratie);
};

migrateConfig().then(result => {
    console.log(result);
});
