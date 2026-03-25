package domain

type Product struct {
	ID          string  `json:"id"`
	ProductID   string  `json:"product_id"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Credits     int     `json:"credits"`
	Price       float64 `json:"price"`
	CheckoutURL string  `json:"checkout_url"`
}
