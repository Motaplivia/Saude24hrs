// View: PatientProfileView
// Tela de Ficha Pessoal do paciente

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const PatientProfileView = ({ patient, onNavigate }) => {
  const patientName = patient?.name || 'Maria de Fatima';
  const patientId = patient?.userNumber || patient?.id?.toString() || '4369325233';
  const initials = patient?.initials || (patient?.name ? patient.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'MF');
  const email = patient?.email || 'mariafatima@gmail.com';
  const phone = patient?.phone || '96342462';

  return (
    <ScrollView style={styles.container}>
      {/* Main Profile Card */}
      <View style={styles.profileCard}>
        {/* Profile Picture Section */}
        <View style={styles.profileImageContainer}>
          <View style={styles.profileImage}>
            <Text style={styles.profileImageText}>{initials}</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>
        </View>

        {/* Personal Details Section */}
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Nome</Text>
            <Text style={styles.detailValue}>{patientName}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Nacionalidade</Text>
            <Text style={styles.detailValue}>Portugues</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Naturalidade</Text>
            <Text style={styles.detailValue}>Bragança</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Morada</Text>
            <Text style={styles.detailValue}>Avenida Sá Carneiro 234</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Documento de identificação</Text>
            <Text style={styles.detailValue}>Cartão de Cidadão</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>N.º do documento</Text>
            <Text style={styles.detailValue}>dw7213242</Text>
          </View>
        </View>

        {/* Contacts Section */}
        <View style={styles.contactsSection}>
          <Text style={styles.contactsTitle}>Contactos</Text>
          <View style={styles.contactRow}>
            <Text style={styles.contactLabel}>Telemovél</Text>
            <Text style={styles.contactValue}>{phone}</Text>
          </View>
          <View style={styles.contactRow}>
            <Text style={styles.contactLabel}>Email</Text>
            <Text style={styles.contactValue}>{email}</Text>
          </View>
          <TouchableOpacity style={styles.contactsEditButton}>
            <Text style={styles.contactsEditButtonText}>Editar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImageText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#000',
  },
  editButton: {
    marginTop: 5,
  },
  editButtonText: {
    fontSize: 16,
    color: '#666',
  },
  detailsSection: {
    marginBottom: 20,
  },
  detailRow: {
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 16,
    color: '#666',
  },
  contactsSection: {
    backgroundColor: '#4caf50',
    borderRadius: 12,
    padding: 20,
    position: 'relative',
  },
  contactsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
  },
  contactRow: {
    marginBottom: 10,
  },
  contactLabel: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 3,
  },
  contactValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  contactsEditButton: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  contactsEditButtonText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
});

export default PatientProfileView;

