// Substitua o conteúdo do seu arquivo: app/(app)/index.tsx

import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { useRestaurant } from '../../src/context/RestaurantContext';
import { useAuth } from '../../src/context/AuthContext';

export default function WelcomeScreen() {
  const { config, loading: restaurantLoading } = useRestaurant();
  const { mesaNumero, isLoading: authLoading } = useAuth();

  console.log("🔍 DEBUG LOGO URL:", config?.logo_url);

  // O <Stack.Screen> foi REMOVIDO daqui.
  // O novo app/(app)/_layout.tsx agora controla esta tela.

  if (restaurantLoading || authLoading || !config) {
    return <View style={styles.container}><ActivityIndicator size="large" color={config?.cor_primaria || '#e34040'} /></View>;
  }

  return (
    <View style={{ ...styles.container, backgroundColor: config.cor_secundaria || '#f9f9f9' }}>
      <StatusBar barStyle="dark-content" />

      
      <Image
        source={{
          uri: config.logo_url,
          headers: { 'ngrok-skip-browser-warning': 'true' } // <<< O SEGREDO ESTÁ AQUI
        }}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.welcomeText}>
        Bem-vindo à
      </Text>
      <Text style={styles.restaurantName}>
        {config.nome_fantasia}
      </Text>

      <Text style={styles.tableText}>
        Você está na Mesa <Text style={styles.tableNumber}>{mesaNumero || '?'}</Text>
      </Text>

      <Link href="/menu" asChild>
        <TouchableOpacity
          style={{ ...styles.button, backgroundColor: config.cor_primaria || '#e34040' }}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>VER CARDÁPIO E FAZER PEDIDO</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  logo: { width: 150, height: 150, marginBottom: 30 },
  welcomeText: { fontSize: 24, color: '#333' },
  restaurantName: { fontSize: 32, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 40 },
  tableText: { fontSize: 20, color: '#555' },
  tableNumber: { fontWeight: 'bold', fontSize: 22 },
  button: { marginTop: 60, paddingVertical: 20, paddingHorizontal: 40, borderRadius: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.30, shadowRadius: 4.65, elevation: 8 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});