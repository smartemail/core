import { api } from './client'

export interface UserSetting {
    code: string 
    value: string
}

export const userSettingService = { 
    getUserSettings: () => api.get<Array<UserSetting>>('/api/userSettings.get'),
    updateUserSettings: (data: UserSetting[]) => api.post('/api/userSettings.update', data),
    updateUserLogo: async (formData: FormData): Promise<string[]> => {
            return await api.upload('/api/userSettings.updateLogo', formData);
    },
    updateUserBranding: async (formData: FormData): Promise<string[]> => {
            return await api.upload('/api/userSettings.updateBranding', formData);
    },
    extractWebsiteInfo: (website: string) => api.post<{[key: string]: string}>('/api/userSettings.extract', { website }),
}   