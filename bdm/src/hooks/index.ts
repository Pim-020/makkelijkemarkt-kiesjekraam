import { useMutation, useQuery, useQueryClient } from 'react-query'
import { sortBy } from 'lodash'

import { MM_API_QUERY_CONFIG } from '../constants'
import { Branche, IApiError, IBranche, IMarktConfiguratie, INaam, MMarkt } from '../models'
import * as mmApi from '../services/mmApi'


export const useGenericBranches = () => {
    return useQuery<Branche[], IApiError>('genericBranches', async() => {
        const branche = await mmApi.get(`/branche/all`)
        return branche.map((b:IBranche) => {
            const { afkorting:brancheId, color, ...rest } = b
            const getColor = (color:string): string => {
                const hexColorRegex = /^[0-9a-f]{3,6}$/i
                if (hexColorRegex.test(color)) {
                    return `#${color}`
                }
                return color
            }
            return {...rest, color: getColor(color), brancheId}
        })
    }, MM_API_QUERY_CONFIG)
}

export const useMarktConfig = (marktId: string) => {
    return useQuery<IMarktConfiguratie, IApiError>('marktconfig', () => {
        return mmApi.get(`/markt/${marktId}/marktconfiguratie/latest`)
    }, MM_API_QUERY_CONFIG)
}

export const useSaveMarktConfig = (marktId: string) => {
    const queryClient = useQueryClient()
    return useMutation<IMarktConfiguratie, IApiError, IMarktConfiguratie>((marktConfiguratie) => {
        return mmApi.post(`/markt/${marktId}/marktconfiguratie/`, marktConfiguratie)
    },
    {
        ...MM_API_QUERY_CONFIG,
        onSuccess: () => queryClient.invalidateQueries('marktconfig'),
    })
}

export const useObstakel = () => {
    return useQuery<INaam[], IApiError>('obstakel', async() => {
        const obstakel = await mmApi.get(`/obstakel/all`)
        return sortBy(obstakel, 'naam');
    }, MM_API_QUERY_CONFIG)
}

export const usePlaatseigenschap = () => {
    return useQuery<INaam[], IApiError>('plaatseigenschap', async() => {
        const plaatseigenschap = await mmApi.get(`/plaatseigenschap/all`)
        return sortBy(plaatseigenschap, 'naam');
    }, MM_API_QUERY_CONFIG)
}

export const useMarkt = (marktId: string) => {
    return useQuery<MMarkt, IApiError>('markt', () => {
        return mmApi.get(`/markt/${marktId}`)
    }, MM_API_QUERY_CONFIG)
}
