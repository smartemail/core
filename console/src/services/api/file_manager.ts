    import { api } from './client'

   export interface ListFileResponse {
        id: string;
        name: string;
        size: number;
        url: string;
    }
    
    export const fileManagerApi = { 
        listFiles: async (prefix?: string): Promise<ListFileResponse[]> => {
            const params = prefix ? `?prefix=${encodeURIComponent(prefix)}` : ''
            return await api.get('/api/file_manager.list_files' + params)
        },
        uploadFiles: async (formData: FormData): Promise<string[]> => {
            return await api.upload('/api/file_manager.upload_files', formData);
        },
        deleteFile: async (files: string[]): Promise<string[]> => {
            return await api.post('/api/file_manager.delete_file', files)
        }
    }