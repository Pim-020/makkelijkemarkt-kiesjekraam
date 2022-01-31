import Configuration from './configuration'

type datasetType = "branches" | "pages" | "lots" | "geography" | "rows"

export class Service<T> {
    config: Configuration
    constructor() {
        this.config = new Configuration()
    }
    handleResponseError(response: Response) {
        throw new Error(`(${response.status}) de wijzigingen zijn niet verwerkt`)
    }

    handleError(error: Error) {
        throw error
    }

    getFilename(route: string, dataset: datasetType) {
        if (route !== "generic") {
            switch (dataset) {
                case "pages":
                    return `${this.config.API_BASE_URL}/markt/${route}/paginas.json`
                case "lots":
                    return `${this.config.API_BASE_URL}/markt/${route}/locaties.json`
                case "geography":
                    return `${this.config.API_BASE_URL}/markt/${route}/geografie.json`
                case "branches":
                    return `${this.config.API_BASE_URL}/markt/${route}/branches.json`
                case "rows":
                    return `${this.config.API_BASE_URL}/markt/${route}/markt.json`
                default:
                    return ""
            }
        } else if (route === "generic") {
            switch (dataset) {
                case "branches":
                    return `${this.config.API_BASE_URL}/markt/branches.json`
                default:
                    return ""
            }
        } else {
            return ""
        }
    }

    async getData(route: string, dataset: datasetType, empty: T): Promise<T> {
        // Retrieve from Cache
        const cached = localStorage.getItem(`bwdm_cache_${route}_${dataset}`)
        if (cached) {
            //console.debug(`${dataset} for ${route} are cached`)
            return JSON.parse(cached)
        }
        //console.debug(`${dataset} for ${route} not cached`)

        // Fetch
        if (this.config.ONLINE) {
            return fetch(this.getFilename(route, dataset), { credentials: 'include' })
                .then(response => {
                    if (!response.ok) {
                        this.handleResponseError(response)
                    }
                    return response.json()
                })
                .then(json => {
                    const item = json
                    // Cache
                    localStorage.setItem(`bwdm_cache_${route}_${dataset}`, JSON.stringify(item))
                    return item
                })
                .catch(error => {
                    this.handleError(error)
                })
        } else {
            return new Promise((resolve) => {
                localStorage.setItem(`bwdm_cache_${route}_${dataset}`, JSON.stringify(empty))
                resolve(empty)
            })
        }
    }

    async postData(route: string, dataset: datasetType, data: T) {
        // Update Cache
        localStorage.setItem(`bwdm_cache_${route}_${dataset}`, JSON.stringify(data))

        // Post
        return await fetch(this.getFilename(route, dataset),
            {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    "Content-type": "application/json"
                },
                credentials: 'include'
            })
            .then(response => {
                if (!response.ok) {
                    this.handleResponseError(response)
                }
                return "ok"
            })
            .catch(error => {
                this.handleError(error)
            })
    }
}
