// View: Header
// Componente visual do cabeçalho

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const Header = ({ user, currentRoute, onMenuPress }) => {
  const initials = user?.initials || user?.getInitials?.() || '';

  const getTitle = () => {
    const titles = {
      'inicio': 'Início',
      'ficha-pessoal': 'Ficha Pessoal',
      'relatorio-internamento': 'Relatório de Internamento',
      'gestao-pacientes': 'Gestão de Pacientes',
      'entrada-paciente': 'Entrada de Paciente',
      'diario-paciente': 'Diário do Paciente',
      'dar-alta': 'Dar Alta',
      'mensagens': 'Mensagens',
      'validar-pacientes': 'Validar Pacientes',
    };
    return titles[currentRoute] || 'Sistema Hospitalar';
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
        <MaterialIcons name="menu" size={24} color="#566246" />
      </TouchableOpacity>
      <Text style={styles.title}>{getTitle()}</Text>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      </View>
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
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#D8DAD3',
  },
  menuButton: {
    padding: 5,
  },
  menuIcon: {
    fontSize: 24,
    color: '#566246',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#566246',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  avatarContainer: {
    marginRight: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#A4C2A5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#566246',
  },
});

export default Header;

