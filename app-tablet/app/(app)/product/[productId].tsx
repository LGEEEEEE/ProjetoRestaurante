// Substitua o conteúdo COMPLETO do arquivo: app-tablet/app/(app)/product/[productId].tsx

import React, { useState, useMemo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView, Modal, TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useRestaurant } from '../../../src/context/RestaurantContext'; 
import { useOrders, CartItem } from '../../../src/context/OrderContext'; // <<< Importei CartItem
import Toast from 'react-native-toast-message';
import { Feather } from '@expo/vector-icons'; 

// --- Tipo Novo para Opções com Preço ---
interface ParsedOption {
    name: string;      // Ex: "Extra Bacon"
    price: number;     // Ex: 5.00
    label: string;     // Ex: "Extra Bacon (+R$ 5,00)"
}

export default function ProductDetailScreen() {
    const { productId } = useLocalSearchParams();
    const router = useRouter();
    const { addOrder } = useOrders(); 
    const { menu, config } = useRestaurant(); 
    
    const [quantity, setQuantity] = useState(1); 
    const [isOrdering, setIsOrdering] = useState(false);
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState<ParsedOption[]>([]);
    const [freeObservation, setFreeObservation] = useState(''); 

    const product = menu.products.find(p => p.id.toString() === productId);
    const primaryColor = config?.cor_primaria || '#e34040';

    const optionsArray: ParsedOption[] = useMemo(() => {
        if (!product || !product.opcoes_predefinidas) return [];
        
        return product.opcoes_predefinidas.split(',').map(opt => {
            opt = opt.trim();
            const match = opt.match(/^(.*)\[\+(\d+\.?\d*)\]$/); 
            
            if (match) {
                const name = match[1].trim();
                const price = parseFloat(match[2]);
                return { name, price, label: `${name} (+R$ ${price.toFixed(2)})` };
            } else {
                return { name: opt, price: 0, label: opt };
            }
        });
    }, [product?.opcoes_predefinidas]);

    const hasPredefinedOptions = optionsArray.length > 0;
    const isMultiSelect = product?.tipo_modificador === 'multi';
    const showFreeObservation = product?.permite_observacoes && !hasPredefinedOptions;
    
    const optionsPrice = useMemo(() => {
        return selectedOptions.reduce((sum, opt) => sum + opt.price, 0);
    }, [selectedOptions]);
    
    const totalPrice = product ? (product.preco + optionsPrice) * quantity : 0;

    if (!product) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <Text style={styles.errorText}>Produto não encontrado!</Text>
            </SafeAreaView>
        );
    }

    const selectOption = (option: ParsedOption) => {
        if (isMultiSelect) {
            setSelectedOptions(current => 
                current.some(o => o.name === option.name) 
                    ? current.filter(o => o.name !== option.name) 
                    : [...current, option]
            );
        } else {
            setSelectedOptions(current => (current.some(o => o.name === option.name) ? [] : [option]));
        }
    };
    
    const changeQuantity = (delta: number) => {
        const newQty = quantity + delta;
        if (newQty >= 1) setQuantity(newQty);
    };
    
    const handleConfirmOrder = () => setModalVisible(true);

    const processOrder = async () => {
        
        // <<<--- CORREÇÃO APLICADA AQUI ---<<<
        // Esta verificação garante para o TypeScript que 'product' não é undefined
        if (!product) {
            Toast.show({ type: 'error', text1: 'Erro: Produto não encontrado.' });
            setIsOrdering(false);
            setModalVisible(false);
            return;
        }
        // --- FIM DA CORREÇÃO ---

        setModalVisible(false);
        setIsOrdering(true);
        try {
            const optionsText = selectedOptions.map(o => o.name).join(', ');
            const finalNotes = [optionsText, freeObservation.trim()].filter(Boolean).join(' - ');
            const finalItemPrice = product.preco + optionsPrice;

            // Agora 'product' aqui é 100% seguro de usar
            const singleItemCart: CartItem[] = [{ // Especifica o tipo para garantir
                product: { ...product, preco: finalItemPrice }, // Erro desaparece
                quantity: quantity,
                notes: finalNotes
            }];
            
            await addOrder(singleItemCart);
            Toast.show({ type: 'success', text1: 'Pedido Enviado!', position: 'top', visibilityTime: 2000 });
            router.back(); 

        } catch (error) {
            console.error("Erro ao processar pedido:", error); // Adiciona um log
            Toast.show({ type: 'error', text1: 'Erro ao pedir', position: 'top' });
        } finally {
            setIsOrdering(false);
        }
    }

    const finalObservation = [selectedOptions.map(o => o.name).join(', '), freeObservation.trim()].filter(Boolean).join(' - ');

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ title: product.nome }} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <Image source={{ uri: product.imagem_url }} style={styles.image} resizeMode="contain"  />
                    <View style={styles.detailsContainer}>
                        <Text style={styles.productName}>{product.nome}</Text>
                        <Text style={styles.productDescription}>{product.descricao}</Text>
                        
                        <View style={styles.priceRow}>
                            <Text style={{...styles.productPrice, color: primaryColor}}>
                                R$ {product.preco.toFixed(2)} 
                                <Text style={styles.unitText}> / un {optionsPrice > 0 && `(+ adicionais)`}</Text>
                            </Text>
                            <View style={styles.quantitySelector}>
                                <TouchableOpacity onPress={() => changeQuantity(-1)} style={styles.qtyButton}>
                                    <Feather name="minus" size={24} color={primaryColor} />
                                </TouchableOpacity>
                                <Text style={styles.qtyText}>{quantity}</Text>
                                <TouchableOpacity onPress={() => changeQuantity(1)} style={styles.qtyButton}>
                                    <Feather name="plus" size={24} color={primaryColor} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {hasPredefinedOptions && (
                            <View style={styles.obsContainer}>
                                <Text style={styles.obsLabel}>{isMultiSelect ? 'Selecione os adicionais:' : 'Selecione uma opção:'}</Text>
                                <View style={styles.optionsWrap}>
                                    {optionsArray.map((option) => {
                                        const isSelected = selectedOptions.some(o => o.name === option.name);
                                        return (
                                            <TouchableOpacity key={option.name} 
                                                style={[ styles.optionButton, isSelected && { backgroundColor: primaryColor, borderColor: primaryColor }]}
                                                onPress={() => selectOption(option)}
                                            >
                                                <Text style={[styles.optionText, isSelected && { color: 'white' }]}>{option.label}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        )}

                        {showFreeObservation && (
                            <View style={styles.obsContainer}>
                                <Text style={styles.obsLabel}>Alguma observação?</Text>
                                <TextInput style={styles.obsInput} placeholder="Ex: Sem cebola..." value={freeObservation} onChangeText={setFreeObservation} multiline />
                            </View>
                        )}

                        <TouchableOpacity 
                            style={[
                                styles.orderButton, 
                                // Muda a cor se estiver indisponível
                                (isOrdering || !product.disponivel) ? styles.disabledButton : { backgroundColor: primaryColor }
                            ]} 
                            // Desabilita o clique se estiver indisponível
                            onPress={handleConfirmOrder} 
                            disabled={isOrdering || !product.disponivel} 
                            activeOpacity={0.8}
                        >
                            {isOrdering ? <ActivityIndicator color="#fff" /> : 
                                // Muda o texto se estiver indisponível
                                !product.disponivel ? (
                                    <Text style={styles.orderButtonText}>PRODUTO ESGOTADO</Text>
                                ) : (
                                    <Text style={styles.orderButtonText}>
                                        PEDIR {quantity}X • R$ {totalPrice.toFixed(2)}
                                    </Text>
                                )
                            }
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
            
            <Modal animationType="fade" transparent={true} visible={isModalVisible} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Confirmar Pedido</Text>
                        <Text style={styles.modalMessage}>{quantity}x {product.nome}</Text>
                        {finalObservation ? <Text style={styles.modalObs}>" {finalObservation} "</Text> : null}
                        <Text style={{...styles.modalPrice, color: primaryColor}}>Total: R$ {totalPrice.toFixed(2)}</Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setModalVisible(false)}><Text style={styles.modalBtnCancelText}>Cancelar</Text></TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: primaryColor }]} onPress={processOrder}><Text style={styles.modalBtnConfirmText}>CONFIRMAR</Text></TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    scrollContainer: { flexGrow: 1 }, 
    image: { width: '100%', height: 250, backgroundColor: '#f9f9f9', borderRadius: 50},
    detailsContainer: { padding: 20, flex: 1, justifyContent: 'space-between' },
    productName: { fontSize: 26, fontWeight: 'bold', marginBottom: 10, color: '#1a1a1a' },
    productDescription: { fontSize: 16, color: '#666', lineHeight: 22, marginBottom: 20 },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    productPrice: { fontSize: 28, fontWeight: 'bold' },
    unitText: { fontSize: 16, color: '#999', fontWeight: 'normal' },
    quantitySelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 30, paddingHorizontal: 10, paddingVertical: 5 },
    qtyButton: { padding: 10 },
    qtyText: { fontSize: 20, fontWeight: 'bold', marginHorizontal: 15, minWidth: 30, textAlign: 'center' },
    obsContainer: { marginBottom: 25 },
    obsLabel: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
    obsInput: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 15, fontSize: 16, color: '#333', minHeight: 80, textAlignVertical: 'top', borderWidth: 1, borderColor: '#eee' },
    optionsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, },
    optionButton: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 20, backgroundColor: '#f0f0f0', borderWidth: 2, borderColor: '#f0f0f0' },
    optionText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    orderButton: { paddingVertical: 18, borderRadius: 15, alignItems: 'center', elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, marginBottom: 20 },
    orderButtonText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    errorText: { fontSize: 18, textAlign: 'center', marginTop: 20 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: 'white', padding: 30, borderRadius: 20, width: '85%', maxWidth: 400, alignItems: 'center', elevation: 10 },
    modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#1a202c' },
    modalMessage: { fontSize: 18, color: '#4a5568', textAlign: 'center', marginBottom: 5 },
    modalObs: { fontSize: 16, color: '#718096', fontStyle: 'italic', textAlign: 'center', marginBottom: 15, backgroundColor: '#f7fafc', padding: 10, borderRadius: 8, width: '100%' },
    modalPrice: { fontSize: 22, fontWeight: 'bold', marginBottom: 30 },
    modalButtons: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', gap: 15 },
    modalBtn: { flex: 1, paddingVertical: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    modalBtnCancel: { backgroundColor: '#e2e8f0' },
    modalBtnCancelText: { color: '#4a5568', fontWeight: 'bold', fontSize: 16 },
    modalBtnConfirmText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    // Adicionando o estilo que faltava
    disabledButton: {
        backgroundColor: '#a0aec0', // Um cinza para desabilitado
    },
});