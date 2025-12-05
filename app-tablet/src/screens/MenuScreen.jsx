// src/screens/MenuScreen.jsx

import { useMemo, useState } from 'react';
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';

// --- DADOS DE SIMULAÇÃO (MOCK DATA) ---
// Estes dados virão da API no futuro.
const restaurantConfig = {
    primaryColor: '#e34040',
    secondaryColor: '#f9f9f9',
};

const menuData = {
    categories: [
        { id: 'cat1', name: 'Entradas' },
        { id: 'cat2', name: 'Pratos Principais' },
        { id: 'cat3', name: 'Bebidas' },
        { id: 'cat4', name: 'Sobremesas' },
    ],
    products: [
        { id: 'prod1', categoryId: 'cat1', name: 'Bruschetta', price: 22.00, description: 'Pão italiano, tomate fresco, alho e manjericão.', imageUrl: 'https://images.unsplash.com/photo-1572441713132-c542fc4fe282?w=500&q=80' },
        { id: 'prod2', categoryId: 'cat1', name: 'Salada Caprese', price: 28.00, description: 'Mussarela de búfala, tomate e manjericão.', imageUrl: 'https://images.unsplash.com/photo-1577805947690-e7f3679a35f3?w=500&q=80' },
        { id: 'prod3', categoryId: 'cat2', name: 'Spaghetti Carbonara', price: 45.00, description: 'Massa italiana com pancetta, ovos e queijo pecorino.', imageUrl: 'https://images.unsplash.com/photo-1608798372365-223d45389044?w=500&q=80' },
        { id: 'prod4', categoryId: 'cat2', name: 'Risoto de Cogumelos', price: 52.00, description: 'Arroz arbóreo cremoso com mix de cogumelos.', imageUrl: 'https://images.unsplash.com/photo-1595908129323-b15a2a275f3a?w=500&q=80' },
        { id: 'prod5', categoryId: 'cat2', name: 'Filet Mignon au Poivre', price: 68.00, description: 'Medalhão de filé ao molho de pimenta verde.', imageUrl: 'https://images.unsplash.com/photo-1629241511281-4521e1a384b6?w=500&q=80' },
        { id: 'prod6', categoryId: 'cat3', name: 'Água com Gás', price: 6.00, description: 'Garrafa 300ml.', imageUrl: 'https://images.unsplash.com/photo-1607872057279-640a1b6d163a?w=500&q=80' },
        { id: 'prod7', categoryId: 'cat3', name: 'Suco de Laranja', price: 10.00, description: 'Natural, 400ml.', imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&q=80' },
        { id: 'prod8', categoryId: 'cat4', name: 'Tiramisù', price: 25.00, description: 'Clássica sobremesa italiana com café e mascarpone.', imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&q=80' },
    ],
};
// --- FIM DOS DADOS DE SIMULAÇÃO ---


function MenuScreen() {
    const [selectedCategoryId, setSelectedCategoryId] = useState(menuData.categories[0].id);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProducts = useMemo(() => {
        const term = searchQuery.trim().toLowerCase();
        return menuData.products.filter(p => {
            const belongsToCategory = p.categoryId === selectedCategoryId;
            if (!term) return belongsToCategory;
            const haystack = `${p.name} ${p.description}`.toLowerCase();
            return belongsToCategory && haystack.includes(term);
        });
    }, [selectedCategoryId, searchQuery]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Coluna da Esquerda: Categorias */}
                <View style={styles.categoriesColumn}>
                    <FlatList
                        data={menuData.categories}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.categoryItem,
                                    item.id === selectedCategoryId && { backgroundColor: restaurantConfig.primaryColor }
                                ]}
                                onPress={() => setSelectedCategoryId(item.id)}
                            >
                                <Text style={[
                                    styles.categoryText,
                                    item.id === selectedCategoryId && { color: 'white' }
                                ]}>{item.name}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>

                {/* Coluna da Direita: Produtos */}
                <View style={styles.productsColumn}>
                    <FlatList
                        data={filteredProducts}
                        keyExtractor={(item) => item.id}
                        numColumns={2}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.productItem}>
                                <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
                                <Text style={styles.productName}>{item.name}</Text>
                                <Text style={styles.productPrice}>R$ {item.price.toFixed(2)}</Text>
                            </TouchableOpacity>
                        )}
                        ListHeaderComponent={
                            <View style={styles.searchContainer}>
                                <TextInput
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    placeholder="Buscar por nome ou descrição..."
                                    placeholderTextColor="#9CA3AF"
                                    style={styles.searchInput}
                                />
                                {searchQuery.length > 0 && (
                                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                                        <Text style={styles.clearText}>Limpar busca</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyTitle}>Nenhum item encontrado</Text>
                                <Text style={styles.emptySubtitle}>Tente outra categoria ou refine o texto da busca.</Text>
                            </View>
                        }
                        contentContainerStyle={styles.productsContent}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'white',
    },
    container: {
        flex: 1,
        flexDirection: 'row', // A mágica acontece aqui: define o layout em colunas
    },
    // Coluna da Esquerda
    categoriesColumn: {
        flex: 1, // Ocupa 1/4 do espaço (1 de 1+3)
        backgroundColor: '#f4f4f4',
    },
    categoryItem: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    categoryText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    // Coluna da Direita
    productsColumn: {
        flex: 3, // Ocupa 3/4 do espaço (3 de 1+3)
        padding: 10,
    },
    productsContent: {
        paddingBottom: 30,
    },
    productItem: {
        flex: 1,
        margin: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    productImage: {
        width: '100%',
        height: 120,
        borderRadius: 8,
        marginBottom: 10,
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    productPrice: {
        fontSize: 16,
        color: '#e34040',
        marginTop: 5,
    },
    searchContainer: {
        width: '100%',
        marginBottom: 10,
    },
    searchInput: {
        width: '100%',
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#111827',
        marginBottom: 6,
    },
    clearText: {
        color: '#e34040',
        fontWeight: '600',
        textAlign: 'right',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2933',
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 6,
        textAlign: 'center',
    },
});

export default MenuScreen;