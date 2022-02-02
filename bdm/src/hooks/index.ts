import { useMutation, useQuery, useQueryClient } from 'react-query'
import { sortBy } from 'lodash'

import { MM_API_QUERY_CONFIG } from '../constants'
import { Branche, IApiError, IMarktConfiguratie, INaam, MMarkt } from '../models'
import * as mmApi from '../services/mmApi'

export const useGenericBranches = () => {
  return useQuery<Branche[], IApiError>(
    'genericBranches',
    () => {
      return mmApi.get(`/branche/all`)
    },
    MM_API_QUERY_CONFIG
  )
}

export const useMarktConfig = (marktId: string) => {
  return useQuery<IMarktConfiguratie, IApiError>(
    'marktconfig',
    () => {
      return mmApi.get(`/markt/${marktId}/marktconfiguratie/latest`)
    },
    MM_API_QUERY_CONFIG
  )
}

export const useSaveMarktConfig = (marktId: string) => {
  const queryClient = useQueryClient()
  return useMutation<IMarktConfiguratie, IApiError, IMarktConfiguratie>(
    (marktConfiguratie) => {
      return mmApi.post(`/markt/${marktId}/marktconfiguratie/`, marktConfiguratie)
    },
    {
      ...MM_API_QUERY_CONFIG,
      onSuccess: () => queryClient.invalidateQueries('marktconfig'),
    }
  )
}

export const useObstakel = () => {
  return useQuery<INaam[], IApiError>(
    'obstakel',
    async () => {
      const obstakel = await mmApi.get(`/obstakel/all`)
      return sortBy(obstakel, 'naam')
    },
    MM_API_QUERY_CONFIG
  )
}

export const usePlaatseigenschap = () => {
  return useQuery<INaam[], IApiError>(
    'plaatseigenschap',
    async () => {
      const plaatseigenschap = await mmApi.get(`/plaatseigenschap/all`)
      return sortBy(plaatseigenschap, 'naam')
    },
    MM_API_QUERY_CONFIG
  )
}

export const useMarkt = (marktId: string) => {
  return useQuery<MMarkt, IApiError>(
    'markt',
    () => {
      return mmApi.get(`/markt/${marktId}`)
    },
    MM_API_QUERY_CONFIG
  )
}
