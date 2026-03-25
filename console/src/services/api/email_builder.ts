    import { api } from './client'
    import snakecaseKeys from 'snakecase-keys'


    export interface EmailBuilderCopyResponse {
        subject: string;
        preheader: string;
        email_body: string;
    }

    export interface EmailBuilderResponse {
        type: string;
        copy: EmailBuilderCopyResponse;
        mgml: string,
        style: string,
        action: string,
        subject_line: string,
        subject_preview: string,
        company_name: string
    }

    export interface EmailBuilderTrendsResponse {
        trend: string,
        description: string
    }

    export interface EmailStyle {
        id: number;
        name: string;
    }

    export interface EmailSettingsResponse {
        styles: EmailStyle[];
    }

    export interface EmailGeneratorSettings {
       message?: string,
       trendKey?: string,
       trendDescription?: string,
       addLinkButton?: boolean,
       addLinkButtonName?: string,
       addLinkButtonLink?: string,
       addEvent?: boolean,
       addEventDateTime?: string,
       addEventLocation?: string,
       website? : string,
       style?: string,
       templateId?: string,
       files?: string[],
       isGenerateImage?: boolean
       isUploadCustomImage?: boolean
    }

    export interface TrendRequest {
        message: string
    }

    export const emailBuilderApi = { 
            generate: async (settings: EmailGeneratorSettings): Promise<EmailBuilderResponse> => {
                return await api.post('/api/mail.generate', snakecaseKeys(settings))
            },
            trends: async(request: TrendRequest): Promise<EmailBuilderTrendsResponse[]> => {
                return await api.post('/api/mail.trends', snakecaseKeys(request))
            },
            settings: async(): Promise<EmailSettingsResponse> => {
                return await api.get('/api/mail.settings')
            }
    }