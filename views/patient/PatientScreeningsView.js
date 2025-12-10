// View: PatientScreeningsView
// Tela de Rastreios do Paciente

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const PatientScreeningsView = ({ patient }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Rastreios</Text>
        <Text style={styles.subtitle}>Rastreios e exames preventivos do paciente</Text>
        {/* Conteúdo será adicionado aqui */}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
});

export default PatientScreeningsView;


