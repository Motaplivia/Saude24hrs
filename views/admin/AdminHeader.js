// View: AdminHeader
// Header do sistema administrativo

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const AdminHeader = ({ user, currentRoute, onMenuPress }) => {
  const initials = user?.initials || user?.getInitials?.() || 'CM';

  const getTitle = () => {
    const titles = {
      'admin-inicio': 'Sistema Hospitalar',
      'admin-dados-hospital': 'Dados do Hospital',
      'admin-gestao-medicos': 'Gestão de Médicos',
      'admin-gestao-enfermarias': 'Enfermaria e Camas',
      'admin-gestao-pacientes': 'Gestão de Pacientes',
      'admin-gestao-leitos': 'Gestão dos Leitos',
    };
    return titles[currentRoute] || 'Sistema Hospitalar';
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity 
        onPress={onMenuPress} 
        style={styles.menuButton}
        activeOpacity={0.7}
      >
        <Text style={styles.menuIcon}>☰</Text>
      </TouchableOpacity>
      <Text style={styles.title}>{getTitle()}</Text>
      <View style={styles.spacer} />
      <View style={styles.userAvatar}>
        <Text style={styles.userAvatarText}>{initials}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 45,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuButton: {
    padding: 5,
    marginRight: 10,
  },
  menuIcon: {
    fontSize: 24,
    color: '#000',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  spacer: {
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
});

export default AdminHeader;



