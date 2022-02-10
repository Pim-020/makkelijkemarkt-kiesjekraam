import { useQuery } from 'react-query'
import { mmApiService, mmApiSaveService } from "../services/service_mm_api"

const USE_QUERY_CONFIG = {
    // refetchOnWindowFocus: false
    // placeholderData: [],
    refetchOnWindowFocus: false, //refetch when window comes to focus
    // refetchOnReconnect: false, //refetch when browser reconnects to server
    // refetchOnMount: false, //refetch when component mounts
}

export const useGenericBranches = () => {
    console.log('useGenericBranches hook')
    return useQuery('genericBranches', () => {
        return mmApiService(`/api/mm/branches`)
    }, USE_QUERY_CONFIG)
}

export const useMarktConfig = (marktId: string) => {
    console.log('useMarktConfig hook')
    return useQuery('marktconfig', () => {
        return mmApiService(`/api/markt/${marktId}/marktconfiguratie/latest`)
    }, USE_QUERY_CONFIG)
}
