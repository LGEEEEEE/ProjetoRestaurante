// Substitua o conteúdo COMPLETO do arquivo: app-funcionario/app/index.tsx

import React, { useState, useEffect, useRef, useCallback } from 'react'; // useRef foi importado
import { 
    SafeAreaView, View, Text, StyleSheet, FlatList, TouchableOpacity, 
    ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform, 
    Vibration, Alert, RefreshControl
} from 'react-native'; 
import { Feather } from '@expo/vector-icons';
import { useSocket } from '../src/context/SocketContext';
import { useAuth } from '../src/context/AuthContext';
import { apiClient } from '../src/api/apiClient';
import Toast from 'react-native-toast-message';
import LoginScreen from '../src/screens/LoginScreen';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import { AxiosError } from 'axios';

// --- (Componentes Task, Item, TaskCard permanecem 100% iguais) ---
interface Item { qty: number; name: string; notes?: string; }
interface Task { id: string; type: 'entrega' | 'ajuda'; table: number | string; createdAt: Date; items?: Item[]; }
interface TaskCardProps { task: Task; onComplete: (task: Task) => void; onCancel: (task: Task) => void; }
const TaskCard: React.FC<TaskCardProps> = ({ task, onComplete, onCancel }) => {
    // ... (código interno do card 100% igual)
    const [elapsedTime, setElapsedTime] = useState('');
    useEffect(() => {
        const update = () => {
            const s = Math.floor((new Date().getTime() - new Date(task.createdAt).getTime()) / 1000);
            setElapsedTime(Math.floor(s / 60) > 0 ? `${Math.floor(s / 60)} min atrás` : `${s} seg atrás`);
        };
        update(); const i = setInterval(update, 1000); return () => clearInterval(i);
    }, [task.createdAt]);
    const info = task.type === 'entrega' ? { icon: 'chevrons-up', title: 'Entregar Pedido', color: '#28a745' } : { icon: 'bell', title: 'Chamado de Ajuda', color: '#ffc107' };
    
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={{ marginRight: 15 }}>
                    {/* @ts-ignore */}
                    <Feather name={info.icon} size={24} color={info.color} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{info.title}</Text>
                    <Text style={styles.cardSubtitle}>Mesa {task.table} <Text style={{ color: '#888' }}>({elapsedTime})</Text></Text>
                    {task.type === 'entrega' && (
                        <TouchableOpacity onPress={() => onCancel(task)} style={{ marginTop: 8 }}>
                            <Text style={styles.cancelText}>CANCELAR</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity style={styles.completeButton} onPress={() => onComplete(task)}>
                    <Feather name="check-circle" size={36} color="#5cb85c" />
                </TouchableOpacity>
            </View>

            {task.type === 'entrega' && task.items && (
                <View style={styles.itemList}>
                    {task.items.map((item, i) => (
                        <View key={i} style={styles.itemWrapper}>
                            <Text style={styles.itemText}>
                                <Text style={{ fontWeight: 'bold' }}>{item.qty}x</Text> {item.name}
                            </Text>
                            {item.notes && (
                                <Text style={styles.itemNote}>
                                    ⚠️ {item.notes}
                                </Text>
                            )}
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};


// --- TELA PRINCIPAL (TaskList) ---
function TaskList() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [taskToCancel, setTaskToCancel] = useState<Task | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    
    // <<< 1. CRIAR UM REF PARA O ESTADO DE DESBLOQUEIO
    const audioUnlockedRef = useRef(Platform.OS !== 'web');
    // <<< 2. O ESTADO (para UI) LÊ O VALOR INICIAL DO REF
    const [audioUnlocked, setAudioUnlocked] = useState(audioUnlockedRef.current);
    const soundRef = useRef<Audio.Sound | null>(null);

    const socket = useSocket();
    const { logout, logoutCompleto, nomeUsuario } = useAuth(); 
    const router = useRouter();

    const unlockAndLoadAudio = async () => {
        if (audioUnlockedRef.current || soundRef.current) return;
        
        console.log("Tentando desbloquear e pré-carregar áudio...");
        try {
            await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
            const { sound } = await Audio.Sound.createAsync(
               require('../assets/sounds/alert.mp3') 
            );
            soundRef.current = sound;
            await sound.playAsync();
            await sound.stopAsync(); 
            
            // <<< 3. ATUALIZAR O ESTADO (para UI) E O REF (para lógica)
            setAudioUnlocked(true); 
            audioUnlockedRef.current = true; 

            Toast.show({ type: 'success', text1: 'Sons ativados!' });
            console.log("Áudio desbloqueado e pré-carregado.");
        } catch (error) {
            console.error("Falha ao desbloquear áudio:", error);
            if (error instanceof Error && error.name === 'NotAllowedError') {
                Toast.show({ type: 'error', text1: 'Falha ao ativar som', text2: 'Interaja com a tela e tente de novo.' });
            }
        }
    };

    const playAlert = async () => { 
        if (Platform.OS !== 'web') {
            Vibration.vibrate([400, 200, 400]);
        }
        
        // <<< 4. VERIFICAR O REF, NÃO O ESTADO
        if (soundRef.current && audioUnlockedRef.current) { 
            try {
                console.log("Tocando som pré-carregado...");
                await soundRef.current.replayAsync();
            } catch (error) {
                console.error("Falha ao tocar áudio pré-carregado:", error);
            }
        } 
        else if (Platform.OS !== 'web') {
            try {
                await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
                const { sound } = await Audio.Sound.createAsync(require('../assets/sounds/alert.mp3'));
                await sound.playAsync(); 
                sound.setOnPlaybackStatusUpdate(async (status) => {
                    if (status.isLoaded && status.didJustFinish) await sound.unloadAsync();
                });
            } catch (error) { console.error("Falha ao tocar áudio (nativo):", error); }
        }
        else {
            console.warn("Áudio bloqueado. Peça ao usuário para clicar em 'Ativar Sons'.");
            Toast.show({ type: 'error', text1: 'Sons bloqueados!', text2: "Clique no ícone 🔔 para ativar." });
        }
    };
    
    const fetchActiveTasks = useCallback(async (shouldShowSpinner: boolean = false) => {
        if (shouldShowSpinner) setIsLoading(true);
        setErrorMessage(null);
        try {
            const response = await apiClient.get('/pedidos/ativos');
            const tasksProntas = response.data
                .filter((p: any) => p.status === 'pronto') 
                .map((p: any) => ({ id: p.id.toString(), type: 'entrega', table: p.table, createdAt: new Date(p.time), items: p.items }));
            setTasks(tasksProntas);
        } catch (error) { 
            console.error("Erro ao buscar tarefas (esperado se o token expirou):", error);
            const isAuthError = error instanceof AxiosError && (error.response?.status === 401 || error.response?.status === 403);
            if (!isAuthError) {
                const message = error instanceof Error ? error.message : 'Erro de conexão.';
                setErrorMessage(message);
                Toast.show({ type: 'error', text1: 'Erro ao atualizar tarefas', text2: message });
            }
        } finally { 
            setIsLoading(false); 
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchActiveTasks(true);
    }, [fetchActiveTasks]); 

    // useEffect do Socket (sem mudanças, [socket] está correto)
    useEffect(() => {
        if (!socket) return;
        const handlePedido = (p: any) => {
            setTasks(prev => [{ id: p.id.toString(), type: 'entrega', table: p.table, createdAt: new Date(p.time), items: p.items }, ...prev]);
            Toast.show({ type: 'success', text1: 'Novo Pedido Pronto!', text2: `Mesa ${p.table}` });
            playAlert();
        };
        const handleAjuda = (d: any) => {
            setTasks(prev => [{ id: `ajuda_${Date.now()}`, type: 'ajuda', table: d.mesaNumero, createdAt: new Date(d.time) }, ...prev]);
            Toast.show({ type: 'info', text1: 'Chamado de Ajuda!', text2: `Mesa ${d.mesaNumero}` });
            playAlert(); // Esta chamada agora lerá o 'audioUnlockedRef.current'
        };
        const handleCancelado = (data: { pedidoId: string }) => {
             setTasks(prev => prev.filter(t => t.id !== data.pedidoId));
        };
        socket.on('pedido_pronto_para_entrega', handlePedido);
        socket.on('alerta_ajuda_mesa', handleAjuda);
        socket.on('pedido_cancelado', handleCancelado);
        return () => { 
            socket.off('pedido_pronto_para_entrega', handlePedido); 
            socket.off('alerta_ajuda_mesa', handleAjuda);
            socket.off('pedido_cancelado', handleCancelado);
        };
    }, [socket]);
    
    // Funções de Handle (sem mudanças)
    const handleCompleteTask = (task: Task) => { /* ... (código igual) ... */ 
        if (!socket) return;
        if (task.type === 'entrega') {
            socket.emit('confirmar_entrega', { pedidoId: task.id });
            Toast.show({ type: 'success', text1: 'Pedido Entregue!', text2: `Mesa ${task.table}` });
        } else {
            socket.emit('ajuda_concluida', { mesaNumero: task.table });
            Toast.show({ type: 'info', text1: 'Ajuda Concluída', text2: `Mesa ${task.table}` });
        }
        setTasks(prev => prev.filter(t => t.id !== task.id));
    };
    const handleOpenCancelModal = (task: Task) => { /* ... (código igual) ... */ 
        setTaskToCancel(task); setCancelReason(''); setModalVisible(true); 
    };
    const handleConfirmCancel = async () => { /* ... (código igual) ... */ 
        if (!taskToCancel || !cancelReason.trim()) {
            Toast.show({ type: 'error', text1: 'Erro', text2: 'O motivo é obrigatório.' });
            return;
        }
        setIsCancelling(true);
        try {
            await apiClient.put(`/pedidos/${taskToCancel.id}/cancelar`, { motivo: cancelReason });
            Toast.show({ type: 'info', text1: 'Pedido Cancelado', text2: `Mesa ${taskToCancel.table}` });
            setModalVisible(false);
            setTasks(prev => prev.filter(t => t.id !== taskToCancel.id));
        }
        catch (error: any) {
            console.error("Erro ao cancelar:", error);
            const msg = error.response?.data?.message || 'Não foi possível cancelar o pedido.';
            Toast.show({ type: 'error', text1: 'Ops!', text2: msg });
        } finally {
            setIsCancelling(false);
        }
    };
    const handleLogoutPress = () => { /* ... (código igual, com Platform.OS) ... */ 
        if (Platform.OS === 'web') {
            const querTrocarTurno = window.confirm(`Logado como ${nomeUsuario}.\n\nClique "OK" para TROCAR TURNO (Sair).\nClique "Cancelar" para outras opções.`);
            if (querTrocarTurno) {
                logout(); 
            } else {
                const querEsquecer = window.confirm("Opção avançada:\n\nClique 'OK' para ESQUECER O DISPOSITIVO (Logout Completo).\nClique 'Cancelar' para não fazer nada.");
                if (querEsquecer) {
                    logoutCompleto();
                }
            }
        } else {
            Alert.alert(
                `Sair (Logado como ${nomeUsuario})`, "O que você gostaria de fazer?",
                [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Trocar Turno (Sair)", onPress: () => logout() },
                    { text: "Esquecer Dispositivo", style: "destructive", onPress: () => logoutCompleto() }
                ]
            );
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push('/history')} style={styles.headerButtonLeft}>
                    <Feather name="clock" size={24} color="#4a5568" />
                </TouchableOpacity>

                {/* Botão de Áudio (agora usa o estado 'audioUnlocked') */}
                {Platform.OS === 'web' && !audioUnlocked && (
                    <TouchableOpacity onPress={unlockAndLoadAudio} style={styles.headerButtonLeftAudio}>
                        <Feather name="bell-off" size={24} color="#e53e3e" />
                    </TouchableOpacity>
                )}
                {Platform.OS === 'web' && audioUnlocked && (
                    <View style={styles.headerButtonLeftAudio}>
                        <Feather name="bell" size={24} color="#48bb78" />
                    </View>
                )}
                
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Tarefas do Salão</Text>
                    {nomeUsuario && (
                        <Text style={styles.headerUserName}>Logado como: {nomeUsuario}</Text>
                    )}
                </View>
                <TouchableOpacity onPress={handleLogoutPress} style={styles.headerButtonRight}>
                    <Feather name="log-out" size={24} color="#e53e3e" />
                </TouchableOpacity>
            </View>

            {isLoading ? <ActivityIndicator size="large" color="#4299e1" style={{ marginTop: 50 }} /> :
                <FlatList
                    data={tasks}
                    keyExtractor={i => i.id}
                    renderItem={({ item }) => <TaskCard task={item} onComplete={handleCompleteTask} onCancel={handleOpenCancelModal} />}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', marginTop: 40 }}>
                            <Text style={styles.emptyText}>{errorMessage || 'Sem tarefas no momento.'}</Text>
                            {errorMessage && (
                                <TouchableOpacity onPress={() => fetchActiveTasks(true)} style={{ marginTop: 10 }}>
                                    <Text style={{ color: '#3182ce', fontWeight: '600' }}>Tentar novamente</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    }
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl 
                            refreshing={refreshing} 
                            onRefresh={() => {
                                setRefreshing(true);
                                fetchActiveTasks();
                            }} 
                            colors={['#4299e1']}
                            tintColor="#4299e1"
                        />
                    }
                />
            }
            
            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                {/* ... (código interno do modal 100% igual) ... */}
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Cancelar Pedido</Text>
                        <Text style={styles.modalSubtitle}>Mesa {taskToCancel?.table}</Text>
                        <Text style={styles.label}>Motivo do cancelamento:</Text>
                        <TextInput style={styles.input} placeholder="Ex: Cliente desistiu..." value={cancelReason} onChangeText={setCancelReason} multiline />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.modalBtn, styles.btnSecondary]} onPress={() => setModalVisible(false)} disabled={isCancelling}><Text style={styles.btnSecondaryText}>Voltar</Text></TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, styles.btnDanger]} onPress={handleConfirmCancel} disabled={isCancelling}>
                                {isCancelling ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnDangerText}>CONFIRMAR</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}

// --- COMPONENTE PRINCIPAL (Main) ---
export default function Main() {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) {
        return <View style={[styles.safeArea, { justifyContent: 'center' }]}><ActivityIndicator size="large" color="#48bb78" /></View>;
    }
    return isAuthenticated ? <TaskList /> : <LoginScreen />;
}

// --- (Estilos permanecem 100% iguais) ---
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f4f7f9' },
    header: { paddingVertical: 10, paddingHorizontal: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#ddd', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 70 },
    headerButtonLeft: { position: 'absolute', left: 20, zIndex: 1 },
    headerButtonRight: { position: 'absolute', right: 20, zIndex: 1 },
    headerButtonLeftAudio: {
        position: 'absolute',
        left: 60,
        zIndex: 1,
        padding: 5,
    },
    headerTitleContainer: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a202c' },
    headerUserName: { fontSize: 12, color: '#4a5568', fontWeight: '500' },
    listContainer: { padding: 15 },
    card: { backgroundColor: 'white', borderRadius: 12, padding: 15, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#2d3748' },
    cardSubtitle: { fontSize: 16, color: '#4a5568', marginTop: 2 },
    cancelText: { color: '#e53e3e', fontWeight: 'bold', fontSize: 14, paddingVertical: 5 },
    completeButton: { padding: 5, marginLeft: 10 },
    itemList: { marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#edf2f7' },
    itemWrapper: { marginBottom: 5 },
    itemText: { fontSize: 16, color: '#4a5568', marginBottom: 2 },
    itemNote: { fontSize: 15, color: '#dd8b0f', fontWeight: '600', marginLeft: 25, fontStyle: 'italic', backgroundColor: '#fffbeb', padding: 4, borderRadius: 4 },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 18, color: '#a0aec0' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, minHeight: 350 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#e53e3e', marginBottom: 5 },
    modalSubtitle: { fontSize: 18, color: '#4a5568', marginBottom: 25 },
    label: { fontWeight: 'bold', color: '#2d3748', marginBottom: 10 },
    input: { backgroundColor: '#edf2f7', borderRadius: 10, padding: 15, fontSize: 16, minHeight: 100, textAlignVertical: 'top', marginBottom: 25 },
    modalButtons: { flexDirection: 'row', gap: 15 },
    modalBtn: { flex: 1, padding: 18, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    btnSecondary: { backgroundColor: '#edf2f7' },
    btnSecondaryText: { color: '#4a5568', fontWeight: 'bold' },
    btnDanger: { backgroundColor: '#e53e3e' },
    btnDangerText: { color: 'white', fontWeight: 'bold', fontSize: 13 }
});