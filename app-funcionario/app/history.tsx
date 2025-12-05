import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView, RefreshControl } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { apiClient } from '../src/api/apiClient';

const StatusBadge = ({ status }: { status: string }) => {
    const palette = useMemo(() => ({
        finalizado: { bg: '#38a169', text: '#f0fff4', icon: 'check-circle' as const, label: 'Entregue' },
        estornado: { bg: '#dd6b20', text: '#fffaf0', icon: 'rotate-ccw' as const, label: 'Estornado' },
    }), []);

    const current = palette[status as keyof typeof palette] || palette.finalizado;

    return (
        <View style={[styles.statusBadge, { backgroundColor: current.bg }]}>
            <Feather name={current.icon} size={16} color={current.text} />
            <Text style={[styles.statusText, { color: current.text }]}>{current.label}</Text>
        </View>
    );
};

export default function HistoryScreen() {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/'); 
        }
    };

    const fetchHistory = useCallback(async (withSpinner = false) => {
        if (withSpinner) setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get('/pedidos/historico-hoje');
            setOrders(response.data);
        } catch (err) {
            console.error('Erro ao buscar histórico:', err);
            const message = err instanceof Error ? err.message : 'Falha ao carregar histórico.';
            setError(message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchHistory(true);
        }, [fetchHistory])
    );

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.orderId}>Pedido #{item.id}</Text>
                <Text style={styles.orderTime}>
                    {new Date(item.time || item.data_hora_pedido).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
            <View style={styles.cardBody}>
                <Text style={styles.cardText}>Mesa <Text style={styles.bold}>{item.table ?? item.mesa_id}</Text></Text>
                {item.valor_total && (
                    <Text style={styles.cardText}>Total <Text style={styles.bold}>R$ {parseFloat(item.valor_total).toFixed(2)}</Text></Text>
                )}
            </View>
            <StatusBadge status={item.status} />
        </View>
    );

    const handleManualRefresh = () => {
        setRefreshing(true);
        fetchHistory();
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Feather name="arrow-left" size={28} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Histórico de Hoje</Text>
                <TouchableOpacity onPress={handleManualRefresh} style={styles.refreshButton}>
                    <Feather name="refresh-cw" size={22} color="#333" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#4299e1" />
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleManualRefresh}
                            tintColor="#4299e1"
                            colors={['#4299e1']}
                        />
                    }
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', marginTop: 60 }}>
                            <Feather name="coffee" size={48} color="#CBD5F5" />
                            <Text style={styles.emptyText}>
                                {error ? error : 'Nenhum pedido entregue hoje ainda.'}
                            </Text>
                            {error && (
                                <TouchableOpacity onPress={() => fetchHistory(true)} style={{ marginTop: 8 }}>
                                    <Text style={{ color: '#3182ce', fontWeight: '600' }}>Tentar novamente</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f4f7f9' },
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: 20, 
        backgroundColor: 'white', 
        borderBottomWidth: 1, 
        borderBottomColor: '#ddd' 
    },
    backButton: { padding: 5 },
    refreshButton: { padding: 5 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    listContainer: { padding: 15 },
    card: { 
        backgroundColor: 'white', 
        borderRadius: 12, 
        padding: 18, 
        marginBottom: 15, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.08, 
        shadowRadius: 6, 
        elevation: 3 
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    orderId: { fontSize: 16, fontWeight: 'bold', color: '#2d3748' },
    orderTime: { fontSize: 14, color: '#718096' },
    cardBody: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    cardText: { fontSize: 16, color: '#333' },
    bold: { fontWeight: 'bold' },
    statusBadge: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: 8, 
        borderRadius: 8,
        gap: 8
    },
    statusText: { fontWeight: 'bold' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#888' },
});