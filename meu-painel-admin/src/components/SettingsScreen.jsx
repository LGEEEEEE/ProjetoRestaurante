// Substitua o arquivo: painel-admin/src/components/SettingsScreen.jsx

import React, { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';
import ColorThief from 'colorthief';

const styles = {
    settingsContainer: { backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', maxWidth: '800px' },
    sectionTitle: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#2d3748', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginTop: '2rem' },
    formRow: { display: 'flex', gap: '2rem', flexWrap: 'wrap' }, // Para colocar inputs lado a lado
    formGroup: { marginBottom: '1.5rem', flex: 1, minWidth: '250px' },
    label: { display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#4a5568' },
    input: { width: '100%', padding: '0.75rem', border: '1px solid #cbd5e0', borderRadius: '6px', fontSize: '1rem' },
    logoPreview: { maxWidth: '200px', maxHeight: '100px', marginTop: '1rem', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '8px', objectFit: 'contain' },
    paletteContainer: { display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap', alignItems: 'center' },
    colorSwatch: { width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', border: '3px solid #f4f7f9', boxShadow: '0 0 0 1px #cbd5e0' },
    primaryRing: { boxShadow: '0 0 0 3px #4299e1' }, secondaryRing: { boxShadow: '0 0 0 3px #f56565' },
    manualPickerContainer: { display: 'flex', alignItems: 'center', gap: '1rem' },
    colorInput: { width: '50px', height: '50px', border: 'none', padding: 0, cursor: 'pointer', backgroundColor: 'transparent' },
    button: { backgroundColor: '#4299e1', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '2rem', width: '100%' },
};

function SettingsScreen() {
  const [config, setConfig] = useState({ cor_primaria: '', cor_secundaria: '', logo_url: '', chave_pix: '', taxa_servico: 10 });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [colorPalette, setColorPalette] = useState([]);
  const [loading, setLoading] = useState(true);

  // <<<--- FUNÇÃO CORRIGIDA ---<<<
  const getFullImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('blob:') || url.startsWith('http')) return url;
    // Usa a URL do Ngrok (importada implicitamente pelo apiClient)
    return `${apiClient.defaults.baseURL}${url}`;
  };

  useEffect(() => {
    apiClient.get('/restaurante/config').then(res => {
        if (res.data) {
            setConfig(res.data);
            setLogoPreview(res.data.logo_url);
        }
    }).finally(() => setLoading(false));
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
      const img = new Image(); img.src = previewUrl; img.crossOrigin = "Anonymous";
      img.onload = () => {
        try {
            const palette = new ColorThief().getPalette(img, 5);
            if (palette) setColorPalette(palette.map(rgb => `#${rgb.map(c => c.toString(16).padStart(2, '0')).join('')}`));
        } catch (e) { console.warn("Sem paleta"); }
      };
    }
  };

  const handleSave = async () => {
    try {
      let finalConfig = { ...config };
      if (logoFile) {
        const formData = new FormData(); formData.append('logo', logoFile);
        const res = await apiClient.post('/restaurante/logo', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        finalConfig.logo_url = res.data.logo_url;
      }
      const response = await apiClient.put('/restaurante/config', finalConfig);
      setConfig(response.data); setLogoPreview(response.data.logo_url);
      alert('Configurações salvas!');
    } catch (error) { alert('Erro ao salvar.'); }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div style={styles.settingsContainer}>
      <h1 style={{fontSize: '2rem', marginBottom: '1rem', color: '#1a202c'}}>Configurações</h1>

      {/* --- SEÇÃO FINANCEIRO --- */}
      <h2 style={styles.sectionTitle}>Financeiro</h2>
      <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Taxa de Serviço (%)</label>
            <input 
                type="number" 
                style={styles.input} 
                value={config.taxa_servico || 0} 
                onChange={(e) => setConfig({...config, taxa_servico: parseFloat(e.target.value)})}
                min="0" max="100" step="0.1"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Chave PIX (CPF/CNPJ/Email/Tel)</label>
            <input 
                type="text" 
                style={styles.input} 
                value={config.chave_pix || ''} 
                onChange={(e) => setConfig({...config, chave_pix: e.target.value})}
                placeholder="Ex: 12.345.678/0001-90"
            />
          </div>
      </div>

      {/* --- SEÇÃO VISUAL --- */}
      <h2 style={styles.sectionTitle}>Identidade Visual</h2>
      <div style={styles.formGroup}>
        <label style={styles.label}>Logo do Restaurante</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {logoPreview && <img src={getFullImageUrl(logoPreview)} alt="Logo" style={styles.logoPreview} />}
      </div>

      {colorPalette.length > 0 && (
        <div style={styles.formGroup}>
            <label style={styles.label}>Cores Sugeridas</label>
            <div style={styles.paletteContainer}>
                {colorPalette.map((c, i) => (
                <div key={i} style={{ ...styles.colorSwatch, backgroundColor: c, ...(config.cor_primaria === c && styles.primaryRing), ...(config.cor_secundaria === c && styles.secondaryRing) }}
                    onClick={() => setConfig({...config, cor_primaria: c})}
                    onContextMenu={(e) => { e.preventDefault(); setConfig({...config, cor_secundaria: c}); }}
                />))}
            </div>
        </div>
      )}
      
      <div style={styles.formRow}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Cor Primária</label>
          <div style={styles.manualPickerContainer}>
            <input style={styles.colorInput} type="color" value={config.cor_primaria || '#ffffff'} onChange={(e) => setConfig({...config, cor_primaria: e.target.value})} />
            <span>{config.cor_primaria}</span>
          </div>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Cor Secundária</label>
          <div style={styles.manualPickerContainer}>
            <input style={styles.colorInput} type="color" value={config.cor_secundaria || '#ffffff'} onChange={(e) => setConfig({...config, cor_secundaria: e.target.value})} />
            <span>{config.cor_secundaria}</span>
          </div>
        </div>
      </div>
      
      <button style={styles.button} onClick={handleSave}>SALVAR TUDO</button>
    </div>
  );
}

export default SettingsScreen;