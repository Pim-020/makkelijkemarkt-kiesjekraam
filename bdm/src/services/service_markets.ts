import { AssignedBranche, Geography, Markets, Page, Rows, Lot } from '../models'
import { Service } from './service'

export default class MarketsService extends Service<Markets> {
    async retrieve(): Promise<Markets> {
        // Retrieve from Cache
        const cachedMarkets = localStorage.getItem(`bwdm_cache_markets`)
        if (cachedMarkets) {
            console.debug(`Markets cached`)
            let items = JSON.parse(cachedMarkets)
            if (items) {
                return items
            }
            return {}
        } else {
            return {}
        }
    }
}

export class RowsService extends Service<Rows> {
    async update(route: string, data: Rows) {
        return this.postData(route, "rows", data)
    }

    async retrieve(route: string): Promise<Rows> {
        return this.getData(route, "rows", { rows: [] })
    }
}

export class BranchesService extends Service<AssignedBranche[]> {
    async update(route: string, data: AssignedBranche[]) {
        return this.postData(route, "branches", data)
    }

    async retrieve(route: string): Promise<AssignedBranche[]> {
        return this.getData(route, "branches", [])
    }
}

export class GeographyService extends Service<Geography> {
    async update(route: string, data: Geography) {
        return this.postData(route, "geography", data)
    }

    async retrieve(route: string): Promise<Geography> {
        return this.getData(route, "geography", { obstakels: [] })
    }
}

export class LotsService extends Service<Lot[]> {
    async update(route: string, data: Lot[]) {
        return this.postData(route, "lots", data)
    }

    async retrieve(route: string): Promise<Lot[]> {
        return this.getData(route, "lots", [])
    }
}

export class PagesService extends Service<Page[]> {
    async update(route: string, data: Page[]) {
        return this.postData(route, "pages", data)
    }

    async retrieve(route: string): Promise<Page[]> {
        return this.getData(route, "pages", [])
    }
}

