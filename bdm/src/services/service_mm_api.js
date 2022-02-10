const MM_API_BASE_URL = process.env.REACT_APP_KJK_API_ORIGIN || ''

export const mmApiService = async (url) => {
    const response = await fetch(`${MM_API_BASE_URL}${url}`)
    if (!response.ok) {
        console.log(response)
        const customError = new Error(response.statusText)
        customError.status = response.status
        throw customError;
    }
    return response.json()
}

export const mmApiSaveService = async (url, data) => {
    const response = await fetch(`${MM_API_BASE_URL}${url}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    if (!response.ok) {
        console.log(response)
        const customError = new Error(response.statusText)
        customError.status = response.status
        throw customError;
    }
    return response.json()
};
