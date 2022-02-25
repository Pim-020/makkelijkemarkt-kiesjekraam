import {
    getMarkten,
    postBranche,
    postMarktConfiguratie,
    postObstakel,
    postPlaatseigenschap
} from './makkelijkemarkt-api';
import {
    IBranche,
    IBrancheInput,
    IMarktConfiguratieInput,
    IMarktplaats,
    IObstakelInput,
    IPlaatsEigenschapInput
} from './markt.model';
import { MarktConfig } from './model';
import { MMMarkt } from './makkelijkemarkt.model';

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

const generateConfigInput = config => {
    const localBranches = config.branches.map((branche: IBranche) => {
        const configBranche: any = {
            brancheId: branche.brancheId
        };

        if ('verplicht' in branche) { configBranche.verplicht = branche.verplicht; }
        if ('maximumPlaatsen' in branche) { configBranche.maximumPlaatsen = branche.maximumPlaatsen; }

        return configBranche;
    });

    const locaties = config.marktplaatsen.map((locatie: IMarktplaats) => {
        const configLocatie: any = {
            plaatsId: locatie.plaatsId
        };

        if (locatie.branches) { configLocatie.branches = locatie.branches; }
        if (locatie.properties) { configLocatie.properties = locatie.properties; }
        if (locatie.verkoopinrichting) { configLocatie.verkoopinrichting = locatie.verkoopinrichting; }
        if (locatie.inactive) { configLocatie.inactive = locatie.inactive; }

        return configLocatie;
    });

    const configOpstellingen = { rows: [] };

    config.rows.forEach(row => {
        const currentRow = [];

        row.forEach(space => {
            currentRow.push(space.plaatsId);
        });

        configOpstellingen.rows.push(currentRow);
    });

    return {
        geografie: { obstakels: config.obstakels },
        branches: localBranches,
        paginas: config.paginas,
        marktOpstelling: configOpstellingen,
        locaties
    };
};

const handleConfig = async (markt: MMMarkt, config) => {
    const id = markt.id;

    await postMarktConfiguratie(id, generateConfigInput(config));
};

migrateConfig().then(result => {
    console.log(result);
    process.exit();
});
