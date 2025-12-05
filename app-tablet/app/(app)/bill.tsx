// Substitua o conteúdo COMPLETO do arquivo: app-tablet/app/(app)/bill.tsx

import React, { useMemo } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// Importa o tipo CartItem para tipagem correta
import { useOrders, CartItem } from '../../src/context/OrderContext'; 
import { useRestaurant } from '../../src/context/RestaurantContext'; 
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function BillScreen() {
    const { orders } = useOrders();
    const { config } = useRestaurant();
    const router = useRouter(); 
    const primaryColor = config?.cor_primaria || '#e34040';

    // Pega a taxa configurada ou usa 10% como padrão
    const serviceRate = config?.taxa_servico ? Number(config.taxa_servico) : 10;

    const { allItems, subtotal, serviceCharge, total } = useMemo(() => {
        const validOrders = orders.filter(o => o.status !== 'cancelado' && o.status !== 'estornado');
        // A mágica: flatMap agora garante que os itens sejam tratados como CartItem
        const allItems: CartItem[] = validOrders.flatMap(order => order.items);
        
        const subtotal = allItems.reduce((sum, item) => sum + item.product.preco * item.quantity, 0);
        const serviceCharge = subtotal * (serviceRate / 100);
        const total = subtotal + serviceCharge;
        
        return { allItems, subtotal, serviceCharge, total };
    }, [orders, serviceRate]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color={primaryColor} />
                    <Text style={[styles.backText, { color: primaryColor }]}>Voltar ao Cardápio</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.container}>
                <Text style={styles.title}>Sua Conta</Text>
                
                <FlatList
                    data={allItems}
                    // A chave agora precisa ser mais única, incluindo a nota
                    keyExtractor={(item, index) => `${item.product.id}-${item.notes || ''}-${index}`}
                    ListHeaderComponent={
                        <View style={styles.listHeader}>
                            <Text style={styles.headerText}>Qtd.</Text>
                            <Text style={[styles.headerText, {flex: 1, textAlign: 'left', paddingLeft: 10}]}>Item</Text>
                            <Text style={styles.headerText}>Preço</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.itemContainer}>
                            <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                            
                            {/* Container para o nome e a nota */}
                            <View style={styles.itemNameWrapper}>
                                <Text style={styles.itemName}>{item.product.nome}</Text>
                                {/* <<< MOSTRA A NOTA AQUI ---<<< */}
                                {item.notes && (
                                    <Text style={styles.itemNote}>{item.notes}</Text>
                                )}
                            </View>
                            
                            <Text style={styles.itemPrice}>R$ {(item.product.preco * item.quantity).toFixed(2)}</Text>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={styles.emptyText}>Nenhum item para pagar.</Text>}
                    style={{flex: 1}}
                />

                <View style={styles.footer}>
                    {config?.chave_pix ? (
                        <View style={styles.pixContainer}>
                            <Feather name="smartphone" size={20} color={primaryColor} style={{marginRight: 8}} />
                            <Text style={styles.pixLabel}>Pagar com PIX:</Text>
                            <Text style={styles.pixKey} selectable>{config.chave_pix}</Text>
                        </View>
                    ) : null}

                    <View style={styles.summaryContainer}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>R$ {subtotal.toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Serviço ({serviceRate}%)</Text>
                            <Text style={styles.summaryValue}>R$ {serviceCharge.toFixed(2)}</Text>
                        </View>
                        <View style={[styles.summaryRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>TOTAL</Text>
                            <Text style={[styles.totalValue, { color: primaryColor }]}>R$ {total.toFixed(2)}</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={[styles.payButton, { backgroundColor: primaryColor }]}>
                        <Text style={styles.payButtonText}>CHAMAR GARÇOM</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
    header: { padding: 15, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee' },
    backButton: { flexDirection: 'row', alignItems: 'center' },
    backText: { fontSize: 16, fontWeight: 'bold', marginLeft: 5 },
    
    container: { flex: 1, paddingHorizontal: 20 },
    title: { fontSize: 28, fontWeight: '800', color: '#2d3748', marginVertical: 20, textAlign: 'center' },
    
    listHeader: { flexDirection: 'row', paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: '#e2e8f0', marginBottom: 10 },
    headerText: { fontWeight: 'bold', color: '#718096', fontSize: 16 },
    
    itemContainer: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#edf2f7' },
    itemQuantity: { fontWeight: 'bold', width: '15%', fontSize: 16, color: '#2d3748' },
    itemNameWrapper: { flex: 1, paddingHorizontal: 10 },
    itemName: { fontSize: 16, color: '#4a5568', fontWeight: 'bold' },
    itemNote: { 
        fontSize: 14,
        color: '#718096',
        fontStyle: 'italic',
        marginTop: 3
    },
    itemPrice: { fontWeight: 'bold', fontSize: 16, color: '#2d3748', textAlign: 'right', width: '25%' },
    
    emptyText: { textAlign: 'center', marginTop: 40, color: '#a0aec0', fontSize: 18 },
    
    footer: { paddingVertical: 20, backgroundColor: '#f8f9fa' },
    pixContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#edf2f7', padding: 12, borderRadius: 10, marginBottom: 15, justifyContent: 'center' },
    pixLabel: { fontWeight: 'bold', color: '#4a5568', marginRight: 5 },
    pixKey: { fontSize: 16, color: '#2d3748', fontWeight: 'bold' },
    summaryContainer: { backgroundColor: 'white', padding: 20, borderRadius: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, marginBottom: 15 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    summaryLabel: { fontSize: 16, color: '#718096' },
    summaryValue: { fontSize: 16, fontWeight: 'bold', color: '#2d3748' },
    totalRow: { marginTop: 10, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
    totalLabel: { fontSize: 20, fontWeight: '800', color: '#2d3748' },
    totalValue: { fontSize: 24, fontWeight: '800' },
    payButton: { paddingVertical: 18, borderRadius: 15, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5, elevation: 5, marginBottom: 10 },
    payButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
});