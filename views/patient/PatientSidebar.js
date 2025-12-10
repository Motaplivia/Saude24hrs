// View: PatientSidebar
// Sidebar de navegação do paciente

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const PatientSidebar = ({ patient, currentRoute, onNavigate, onClose }) => {
  const initials = patient?.initials || 'MF';
  const patientName = patient?.name || 'Maria de Fatima';
  const patientEmail = patient?.email || 'mariafatima@gmail.com';

  const menuItems = [
    { id: 1, label: 'Ficha pessoal', route: 'patient-profile' },
    { id: 2, label: 'Histórico de Internamento', route: 'patient-history' },
    { id: 3, label: 'Exames', route: 'patient-exams' },
    { id: 4, label: 'Recitas / Medicamentos', route: 'patient-prescriptions' },
    { id: 5, label: 'Mensagem', route: 'patient-messages' },
    { id: 6, label: 'Definições', route: 'patient-settings' },
  ];

  // Se a rota atual for 'patient-home', não destacar nenhum item
  const isActive = (route) => {
    if (currentRoute === 'patient-home') {
      return false;
    }
    return currentRoute === route;
  };

  const handleNavigate = (route) => {
    if (onNavigate) {
      onNavigate(route);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <View style={styles.sidebar}>
      <ScrollView style={styles.scrollView}>
        {/* User Profile Section */}
        <View style={styles.userProfile}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{initials}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{patientName}</Text>
            <Text style={styles.userEmail}>{patientEmail}</Text>
          </View>
        </View>

        {/* Navigation Menu */}
        <View style={styles.menu}>
          {menuItems.map((item) => {
            const active = isActive(item.route);
            const hasArrow = ['patient-prescriptions', 'patient-messages', 'patient-settings'].includes(item.route);
            
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuItem, active && styles.menuItemActive]}
                onPress={() => handleNavigate(item.route)}
              >
                <Text style={[styles.menuItemText, active && styles.menuItemTextActive]}>{item.label}</Text>
                {hasArrow && (
                  <View style={styles.arrowContainer}>
                    <Text style={styles.arrowIcon}>›</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>[←]</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: '#f5f5f5',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scrollView: {
    flex: 1,
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#4caf50',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#fff',
    textDecorationLine: 'underline',
  },
  menu: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginVertical: 2,
  },
  menuItemText: {
    fontSize: 16,
    color: '#000',
  },
  menuItemActive: {
    backgroundColor: '#e3f2fd',
  },
  menuItemTextActive: {
    fontWeight: '600',
    color: '#1976d2',
  },
  arrowContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  arrowIcon: {
    fontSize: 20,
    color: '#000',
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 15,
    alignItems: 'flex-start',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#000',
    fontWeight: 'bold',
  },
});

export default PatientSidebar;

