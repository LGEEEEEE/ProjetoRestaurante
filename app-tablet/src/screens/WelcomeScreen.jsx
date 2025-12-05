// src/screens/WelcomeScreen.jsx

import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, StatusBar } from 'react-native';

// --- DADOS DE SIMULAÇÃO ---
// No futuro, estes dados virão da nossa API, baseados nas configurações
// que o gerente definiu no painel administrativo.
const restaurantConfig = {
    name: "Cantina do Zé",
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448609.png', // URL de um logo de exemplo
    tableNumber: 12,
    primaryColor: '#e34040',   // Cor primária que o gerente escolheu
    secondaryColor: '#f9f9f9', // Cor secundária que o gerente escolheu
};

function WelcomeScreen() {
  return (
    <View style={[styles.container, { backgroundColor: restaurantConfig.secondaryColor }]}>
      <StatusBar barStyle="dark-content" />

      <Image
        source={{ uri: restaurantConfig.logoUrl }}
        style={styles.logo}
      />

      <Text style={styles.welcomeText}>
        Bem-vindo à
      </Text>
      <Text style={styles.restaurantName}>
        {restaurantConfig.name}
      </Text>

      <Text style={styles.tableText}>
        Você está na Mesa <Text style={styles.tableNumber}>{restaurantConfig.tableNumber}</Text>
      </Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: restaurantConfig.primaryColor }]}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>VER CARDÁPIO E FAZER PEDIDO</Text>
      </TouchableOpacity>
    </View>
  );
}

// Estilos dos componentes. É como o CSS, mas para React Native.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 30,
    resizeMode: 'contain',
  },
  welcomeText: {
    fontSize: 24,
    color: '#333',
  },
  restaurantName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 40,
  },
  tableText: {
    fontSize: 20,
    color: '#555',
  },
  tableNumber: {
    fontWeight: 'bold',
    fontSize: 22,
  },
  button: {
    marginTop: 60,
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WelcomeScreen;