// Substitua o conteúdo COMPLETO do seu arquivo: kds-cozinha/src/App.jsx

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { io } from "socket.io-client";
import { AuthProvider, useAuth } from './context/AuthContext';
import { apiClient, API_BASE_URL } from './api/apiClient';
import LoginScreen from './components/LoginScreen';
import './App.css';

// (Componente OrderCard e OrderColumn continuam iguais...)
function OrderCard({ order, onStatusChange, showTimer }) {
    const [elapsedTime, setElapsedTime] = useState(0);
    useEffect(() => {
        const calculateTime = () => {
            const startTime = new Date(order.time);
            const seconds = Math.floor((new Date() - startTime) / 1000);
            setElapsedTime(seconds);
        };
        calculateTime();
        const timer = setInterval(calculateTime, 1000);
        return () => clearInterval(timer);
    }, [order.time]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const formatNotes = (notes) => {
        if (!notes) return [];
        return notes.split(/,(?![^()]*\))/g).map(s => s.trim());
    };

    return (
        <div className="order-card">
            <div className="card-header">
                <span className="table-number">Mesa {order.table}</span>
                <span className="timer">{showTimer ? formatTime(elapsedTime) : '—'}</span>
            </div>
            
            <div className="card-body">
                {order.items.map((item, index) => (
                    <div key={index} className="order-item">
                        <span className="item-quantity">{item.qty}x</span>
                        <span className="item-name">{item.name}</span>
                        {item.notes && (
                            <div className="card-notes">
                                {formatNotes(item.notes).map((note, i) => (
                                    <span key={i} className="note-line">{note}</span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
            <div className="card-actions">
              {order.status === 'A Fazer' && <button className="action-button start-button" onClick={() => onStatusChange(order, 'em_preparo')}>Iniciar Preparo</button>}
              {order.status === 'em_preparo' && <button className="action-button ready-button" onClick={() => onStatusChange(order, 'pronto')}>Pedido Pronto</button>}
            </div>
        </div>
    );
}

function OrderColumn({ title, orders, onStatusChange, showTimer }) {
  return (
    <div className={`order-column ${orders.length === 0 ? 'order-column--empty' : ''}`}>
      <div className="column-title">
        <span>{title}</span>
        <span className="column-pill">{orders.length}</span>
      </div>
      <div className="column-content">
        {orders.length === 0 ? (
          <div className="empty-column">
            <span role="img" aria-hidden="true">✨</span>
            <span>Sem pedidos aqui</span>
          </div>
        ) : orders.map(order => (
            <OrderCard key={order.id} order={order} onStatusChange={onStatusChange} showTimer={showTimer} />
        ))}
      </div>
    </div>
  );
}
// --- FIM DOS COMPONENTES ---


function KDSBoard() {
  const [orders, setOrders] = useState([]);
  const socketRef = useRef(null);
  const { logout, kdsToken } = useAuth(); // <<< Pega o kdsToken
  const [searchTerm, setSearchTerm] = useState('');
  const [compactMode, setCompactMode] = useState(false);
  
  const audioRef = useRef(new Audio('/sounds/alert.mp3'));

  const playSound = () => {
    try {
        audioRef.current.currentTime = 0;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => { console.warn("Áudio bloqueado."); });
        }
    } catch (e) { console.error("Erro ao tocar som:", e); }
  };

  useEffect(() => {
    const fetchOrders = async () => {
        try {
            const response = await apiClient.get('/pedidos/ativos');
            const data = response.data.map(order => ({...order, id: order.id.toString()}));
            setOrders(data);
        } catch (error) { console.error("Erro ao buscar pedidos:", error); }
    };
    fetchOrders();

    // <<<--- CORREÇÃO APLICADA AQUI ---<<<
    console.log("KDSBoard: Conectando socket...");
    const socket = io(API_BASE_URL, {
        transports: ['websocket'],
        auth: { token: kdsToken }, // Envia o token para o backend
        extraHeaders: {
            'ngrok-skip-browser-warning': 'true'
        }
    });
    socketRef.current = socket;

    socket.on('connect', () => {
        console.log(`KDS Conectado: ${socket.id}`);
        // Autentica para entrar na sala
        if (kdsToken) {
            socket.emit('autenticar', kdsToken);
        }
    });
    
    socket.on('novo_pedido', (novoPedido) => {
      console.log('Novo pedido:', novoPedido);
      playSound(); // <<< O SOM VAI VOLTAR A TOCAR
      novoPedido.id = novoPedido.id.toString();
      novoPedido.items = novoPedido.items.map(item => ({...item, notes: item.notes || ''}));
      setOrders(prev => [novoPedido, ...prev]);
    });

    socket.on('pedido_foi_entregue', (data) => {
        setOrders(prev => prev.filter(o => o.id.toString() !== data.pedidoId.toString()));
    });
    socket.on('pedido_cancelado', (data) => {
        setOrders(prev => prev.filter(o => o.id.toString() !== data.pedidoId.toString()));
    });

    return () => { socket.disconnect(); };
  }, [kdsToken]); // <<< O useEffect agora depende do token

  const handleOrderStatusChange = (order, novoStatus) => {
    setOrders(current => current.map(o => o.id === order.id ? { ...o, status: novoStatus } : o));
    if (socketRef.current) socketRef.current.emit('status_pedido_alterado', { pedido: order, novoStatus });
  };

  const visibleOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return orders;
    return orders.filter(order => {
        const tableStr = (order.table || '').toString().toLowerCase();
        const itemsText = order.items?.map((i) => i.name).join(' ').toLowerCase();
        return tableStr.includes(term) || itemsText.includes(term);
    });
  }, [orders, searchTerm]);

  const toMake = visibleOrders.filter(o => o.status === 'A Fazer');
  const inPrep = visibleOrders.filter(o => o.status === 'em_preparo');
  const ready = visibleOrders.filter(o => o.status === 'pronto');

  return (
    <div className="app-container">
      <div className="header">
          <div className="header__title">
              <span>KDS - Cozinha</span>
              <span className="header__subtitle">Monitorando {orders.length} pedidos</span>
          </div>
          <div className="toolbar">
              <input
                className="toolbar__search"
                placeholder="Buscar mesa ou item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <label className="toolbar__toggle">
                  <input
                    type="checkbox"
                    checked={compactMode}
                    onChange={() => setCompactMode((prev) => !prev)}
                  />
                  <span>Modo compacto</span>
              </label>
              <button className="toolbar__logout" onClick={logout}>Sair</button>
          </div>
      </div>
      <div className="kds-board">
        <OrderColumn title="A FAZER" orders={toMake} onStatusChange={handleOrderStatusChange} showTimer={!compactMode} />
        <OrderColumn title="EM PREPARO" orders={inPrep} onStatusChange={handleOrderStatusChange} showTimer={!compactMode} />
        <OrderColumn title="PRONTO" orders={ready} onStatusChange={handleOrderStatusChange} showTimer={!compactMode} />
      </div>
    </div>
  );
}

// (Componentes App e Main continuam iguais)
function App() {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
}

function Main() {
    // <<< ATUALIZADO para usar o kdsToken (do AuthContext) >>>
    const { kdsToken, loading } = useAuth();
    if (loading) return <div className="app-container">Carregando...</div>;
    return kdsToken ? <KDSBoard /> : <LoginScreen />;
}

export default App;