// View: PatientPrescriptionsView
// Tela de Receitas e Medicamentos do Paciente

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const PatientPrescriptionsView = ({ patient }) => {
  const prescriptions = [
    {
      id: 1,
      medications: [
        'Atenolol, 50 mg - comprimido - 60 unidade',
        'Varfarina 5mg , Comprimido - 60 unidade',
      ],
    },
    {
      id: 2,
      medications: [
        'Brufen, 600 mg - comprimido - 60 unidade',
        'Buscopan 10mg , Comprimido - 20 unidade',
      ],
    },
  ];

  const exams = [
    {
      id: 1,
      type: 'Radiologia',
      requestDate: '27 mar 2025',
      prescribedBy: 'Susana Mendes',
      room: '120',
      status: 'Marcado',
      statusColor: '#d32f2f',
    },
    {
      id: 2,
      type: 'Ecocardiograma',
      requestDate: '27 mar 2025',
      prescribedBy: 'Susana Mendes',
      room: '120',
      status: 'Feito',
      statusColor: '#4caf50',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Receitas/Medicamentos Section */}
        <Text style={styles.sectionTitle}>Receitas/ Medicamentos</Text>
        {prescriptions.map((prescription) => (
          <View key={prescription.id} style={styles.prescriptionCard}>
            {prescription.medications.map((medication, index) => (
              <Text key={index} style={styles.medication}>
                {medication}
              </Text>
            ))}
            <TouchableOpacity style={styles.detailsButton}>
              <Text style={styles.detailsButtonText}>Detalhes</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Exames Section */}
        <Text style={styles.sectionTitle}>Exames</Text>
        {exams.map((exam) => (
          <View key={exam.id} style={styles.examCard}>
            <View style={styles.examHeader}>
              <Text style={styles.examType}>{exam.type}</Text>
              <View style={[styles.statusBadge, { backgroundColor: exam.statusColor }]}>
                <Text style={styles.statusText}>{exam.status}</Text>
              </View>
            </View>
            <Text style={styles.examDetail}>
              Data da requisição: {exam.requestDate}
            </Text>
            <Text style={styles.examDetail}>Prescrito: {exam.prescribedBy}</Text>
            <Text style={styles.examDetail}>Sala: {exam.room}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 15,
    marginTop: 10,
  },
  prescriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medication: {
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
  },
  detailsButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#4caf50',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  detailsButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  examCard: {
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  examHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  examType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  statusBadge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  examDetail: {
    fontSize: 14,
    color: '#000',
    marginBottom: 5,
  },
});

export default PatientPrescriptionsView;

