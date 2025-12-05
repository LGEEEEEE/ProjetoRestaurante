// Substitua o conteúdo do seu arquivo: app/(app)/menu.tsx
// (A única mudança é na linha 'filteredProducts')

import React, { useState, useEffect } from 'react';
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { useRestaurant } from '../../src/context/RestaurantContext'; 
import { useOrders } from '../../src/context/OrderContext'; 
import { useSocket } from '../../src/context/SocketContext'; 
import { useAuth } from '../../src/context/AuthContext'; 
import Toast from 'react-native-toast-message'; 

export default function MenuScreen() {
    const { menu, config, loading } = useRestaurant();
    const { orders } = useOrders();
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

    const socket = useSocket(); 
    const { mesaNumero } = useAuth(); 

    useEffect(() => {
        if (!loading && menu && menu.categories && menu.categories.length > 0) {
            if (!selectedCategoryId) {
                setSelectedCategoryId(menu.categories[0].id);
            }
        }
    }, [loading, menu, selectedCategoryId]);
    
    // <<<--- MUDANÇA AQUI: Adiciona "&& p.disponivel" ---<<<
    const filteredProducts = menu?.products?.filter(
        p => p.categoria_id === selectedCategoryId && p.disponivel
    ) || [];
    
    const handleCallHelp = () => {
        if (socket && mesaNumero) {
            socket.emit('chamar_ajuda', { mesaNumero: mesaNumero });
            Toast.show({ type: 'info', text1: 'Ajuda a Caminho!', text2: 'Um funcionário foi notificado.', position: 'top', visibilityTime: 3000 });
        }
    };

    if (loading || !config) {
        return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={config?.cor_primaria || '#e34040'} /></View>
    }
    
    // (O resto do return é idêntico ao seu arquivo 'menu.tsx')
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.categoriesColumn}>
                    <FlatList
                        data={menu.categories}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={{ ...styles.categoryItem, ...(item.id === selectedCategoryId && { backgroundColor: config.cor_primaria }) }}
                                onPress={() => setSelectedCategoryId(item.id)}>
                                <Text style={{ ...styles.categoryText, ...(item.id === selectedCategoryId && { color: 'white' }) }}>{item.nome}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
                <View style={styles.productsColumn}>
                    <FlatList
                        data={filteredProducts}
                        keyExtractor={(item) => item.id}
                        numColumns={2}
                        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum produto disponível nesta categoria.</Text>}
                        renderItem={({ item }) => (
                            <Link href={`/product/${item.id}`} asChild>
                                <TouchableOpacity style={styles.productItem} activeOpacity={0.8}>
                                    <Image source={{ uri: item.imagem_url }} style={styles.productImage} />
                                    <Text style={styles.productName}>{item.nome}</Text>
                                    <Text style={{ ...styles.productPrice, color: config.cor_primaria }}>R$ {item.preco.toFixed(2)}</Text>
                                </TouchableOpacity>
                            </Link>
                        )}
                    />
                </View>
            </View>
            <View style={styles.floatingButtonsContainer}>
                <TouchableOpacity style={styles.helpButton} onPress={handleCallHelp}>
                    <Text style={styles.icon}>🛎️</Text>
                </TouchableOpacity>
                {orders.length > 0 && (
                    <Link href="/orders" asChild>
                        <TouchableOpacity style={styles.statusButton}>
                            <Text style={styles.icon}>📄</Text>
                        </TouchableOpacity>
                    </Link>
                )}
            </View>
        </SafeAreaView>
    );
}
// (Styles continuam os mesmos do seu arquivo 'menu.tsx')
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: 'white' }, 
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' }, 
    container: { flex: 1, flexDirection: 'row' }, 
    categoriesColumn: { flex: 2, backgroundColor: '#f4f4f4' }, 
    categoryItem: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#ddd' }, 
    categoryText: { fontSize: 18, fontWeight: 'bold', color: '#333' }, 
    productsColumn: { flex: 5, padding: 10 }, 
    productItem: { flex: 1, margin: 10, backgroundColor: '#fff', borderRadius: 15, padding: 15, alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 }, 
    productImage: { width: '100%', height: 130, borderRadius: 10, marginBottom: 10, resizeMode: 'contain' }, 
    productName: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 }, 
    productPrice: { fontSize: 18, fontWeight: 'bold' }, 
    floatingButtonsContainer: { position: 'absolute', bottom: 30, right: 30, alignItems: 'flex-end', gap: 15 }, 
    statusButton: { width: 65, height: 65, borderRadius: 35, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 5, borderWidth: 3, borderColor: '#eee' }, 
    helpButton: { width: 65, height: 65, borderRadius: 35, backgroundColor: '#ffc107', justifyContent: 'center', alignItems: 'center', elevation: 5 }, 
    icon: { fontSize: 32 }, 
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 18, color: '#888' },
});