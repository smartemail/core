import { api } from './client'

export interface Product {
    id:   string  
	product_id:  string 
	name:        string  
	description: string  
	credits:     number     
	price:       number 
	checkout_url: string  
}

export interface PricingResponse { products: Product[] }
export interface SubscriptionPlanResponse {
    plan: string
    credits: number
    price: number
    credits_left: number
    active_until: string
    billing_cycle: string
}

export const pricingApi = {
    get: async (coupon_code?: string): Promise<PricingResponse> => {
        return await api.post('/api/pricing.get', { coupon_code })
    },
    publicGet: async (coupon_code?: string): Promise<PricingResponse> => {
        return await api.post('/api/pricing.public.get', { coupon_code })
    },
	subscription: async (): Promise<SubscriptionPlanResponse> => {
		return await api.get('/api/pricing.subscription.get')
	}
}