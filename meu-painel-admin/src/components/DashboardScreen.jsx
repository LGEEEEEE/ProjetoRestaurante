// Substitua o arquivo: painel-admin/src/components/DashboardScreen.jsx

import React, { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig'; 
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const styles = {
  kardsContainer: { display: 'flex', flexWrap: 'wrap', gap: '1.5rem' },
  kard: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', minWidth: '200px', flex: 1 },
  kardTitle: { fontSize: '0.9rem', fontWeight: 'bold', color: '#718096', margin: 0, marginBottom: '0.5rem', textTransform: 'uppercase' },
  kardValue: { fontSize: '2rem', fontWeight: '800', color: '#2d3748', margin: 0 },
  loadingText: { fontSize: '1.5rem', color: '#555', textAlign: 'center', marginTop: '2rem' },
  chartsRow: { display: 'flex', gap: '1.5rem', marginTop: '2rem', flexWrap: 'wrap' },
  chartKard: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', flex: 1, minWidth: '400px', height: '450px' },
  chartHeader: { marginBottom: '1.5rem' },
  chartTitle: { fontSize: '1.25rem', fontWeight: 'bold', margin: 0, color: '#2d3748' },
  dashboardHeader: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '2rem' },
  headerTopRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  title: { fontSize: '2rem', margin: 0, color: '#2d3748', fontWeight: '800' },
  controlsRow: { display: 'flex', gap: '1.5rem', alignItems: 'flex-end', flexWrap: 'wrap' },
  filterGroup: { display: 'flex', gap: '0.5rem', backgroundColor: '#edf2f7', padding: '0.5rem', borderRadius: '8px' },
  filterButton: { padding: '0.5rem 1rem', border: 'none', borderRadius: '6px', backgroundColor: 'transparent', fontWeight: '600', color: '#718096', cursor: 'pointer', transition: 'all 0.2s' },
  filterButtonActive: { backgroundColor: 'white', color: '#3182ce', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  dateInputs: { display: 'flex', gap: '1rem', alignItems: 'center' },
  dateField: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  dateLabel: { fontSize: '0.85rem', fontWeight: 'bold', color: '#4a5568' },
  dateInput: { padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#2d3748' },
  actionButtons: { display: 'flex', gap: '0.8rem' },
  btnAction: { padding: '0.6rem 1.2rem', border: 'none', borderRadius: '6px', fontWeight: 'bold', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', transition: 'filter 0.2s' },
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const getFormattedDate = (date) => date.toISOString().split('T')[0];

function DashboardScreen() {
  const [startDate, setStartDate] = useState(getFormattedDate(new Date()));
  const [endDate, setEndDate] = useState(getFormattedDate(new Date()));
  const [activeFilter, setActiveFilter] = useState('hoje');
  const [faturamento, setFaturamento] = useState(0);
  const [totalPedidos, setTotalPedidos] = useState(0);
  const [topPratos, setTopPratos] = useState([]);
  const [vendasCategoria, setVendasCategoria] = useState([]);
  const [restaurantConfig, setRestaurantConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
      apiClient.get('/restaurante/config').then(res => setRestaurantConfig(res.data)).catch(console.error);
  }, []);

  const fetchDashboardData = async (start, end) => {
    setIsLoading(true);
    try {
      const params = { data_inicio: start, data_fim: end };
      const [fatRes, pedRes, topRes, catRes] = await Promise.all([
        apiClient.get('/relatorios/faturamento', { params }),
        apiClient.get('/relatorios/total-pedidos', { params }),
        apiClient.get('/relatorios/top-pratos', { params }),
        apiClient.get('/relatorios/vendas-categoria', { params })
      ]);
      setFaturamento(fatRes.data.faturamento);
      setTotalPedidos(pedRes.data.total_pedidos);
      setTopPratos(topRes.data);
      setVendasCategoria(catRes.data);
    } catch (err) { console.error(err); alert("Erro ao atualizar dados."); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchDashboardData(startDate, endDate); }, [startDate, endDate]);

  const applyFilter = (filterType) => {
      setActiveFilter(filterType);
      const end = new Date();
      let start = new Date();
      if (filterType === 'semana') start.setDate(end.getDate() - end.getDay());
      else if (filterType === 'mes') start.setDate(1);
      setStartDate(getFormattedDate(start));
      setEndDate(getFormattedDate(end));
  };

  // <<<--- FUNÇÃO AUXILIAR CORRIGIDA ---<<<
  const getFullImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${apiClient.defaults.baseURL}${url}`;
  };

  const getDataUri = (url) => {
    return new Promise((resolve) => {
        const image = new Image();
        image.setAttribute('crossOrigin', 'anonymous');
        image.onload = function () {
            const canvas = document.createElement('canvas');
            canvas.width = this.naturalWidth;
            canvas.height = this.naturalHeight;
            canvas.getContext('2d').drawImage(this, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        image.onerror = (e) => { console.warn("Falha ao carregar imagem para PDF", e); resolve(null); };
        
        // <<<--- USA A FUNÇÃO CORRIGIDA ---<<<
        image.src = getFullImageUrl(url);
    });
  }

  const downloadPDF = async () => {
      const doc = new jsPDF();
      
      if (restaurantConfig?.logo_url) {
          const logoDataUri = await getDataUri(restaurantConfig.logo_url);
          if (logoDataUri) doc.addImage(logoDataUri, 'PNG', 14, 10, 25, 25);
      }

      doc.setFontSize(22); doc.text('Relatório de Performance', 14, 45);
      doc.setFontSize(10); doc.setTextColor(100);
      doc.text(`Período: ${new Date(startDate).toLocaleDateString('pt-BR')} a ${new Date(endDate).toLocaleDateString('pt-BR')}`, 14, 52);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 57);

      doc.setFontSize(14); doc.setTextColor(0); doc.text("Resumo Geral", 14, 70);
      doc.setFontSize(12);
      doc.text(`• Faturamento: ${faturamento.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}`, 20, 80);
      doc.text(`• Total de Pedidos: ${totalPedidos}`, 20, 90);
      const ticketMedio = totalPedidos > 0 ? faturamento / totalPedidos : 0;
      doc.text(`• Ticket Médio: ${ticketMedio.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}`, 20, 100);

      doc.setFontSize(14); doc.text("Top Pratos Mais Vendidos", 14, 115);
      autoTable(doc, {
          startY: 120, head: [['Prato', 'Qtd. Vendida']],
          body: topPratos.map(p => [p.nome, p.total_vendido]),
          headStyles: { fillColor: [49, 130, 206] },
      });
      
      let finalY = doc.lastAutoTable.finalY || 150;
      doc.text("Faturamento por Categoria", 14, finalY + 15);
      autoTable(doc, {
          startY: finalY + 20, head: [['Categoria', 'Faturamento']],
          body: vendasCategoria.map(c => [c.name, c.value.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})]),
          headStyles: { fillColor: [221, 107, 32] },
      });

      doc.save(`relatorio_${startDate}_${endDate}.pdf`);
  };

  const downloadExcel = () => {
    const data = [
        ["Relatório de Performance"],
        [`Período: ${new Date(startDate).toLocaleDateString('pt-BR')} a ${new Date(endDate).toLocaleDateString('pt-BR')}`],
        [], ["RESUMO"],
        ["Faturamento", faturamento], ["Total Pedidos", totalPedidos],
        ["Ticket Médio", totalPedidos > 0 ? faturamento / totalPedidos : 0],
        [], ["TOP PRATOS"], ["Prato", "Qtd"]
    ];
    topPratos.forEach(p => data.push([p.nome, p.total_vendido]));
    data.push([], ["VENDAS POR CATEGORIA"], ["Categoria", "Faturamento"]);
    vendasCategoria.forEach(c => data.push([c.name, c.value]));

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Dashboard");
    XLSX.writeFile(wb, `dashboard_${startDate}.xlsx`);
};

  const DashboardKard = ({ title, value, format = v => v }) => (
    <div style={styles.kard}><h2 style={styles.kardTitle}>{title}</h2><p style={styles.kardValue}>{format(value)}</p></div>
  );

  return (
    <div>
      <div style={styles.dashboardHeader}>
        <div style={styles.headerTopRow}>
            <h1 style={styles.title}>Dashboard</h1>
            <div style={styles.actionButtons}>
                <button style={{...styles.btnAction, backgroundColor: '#e53e3e'}} onClick={downloadPDF} disabled={isLoading}>📄 PDF com Logo</button>
                <button style={{...styles.btnAction, backgroundColor: '#217346'}} onClick={downloadExcel} disabled={isLoading}>📊 Excel</button>
            </div>
        </div>
        <div style={styles.controlsRow}>
            <div style={styles.filterGroup}>
                {['hoje', 'semana', 'mes'].map(type => (
                    <button key={type} style={{...styles.filterButton, ...(activeFilter === type && styles.filterButtonActive)}} onClick={() => applyFilter(type)}>
                        {type === 'hoje' ? 'Hoje' : type === 'semana' ? 'Esta Semana' : 'Este Mês'}
                    </button>
                ))}
                <button style={{...styles.filterButton, ...(activeFilter === 'personalizado' && styles.filterButtonActive)}} onClick={() => setActiveFilter('personalizado')}>Personalizado</button>
            </div>
            <div style={{...styles.dateInputs, opacity: activeFilter === 'personalizado' ? 1 : 0.6}}>
                <div style={styles.dateField}><label style={styles.dateLabel}>De:</label><input type="date" style={styles.dateInput} value={startDate} onChange={e => { setStartDate(e.target.value); setActiveFilter('personalizado'); }} disabled={activeFilter !== 'personalizado'} /></div>
                <div style={styles.dateField}><label style={styles.dateLabel}>Até:</label><input type="date" style={styles.dateInput} value={endDate} onChange={e => { setEndDate(e.target.value); setActiveFilter('personalizado'); }} disabled={activeFilter !== 'personalizado'} /></div>
            </div>
        </div>
      </div>

      {isLoading && <div style={{position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'rgba(255,255,255,0.9)', padding: '2rem', borderRadius: '1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 10}}>Carregando dados...</div>}

      <div style={styles.kardsContainer}>
        <DashboardKard title="Faturamento" value={faturamento} format={v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
        <DashboardKard title="Total Pedidos" value={totalPedidos} />
        <DashboardKard title="Ticket Médio" value={totalPedidos > 0 ? faturamento / totalPedidos : 0} format={v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
      </div>

      <div style={styles.chartsRow}>
        <div style={styles.chartKard}>
            <div style={styles.chartHeader}><h3 style={styles.chartTitle}>Top 5 Pratos Mais Vendidos</h3></div>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={topPratos} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="nome" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f7fafc'}} formatter={(value) => [value, 'Vendas']} />
                <Bar dataKey="total_vendido" fill="#3182ce" radius={[4, 4, 0, 0]} name="Qtd." />
              </BarChart>
            </ResponsiveContainer>
        </div>
        <div style={styles.chartKard}>
            <div style={styles.chartHeader}><h3 style={styles.chartTitle}>Faturamento por Categoria</h3></div>
            <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                    <Pie data={vendasCategoria} cx="50%" cy="50%" innerRadius={60} outerRadius={100} fill="#8884d8" paddingAngle={5} dataKey="value" label={({name, percent}) => `${(percent * 100).toFixed(0)}%`}>
                        {vendasCategoria.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                    </Pie>
                    <Tooltip formatter={(value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default DashboardScreen;