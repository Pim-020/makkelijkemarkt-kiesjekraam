const MM_API_BASE_URL = `${process.env.REACT_APP_KJK_API_ORIGIN}/api/mm`;

export const mmApiService = url => fetch(`${MM_API_BASE_URL}${url}`).then(r => r.json());

export const mmApiSaveService = (url, data) => {
    fetch(`${MM_API_BASE_URL}${url}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    }).then(response => response.json());
};
