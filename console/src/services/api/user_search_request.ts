import { api } from './client'

export interface UserSearchRequest {
    location: string,
    query: string,
    contacts_number: number,
    is_business_email: boolean,
    is_personal_email: boolean,
    lat: number,
    lng: number,
    radius: number,
}

export interface UserSearchRequestResponse {
    id: string,
    location: string,
    query: string,
    status: string,
    contacts_number: number,
    is_business_email: boolean,
    is_personal_email: boolean,
    lat: number,
    lng: number,
    radius: number,
    created_at: string,
}

export const userSearchRequestService = { 
    createUserSearchRequest: (data: UserSearchRequest) => api.post('/api/search.create', data),
    getUserSearchRequests: () => api.get<Array<UserSearchRequestResponse>>('/api/search.list'),
    deleteUserSearchRequest: (requestId: string) => api.post('/api/search.delete', { requestId }),
    getUserSearchRequestById: (requestId: string) => api.get<UserSearchRequestResponse>(`/api/search.get?requestId=${requestId}`),
}