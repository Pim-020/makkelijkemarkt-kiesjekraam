import { MMMarkt } from './makkelijkemarkt.model';

export type PlaatsId = string;

export type ErkenningsNummer = string;

export type BrancheId = string;

export enum KraamInrichting {
    EIGEN_MATERIEEL = 'eigen-materieel',
}

export enum ObstakelType {
    LOOPJE = 'loopje',
    OPTIONAL_LOOPJE = 'loopjediedichtmag',
    LANTAARNPAAL = 'lantaarnpaal',
    BOOM = 'boom',
    BANKJE = 'bankje',
}

export enum VerkoopinrichtingType {
    EIGEN_MATERIEEL = 'eigen-materieel',
}

export enum DeelnemerStatus {
    VASTE_PLAATS = 'vpl',
    TIJDELIJKE_VASTE_PLAATS = 'tvpl',
    TIJDELIJKE_VASTE_PLAATS_Z = 'tvplz',
    TIJDELIJKE_VASTE_PLAATS_OLD = 'vkk',
    SOLLICITANT = 'soll',
    EXPERIMENTAL = 'exp',
    EXPERIMENTAL_F = 'expf',
}

export interface IMarktProperties {
    marktId?: string;
    marktDate?: string;
    expansionLimit?: number;
    rows?: string[][];
}

export interface IMarkt {
    marktId: string;
    marktDate: string;
    naam: string;
    branches: IBranche[];
    rows: IMarktplaats[][];
    marktplaatsen: IMarktplaats[];
    voorkeuren: IPlaatsvoorkeur[];
    ondernemers: IMarktondernemer[];
    obstakels: IObstakelBetween[];
    expansionLimit?: number;
}

export interface IMarktindelingSeed {
    aanwezigheid: IRSVP[];
    aLijst: IMarktondernemer[];
}

export interface IMarktindeling extends IMarkt, IMarktindelingSeed {
    openPlaatsen: IMarktplaats[];
    afwijzingen: IAfwijzing[];
    toewijzingen: IToewijzing[];
}

export interface IRSVP {
    // `id` is used by Sequelize
    id?: number;
    marktId?: string;
    marktDate: string;
    erkenningsNummer: ErkenningsNummer;
    attending: boolean;
}

export interface IMarktdeelnemer {}

// TODO: Implement 'standwerker' en 'promoplek' als `IMarktdeelnemer`

export interface IMarktondernemerVoorkeur {
    erkenningsNummer: string;
    marktId?: string;
    marktDate?: string;
    minimum?: number;
    maximum?: number;
    krachtStroom?: boolean;
    kraaminrichting?: KraamInrichting;
    anywhere?: boolean;
    absentFrom?: Date;
    absentUntil?: Date;
    branches?: BrancheId[];
    verkoopinrichting?: string[];
}

export interface IMarktondernemerVoorkeurRow {
    erkenningsNummer: string;
    marktId?: string;
    marktDate?: string;
    minimum?: number;
    maximum?: number;
    krachtStroom?: boolean;
    kraaminrichting?: KraamInrichting;
    anywhere?: boolean;
    absentFrom?: Date;
    absentUntil?: Date;
    brancheId?: BrancheId;
    parentBrancheId?: BrancheId;
    inrichting?: string;
}

export interface IMarktondernemer extends IMarktdeelnemer {
    description: string;
    erkenningsNummer: ErkenningsNummer;
    sollicitatieNummer: number;
    plaatsen?: PlaatsId[];
    status: DeelnemerStatus;
    voorkeur?: IMarktondernemerVoorkeur;
}

export interface IMarktplaats {
    plaatsId: PlaatsId;
    properties?: string[];
    branches?: BrancheId[];
    verkoopinrichting?: string[];
    inactive?: boolean;
}

export interface IObstakelAt {
    kraam: string;
    obstakel: ObstakelType;
}

export interface IObstakelBetween {
    kraamA: string;
    kraamB: string;
    obstakel: ObstakelType;
}

export interface IToewijzing {
    marktId: string;
    marktDate: string;
    plaatsen: PlaatsId[];
    erkenningsNummer: ErkenningsNummer;
    ondernemer?: IMarktondernemer;
    anywhere?: boolean;
    minimum?: number;
    maximum?: number;
    plaatsvoorkeuren?: string[];
    brancheId?: BrancheId;
    bak?: boolean;
    eigenMaterieel?: boolean;
}

export interface IAfwijzingReason {
    message: string;
    code?: number;
}

export interface IAfwijzing {
    marktId: string;
    marktDate: string;
    erkenningsNummer: string;
    ondernemer: IMarktondernemer;
    reason: IAfwijzingReason;
    anywhere?: boolean;
    minimum?: number;
    maximum?: number;
    plaatsvoorkeuren?: string[];
    brancheId?: BrancheId;
    bak?: boolean;
    eigenMaterieel?: boolean;
}

export interface IBranche {
    description?: string;
    brancheId: BrancheId;
    maximumPlaatsen?: number;
    maximumToewijzingen?: number;
    verplicht?: boolean;
    color?: string;
    number?: number;
}

export interface IGenericBranche {
    id: number;
    afkorting: string;
    omschrijving: string;
    color: string;
}

export interface IPlaatsvoorkeur {
    erkenningsNummer: ErkenningsNummer;
    marktId: string;
    plaatsId: PlaatsId;
    priority: number;
}

export interface IPlaatsvoorkeurRow {
    // `id` is used by Sequelize
    id?: number;
    marktId: string;
    erkenningsNummer: string;
    plaatsId: string;
    priority: number;
}

export interface IBrancheInput {
    afkorting: string;
    omschrijving: string;
    color: string;
}

export interface IObstakelInput {
    naam: string;
}

export interface IPlaatsEigenschapInput {
    naam: string;
}

export interface AssignedBranche {
    brancheId: string;
    verplicht: boolean;
    maximumPlaatsen?: number;
    allocated?: number;
    backGroundColor?: string;
    color?: string;
}

export interface Obstacle {
    kraamA: string;
    kraamB: string;
    obstakel: string[];
    type?: 'obstacle';
}

export interface Geography {
    obstakels: Obstacle[];
}

export interface Lot {
    plaatsId?: string;
    branches?: string[];
    verkoopinrichting?: string[];
    properties?: string[];
    kraamA?: string;
    kraamB?: string;
    obstakel?: string[];
    type?: 'lot' | 'stand' | 'obstacle';
    selected?: boolean;
    blockPosition?: [number, number];
    blockStart?: boolean;
    blockEnd?: boolean;
    invalid?: boolean;
}

export interface Rows {
    rows: string[][];
}

export interface Page {
    title: string;
    indelingslijstGroup: Assignment[];
}

export interface Assignment {
    class: string;
    title: string;
    landmarkTop: string;
    landmarkBottom: string;
    plaatsList: string[];
}

export interface IMarktConfiguratie {
    branches: AssignedBranche[];
    geografie: Geography;
    locaties: Lot[];
    marktOpstelling: Rows;
    paginas: Page[];
}

export interface IMarktConfiguratieInput {
    geografie: any;
    locaties: any;
    marktOpstelling: any;
    paginas: any;
    branches: any;
}
