import { MM_API_BASE_URL } from '../constants'
import { IApiError, IMarktConfiguratie } from '../models'

export const initialMarktConfiguratie: IMarktConfiguratie = {
  branches: [],
  locaties: [],
  marktOpstelling: { rows: [] },
  geografie: { obstakels: [] },
  paginas: [],
}

const handleResponse = (response: Response) => {
  if (!response.ok) {
    const customError: IApiError = new Error(response.statusText)
    customError.status = response.status
    throw customError
  }
  return response.json()
}

export const get = async (uri: string) => {
  const response = await fetch(`${MM_API_BASE_URL}${uri}`)
  return handleResponse(response)
}

export const post = async (uri: string, data: {}) => {
  const response = await fetch(`${MM_API_BASE_URL}${uri}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  return handleResponse(response)
}
