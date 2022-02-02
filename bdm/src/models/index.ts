export interface INaam {
    naam: string
    id: number
}

export interface Plan {
    name: string
    pages: number
}
export interface MarketState {
    id: number
    name: string
    valid?: boolean
}

export interface Assignment {
    class: string
    title: string
    landmarkTop: string
    landmarkBottom: string
    plaatsList: string[]
}

export interface Rows {
    rows: string[][]
}

export interface Page {
    title: string
    indelingslijstGroup: Assignment[]
}

export interface Market {
    id: number
    name: string
    phase?: string
    plan?: Plan
    municipality?: string
    stands?: number
    invalid?: boolean
}

// Kraam
export interface Stand {
    plaatsId: string
    branches?: string[]
    verkoopinrichting?: string[]
    properties?: string[]
    type?: "stand"
}

// Obstakel
export interface Obstacle {
    kraamA: string
    kraamB: string
    obstakel: string[]
    type?: "obstacle"
}

// Plek
export interface Lot {
    plaatsId?: string
    branches?: string[]
    verkoopinrichting?: string[]
    properties?: string[]
    kraamA?: string
    kraamB?: string
    obstakel?: string[]
    type?: "lot" | "stand" | "obstacle"
    selected?: boolean
    blockPosition?: [number, number]
    blockStart?: boolean
    blockEnd?: boolean
    invalid?: boolean
}

export interface Geography {
    obstakels: Obstacle[]
}

// Branches for the general Branches list
export interface IBranche {
    brancheId: string
    number?: number
    description: string
    color: string
    afkorting: string
}

export interface Branche extends Omit<IBranche, "afkorting"> {}

export interface Announcement {
    activatie: string
    wenperiode: string
    live: string
}

export interface Announcements {
    marktDetail: Announcement
    marktDetailPlaatsvoorkeuren: Announcement
    aanwezigheid: Announcement
    plaatsVoorkeuren: Announcement
}

export interface AssignedBranche {
    brancheId: string
    verplicht: boolean
    maximumPlaatsen?: number
    allocated?: number
    backGroundColor?: string
    color?: string
}

export interface Markets {
    [key: string]: Market
}

export interface MarketLayout {
    _key: string
    class: string
    landmarkTop: string
    landmarkBottom: string
    title: string
    lots: Lot[]
    invalid?: boolean
}

export interface MarketPage {
    layout: MarketLayout[]
    title: string
    invalid?: boolean
}

export interface MarketEventDetails {
    branches: AssignedBranche[]
    pages: MarketPage[]
}

export interface DayOfWeek {
    id: number
    name: string
    abbreviation: string
}

export interface IMarktConfiguratie {
    branches: AssignedBranche[]
    geografie: Geography
    locaties: Lot[]
    marktOpstelling: Rows
    paginas: Page[]
}

export interface IMarketContext {
    marktId: string
    saveMarktConfig(marktConfiguratie: IMarktConfiguratie): void
    saveInProgress: boolean
    genericBranches: Branche[]
    markt: Required<IMarkt>
    marktConfig: IMarktConfiguratie
    obstakel: INaam[]
    plaatseigenschap: INaam[]
}

export interface IApiError extends Error {
    status?: number;
}

export interface IMarkt {
    id: number
    afkorting: string
    naam: string
}

export const WeekDays: DayOfWeek[] = [
    {id: 0, name: "Maandag", abbreviation: "MA"},
    {id: 1, name: "Dinsdag", abbreviation: "DI"},
    {id: 2, name: "Woensdag", abbreviation: "WO"},
    {id: 3, name: "Donderdag", abbreviation: "DO"},
    {id: 4, name: "Vrijdag", abbreviation: "VR"},
    {id: 5, name: "Zaterdag", abbreviation: "ZA"},
    {id: 6, name: "Zondag", abbreviation: "ZO"}
]
