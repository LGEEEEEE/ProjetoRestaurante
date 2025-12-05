// Cole este código no novo arquivo: menu.ts

export interface Category { id: string; name: string; }
export interface Product { id: string; categoryId: string; name: string; price: number; description: string; imageUrl: string; }

export const restaurantConfig = {
    primaryColor: '#e34040',
    secondaryColor: '#f9f9f9',
};

export const menuData: { categories: Category[]; products: Product[] } = {
    categories: [ { id: 'cat1', name: 'Entradas' }, { id: 'cat2', name: 'Pratos Principais' }, { id: 'cat3', name: 'Bebidas' }, { id: 'cat4', name: 'Sobremesas' }, ],
    products: [ { id: 'prod1', categoryId: 'cat1', name: 'Bruschetta', price: 22.00, description: 'Pão italiano, tomate fresco, alho e manjericão.', imageUrl: 'https://images.unsplash.com/photo-1572441713132-c542fc4fe282?w=500&q=80' }, { id: 'prod2', categoryId: 'cat1', name: 'Salada Caprese', price: 28.00, description: 'Mussarela de búfala, tomate e manjericão.', imageUrl: 'https://images.unsplash.com/photo-1577805947690-e7f3679a35f3?w=500&q=80' }, { id: 'prod3', categoryId: 'cat2', name: 'Spaghetti Carbonara', price: 45.00, description: 'Massa italiana com pancetta, ovos e queijo pecorino.', imageUrl: 'https://images.unsplash.com/photo-1608798372365-223d45389044?w=500&q=80' }, { id: 'prod4', categoryId: 'cat2', name: 'Risoto de Cogumelos', price: 52.00, description: 'Arroz arbóreo cremoso com mix de cogumelos.', imageUrl: 'https://images.unsplash.com/photo-1595908129323-b15a2a275f3a?w=500&q=80' }, { id: 'prod5', categoryId: 'cat2', name: 'Filet Mignon au Poivre', price: 68.00, description: 'Medalhão de filé ao molho de pimenta verde.', imageUrl: 'https://images.unsplash.com/photo-1629241511281-4521e1a384b6?w=500&q=80' }, { id: 'prod6', categoryId: 'cat3', name: 'Água com Gás', price: 6.00, description: 'Garrafa 300ml.', imageUrl: 'https://images.unsplash.com/photo-1607872057279-640a1b6d163a?w=500&q=80' }, { id: 'prod7', categoryId: 'cat3', name: 'Suco de Laranja', price: 10.00, description: 'Natural, 400ml.', imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&q=80' }, { id: 'prod8', categoryId: 'cat4', name: 'Tiramisù', price: 25.00, description: 'Clássica sobremesa italiana com café e mascarpone.', imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&q=80' }, ],
};