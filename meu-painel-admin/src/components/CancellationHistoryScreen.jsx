// Substitua o arquivo: painel-admin/src/components/CancellationHistoryScreen.jsx

import React, { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const styles = {
    badge: { padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', display: 'inline-block' },
    badgeCancelado: { backgroundColor: '#fed7d7', color: '#c53030' },
    badgeEstornado: { backgroundColor: '#feebc8', color: '#c05621' },
    loadingContainer: { textAlign: 'center', padding: '2rem', fontSize: '1.2rem', color: '#555' },
    headerActions: { display: 'flex', gap: '0.5rem' },
    // <<<--- NOVOS ESTILOS PARA OS FILTROS ---<<<
    filtersBar: {
        display: 'flex',
        gap: '1rem',
        backgroundColor: 'white',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        flexWrap: 'wrap',
        alignItems: 'flex-end'
    },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
    label: { fontSize: '0.875rem', fontWeight: 'bold', color: '#4a5568' },
    input: {
        padding: '0.5rem',
        border: '1px solid #cbd5e0',
        borderRadius: '4px',
        fontSize: '0.9rem',
        minWidth: '150px'
    },
    select: {
        padding: '0.6rem', // Um pouco maior para alinhar com inputs de data
        border: '1px solid #cbd5e0',
        borderRadius: '4px',
        fontSize: '0.9rem',
        minWidth: '150px',
        backgroundColor: 'white'
    }
};

function CancellationHistoryScreen() {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // <<<--- ESTADOS DOS FILTROS ---<<<
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchText, setSearchText] = useState('');
    const [filterType, setFilterType] = useState('todos');

    useEffect(() => { fetchHistory(); }, []);

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            // Prepara os parâmetros para enviar ao backend
            const params = {};
            if (startDate) params.data_inicio = startDate;
            if (endDate) params.data_fim = endDate;
            if (searchText) params.busca = searchText;
            if (filterType !== 'todos') params.tipo = filterType;

            const response = await apiClient.get('/relatorios/problemas', { params });
            setHistory(response.data);
        } catch (err) {
            console.error('Erro ao buscar histórico:', err);
            setError('Não foi possível carregar o histórico.');
        } finally { setIsLoading(false); }
    };

    // (Funções auxiliares de data/moeda e Downloads PDF/Excel continuam iguais...)
    const formatDate = (d) => new Date(d).toLocaleString('pt-BR');
    const formatCurrency = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const downloadExcel = () => {
        if (history.length === 0) return alert("Sem dados.");
        const data = history.map(i => ({ "Data": formatDate(i.data), "Mesa": i.mesa, "Tipo": i.tipo, "Valor": i.valor, "Motivo": i.motivo }));
        const ws = XLSX.utils.json_to_sheet(data);
        ws['!cols'] = [{wch:20},{wch:8},{wch:15},{wch:12},{wch:50}];
        const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Problemas");
        XLSX.writeFile(wb, `problemas_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const downloadPDF = () => {
        if (history.length === 0) return alert("Sem dados.");
        const doc = new jsPDF();
        doc.setFontSize(18); doc.text('Relatório de Problemas', 14, 22);
        doc.setFontSize(11); doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);
        autoTable(doc, {
            head: [['Data', 'Mesa', 'Tipo', 'Valor', 'Motivo']],
            body: history.map(i => [formatDate(i.data), `Mesa ${i.mesa}`, i.tipo.toUpperCase(), i.valor.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}), i.motivo]),
            startY: 40, styles: { fontSize: 9 }, headStyles: { fillColor: [66, 153, 225] }
        });
        doc.save(`problemas_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div>
            <div className="header">
                <h1>Histórico de Problemas</h1>
                <div style={styles.headerActions}>
                    <button className="btn-primary" style={{backgroundColor: '#e53e3e', padding: '0.5rem', fontSize:'0.9rem'}} onClick={downloadPDF} disabled={isLoading || history.length === 0}>📄 PDF</button>
                    <button className="btn-primary" style={{backgroundColor: '#217346', padding: '0.5rem', fontSize:'0.9rem'}} onClick={downloadExcel} disabled={isLoading || history.length === 0}>📊 Excel</button>
                </div>
            </div>

            {/* <<<--- BARRA DE FILTROS ---<<< */}
            <div style={styles.filtersBar}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>De:</label>
                    <input type="date" style={styles.input} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Até:</label>
                    <input type="date" style={styles.input} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Tipo:</label>
                    <select style={styles.select} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                        <option value="todos">Todos</option>
                        <option value="cancelado">Cancelamentos</option>
                        <option value="estornado">Estornos</option>
                    </select>
                </div>
                <div style={{...styles.inputGroup, flex: 1}}> {/* Flex 1 para ocupar o espaço restante */}
                    <label style={styles.label}>Buscar por motivo:</label>
                    <input 
                        type="text" 
                        style={styles.input} 
                        placeholder="Ex: carne crua, desistiu..." 
                        value={searchText} 
                        onChange={(e) => setSearchText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchHistory()} // Busca ao apertar Enter
                    />
                </div>
                <button className="btn-primary" onClick={fetchHistory} disabled={isLoading}>
                    🔍 Filtrar
                </button>
            </div>

            {isLoading ? <div style={styles.loadingContainer}>Carregando...</div> : 
             error ? <div style={styles.loadingContainer}>{error}</div> : (
                <table className="product-table">
                    <thead><tr><th>Data/Hora</th><th>Mesa</th><th>Tipo</th><th>Valor</th><th>Motivo Registrado</th></tr></thead>
                    <tbody>
                        {history.length === 0 ? (<tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#a0aec0' }}>Nenhum registro encontrado para estes filtros.</td></tr>) : (
                            history.map((item) => (
                                <tr key={item.id}>
                                    <td>{formatDate(item.data)}</td><td style={{fontWeight:'bold'}}>Mesa {item.mesa}</td>
                                    <td><span style={{...styles.badge, ...(item.tipo === 'Cancelamento' ? styles.badgeCancelado : styles.badgeEstornado)}}>{item.tipo}</span></td>
                                    <td style={{color:'#e53e3e', fontWeight:'bold'}}>{formatCurrency(item.valor)}</td>
                                    <td style={{maxWidth:'400px', lineHeight:'1.4'}}>{item.motivo}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default CancellationHistoryScreen;