// Substitua o conteúdo do seu arquivo: app/(app)/cart.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useCart } from '../../src/context/CartContext'; 
import { useOrders } from '../../src/context/OrderContext'; 
import { useRestaurant } from '../../src/context/RestaurantContext'; 
import Toast from 'react-native-toast-message';

export default function CartScreen() {
    const { items, changeQuantity, totalPrice, clearCart, removeFromCart } = useCart();
    const { addOrder } = useOrders();
    const { config } = useRestaurant();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSendOrder = async () => {
        setIsSubmitting(true);
        try {
            await addOrder(items);
            
            const message = 'Pedido enviado para a cozinha!';
            
            Toast.show({
                type: 'success',
                text1: message,
                position: 'top',
                visibilityTime: 3000 
            });

            clearCart();
            router.back(); 
        } catch (error) {
            console.error(error);
            Toast.show({
                type: 'error',
                text1: 'Falha ao enviar pedido',
                text2: 'Tente novamente ou chame um funcionário.',
                position: 'top'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <FlatList
                    data={items}
                    keyExtractor={(item) => item.product.id}
                    ListEmptyComponent={<Text style={styles.emptyText}>Seu carrinho está vazio.</Text>}
                    renderItem={({ item }) => (
                        <View style={styles.itemContainer}>
                            {/* <<< CORREÇÃO AQUI (usando 'item.product.imagem_url') >>> */}
                            <Image source={{ uri: item.product.imagem_url }} style={styles.itemImage} />
                            <View style={styles.itemDetails}>
                                {/* <<< CORREÇÃO AQUI (usando 'item.product.nome') >>> */}
                                <Text style={styles.itemName}>{item.product.nome}</Text>
                                {/* <<< CORREÇÃO AQUI (usando 'item.product.preco') >>> */}
                                <Text style={styles.itemPrice}>R$ {item.product.preco.toFixed(2)}</Text>
                            </View>
                            <View style={styles.quantityContainer}>
                                <TouchableOpacity onPress={() => changeQuantity(item.product.id, -1)} style={styles.quantityButton}>
                                    <Text style={styles.quantityButtonText}>-</Text>
                                </TouchableOpacity>
                                <Text style={styles.quantityText}>{item.quantity}</Text>
                                <TouchableOpacity onPress={() => changeQuantity(item.product.id, 1)} style={styles.quantityButton}>
                                    <Text style={styles.quantityButtonText}>+</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => removeFromCart(item.product.id)} style={styles.trashButton}>
                                    <Feather name="trash-2" size={20} color={config?.cor_primaria || '#e34040'} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
                <View style={styles.summaryContainer}>
                    <Text style={styles.totalText}>Total: R$ {totalPrice.toFixed(2)}</Text>
                    <TouchableOpacity 
                        style={[
                            styles.checkoutButton, 
                            { backgroundColor: items.length === 0 || isSubmitting ? '#ccc' : config?.cor_primaria || '#e34040' }
                        ]}
                        onPress={handleSendOrder}
                        disabled={items.length === 0 || isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.checkoutButtonText}>Enviar Pedido para Cozinha</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f4f4f4' }, 
    container: { flex: 1 }, 
    itemContainer: { flexDirection: 'row', backgroundColor: 'white', padding: 15, marginVertical: 5, alignItems: 'center' }, 
    itemImage: { width: 60, height: 60, borderRadius: 8 }, 
    itemDetails: { flex: 1, marginLeft: 15 }, 
    itemName: { fontSize: 16, fontWeight: 'bold' }, 
    itemPrice: { fontSize: 14, color: '#888' }, 
    quantityContainer: { flexDirection: 'row', alignItems: 'center' }, 
    quantityButton: { backgroundColor: '#e0e0e0', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 5 }, 
    quantityButtonText: { fontSize: 18, fontWeight: 'bold' }, 
    quantityText: { fontSize: 16, marginHorizontal: 15, fontWeight: 'bold' }, 
    summaryContainer: { backgroundColor: 'white', padding: 20, borderTopWidth: 1, borderColor: '#ccc' }, 
    totalText: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 }, 
    checkoutButton: { padding: 20, borderRadius: 15, alignItems: 'center' }, 
    checkoutButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }, 
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 18, color: '#888' }, 
    trashButton: { marginLeft: 15, padding: 5, },
});