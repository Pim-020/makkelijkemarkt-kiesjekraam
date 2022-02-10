import { useQuery } from 'react-query'

import { Branche, IApiError, IMarktConfiguratie } from '../models'
import { mmApiService, mmApiSaveService } from "../services/service_mm_api"

const USE_QUERY_CONFIG = {
    retry: 1,
    // refetchOnWindowFocus: false
    // placeholderData: [],
    refetchOnWindowFocus: false, //refetch when window comes to focus
    // refetchOnReconnect: false, //refetch when browser reconnects to server
    // refetchOnMount: false, //refetch when component mounts
}

export const useGenericBranches = () => {
    console.log('useGenericBranches hook')
    return useQuery<Branche[], IApiError>('genericBranches', () => {
        return mmApiService(`/api/mm/branches`)
    }, USE_QUERY_CONFIG)
}

export const useMarktConfig = (marktId: string) => {
    console.log('useMarktConfig hook')
    return useQuery<IMarktConfiguratie, IApiError>('marktconfig', () => {
        return mmApiService(`/api/markt/${marktId}/marktconfiguratie/latest`)
    }, USE_QUERY_CONFIG)
}

export const useObstakel = () => {
    console.log('useObstakel hook')
    return useQuery<{id: number, naam: string}[], IApiError>('obstakel', () => {
        return mmApiService(`/api/obstakel`)
    }, USE_QUERY_CONFIG)
}

// export const useMarkt = (marktId: string) => {
//     console.log('useMarkt hook')
//     return useQuery('markt', () => {
//         return mmApiService(`/api/markt/${marktId}`)
//     }, USE_QUERY_CONFIG)
// }
