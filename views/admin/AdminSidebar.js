// View: AdminSidebar
// Sidebar de navegação do administrador (adaptado do menu de médico)

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const AdminSidebar = ({ user, menuItems = [], currentRoute, onNavigate, onLogout }) => {
  const initials = user?.initials || user?.getInitials?.() || 'CM';

  // Menu padrão caso menuItems esteja vazio
  const defaultMenuItems = [
    { id: 'admin-inicio', label: 'Início', route: 'admin-inicio', active: currentRoute === 'admin-inicio' },
    { id: 'admin-dados-hospital', label: 'Dados do Hospital', route: 'admin-dados-hospital', active: currentRoute === 'admin-dados-hospital' },
    { id: 'admin-gestao-medicos', label: 'Gestão de Médicos', route: 'admin-gestao-medicos', active: currentRoute === 'admin-gestao-medicos' },
    { id: 'admin-gestao-enfermarias', label: 'Gestão de Enfermarias', route: 'admin-gestao-enfermarias', active: currentRoute === 'admin-gestao-enfermarias' },
    { id: 'admin-gestao-pacientes', label: 'Gestão de Pacientes', route: 'admin-gestao-pacientes', active: currentRoute === 'admin-gestao-pacientes' },
    { id: 'admin-gestao-leitos', label: 'Gestão dos Leitos', route: 'admin-gestao-leitos', active: currentRoute === 'admin-gestao-leitos' },
  ];

  const itemsToRender = menuItems && menuItems.length > 0 ? menuItems : defaultMenuItems;

  return (
    <View style={styles.sidebar}>
      <ScrollView style={styles.scrollView}>
        {/* User Profile Section */}
        <View style={styles.userProfile}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{initials}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Administrador'}</Text>
            <Text style={styles.userEmail}>{user?.email || user?.role || 'Administrador Geral'}</Text>
          </View>
        </View>

        {/* Navigation Menu */}
        <View style={styles.menu}>
          {itemsToRender.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                (item.active || currentRoute === item.route) && styles.menuItemActive,
              ]}
              onPress={() => onNavigate(item.route)}
            >
              <Text
                style={[
                  styles.menuItemText,
                  (item.active || currentRoute === item.route) && styles.menuItemTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 280,
    height: '100%',
    backgroundColor: '#ffffff',
    borderRightWidth: 1,
    borderRightColor: '#D8DAD3',
  },
  scrollView: {
    flex: 1,
    paddingTop: 30,
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#A4C2A5',
    marginBottom: 10,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#566246',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#566246',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#4A4A48',
  },
  menu: {
    paddingHorizontal: 10,
    paddingTop: 25,
    paddingBottom: 10,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginVertical: 2,
    borderRadius: 8,
  },
  menuItemActive: {
    backgroundColor: '#A4C2A5',
  },
  menuItemText: {
    fontSize: 16,
    color: '#4A4A48',
  },
  menuItemTextActive: {
    fontWeight: '700',
    color: '#566246',
  },
  logoutButton: {
    marginTop: 10,
    marginHorizontal: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    color: '#f44336',
    fontWeight: '600',
  },
});

export default AdminSidebar;
