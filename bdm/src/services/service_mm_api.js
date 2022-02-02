const mmApiBaseUrl = `${process.env.REACT_APP_KJK_API_ORIGIN}/api/mm`;
export const mmApiService = url => fetch(`${mmApiBaseUrl}${url}`).then(r => r.json());
