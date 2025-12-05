// Substitua o conteúdo do seu arquivo: app/(app)/orders.tsx

import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, SafeAreaView } from 'react-native';
import { Order, OrderStatus, useOrders } from '../../src/context/OrderContext'; 
import { useRestaurant } from '../../src/context/RestaurantContext'; 
import { Link } from 'expo-router';

// Função para formatar o status para o cliente
const formatStatus = (status: OrderStatus) => {
    switch (status) {
        case 'recebido':
            return 'Pedido Recebido';
        case 'em_preparo':
            return 'Em Preparo...';
        case 'pronto':
            return 'Pronto (Aguardando entrega)'; 
        case 'finalizado':
            return 'Entregue';
        default:
            return status;
    }
};

const OrderCard = ({ order }: { order: Order }) => {
    let statusColor = '#6c757d'; 
    if (order.status === 'em_preparo') statusColor = '#007bff'; 
    if (order.status === 'pronto') statusColor = '#28a745'; 
    if (order.status === 'finalizado') statusColor = '#6c757d'; 

    return (
        <View style={styles.orderCard}>
            <View style={styles.cardHeader}>
                <Text style={styles.orderId}>Pedido #{order.id.slice(-5)}</Text>
                <Text style={[styles.statusText, { color: statusColor }]}>
                    Status: {formatStatus(order.status)}
                </Text>
            </View>

            {order.items.map(item => (
                <View key={item.product.id} style={styles.itemContainer}>
                    <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                    {/* <<< CORREÇÃO AQUI (usando 'item.product.nome') >>> */}
                    <Text style={styles.itemName}>{item.product.nome}</Text>
                    {/* <<< CORREÇÃO AQUI (usando 'item.product.preco') >>> */}
                    <Text style={styles.itemPrice}>R$ {(item.product.preco * item.quantity).toFixed(2)}</Text>
                </View>
            ))}
        </View>
    );
};


export default function OrdersScreen() {
    const { orders } = useOrders(); 
    const { config } = useRestaurant();
    const primaryColor = config?.cor_primaria || '#e34040';

    const finalizedOrders = orders.filter(o => o.status === 'finalizado');
    const activeOrders = orders.filter(o => o.status !== 'finalizado');

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                {orders.length === 0 ? (<Text style={styles.emptyText}>Você ainda não fez nenhum pedido.</Text>) : (
                    <>
                        <View style={styles.statusSection}>
                            <Text style={styles.sectionTitle}>Pedidos Ativos</Text>
                            {activeOrders.length > 0 
                                ? activeOrders.map(order => <OrderCard key={order.id} order={order} />) 
                                : <Text style={styles.noOrdersText}>Nenhum pedido ativo.</Text>}
                        </View>
                        <View style={styles.statusSection}>
                            <Text style={styles.sectionTitle}>Pedidos Entregues</Text>
                            {finalizedOrders.length > 0 
                                ? finalizedOrders.map(order => <OrderCard key={order.id} order={order} />) 
                                : <Text style={styles.noOrdersText}>Nenhum pedido entregue ainda.</Text>}
                        </View>
                    </>
                )}
            </ScrollView>
            
            {orders.length > 0 && (
                <View style={{ ...styles.billButton, backgroundColor: primaryColor }}>
                    <Link href="/bill" asChild>
                        <TouchableOpacity>
                            <Text style={styles.billButtonText}>FECHAR CONTA</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f4f4f4' }, 
    container: { flex: 1, padding: 10, paddingBottom: 80 }, 
    statusSection: { marginBottom: 20 }, 
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, marginLeft: 5 }, 
    orderCard: { backgroundColor: 'white', borderRadius: 10, padding: 15, marginBottom: 10 }, 
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10, 
        borderBottomWidth: 1, 
        borderBottomColor: '#eee', 
        paddingBottom: 10 
    },
    orderId: { fontSize: 14, fontWeight: 'bold', color: '#888' }, 
    statusText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    itemContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 }, 
    itemQuantity: { fontWeight: 'bold', marginRight: 8 }, 
    itemName: { flex: 1 }, 
    itemPrice: { fontWeight: 'bold' }, 
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 18, color: '#888' }, 
    noOrdersText: { color: '#888', padding: 15 }, 
    billButton: { 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        padding: 25, 
        alignItems: 'center', 
    }, 
    billButtonText: { 
        color: 'white', 
        fontSize: 18, 
        fontWeight: 'bold' 
    },
});