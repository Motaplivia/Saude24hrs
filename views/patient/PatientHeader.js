// View: PatientHeader
// Header específico para as telas do paciente

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const PatientHeader = ({ onMenuPress, onProfilePress, onSwitchToDoctor, currentRoute }) => {
  const getTitle = () => {
    const titles = {
      'patient-home': '',
      'patient-profile': 'Ficha pessoal',
      'patient-history': 'Histórico de Internamento',
      'patient-exams': 'Exames',
      'patient-prescriptions': 'Receitas/ Medicamentos',
      'patient-messages': 'Mensagem',
      'patient-settings': 'Definições',
    };
    return titles[currentRoute] || '';
  };

  const title = getTitle();

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
        <Text style={styles.menuIcon}>☰</Text>
      </TouchableOpacity>
      {title ? <Text style={styles.title}>{title}</Text> : <View style={styles.spacer} />}
      {onSwitchToDoctor && (
        <TouchableOpacity onPress={onSwitchToDoctor} style={styles.switchButton}>
          <Text style={styles.switchButtonText}>Modo Médico</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={onProfilePress} style={styles.profileButton}>
        <Text style={styles.profileIcon}>👤</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuButton: {
    padding: 5,
  },
  menuIcon: {
    fontSize: 24,
    color: '#000',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginLeft: 10,
  },
  spacer: {
    flex: 1,
  },
  profileButton: {
    padding: 5,
  },
  profileIcon: {
    fontSize: 24,
    color: '#000',
  },
  switchButton: {
    marginRight: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#1976d2',
    borderRadius: 6,
  },
  switchButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
});

export default PatientHeader;

