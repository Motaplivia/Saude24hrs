// View: PatientExamsView
// Tela de Exames do Paciente

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const PatientExamsView = ({ patient }) => {
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
    {
      id: 3,
      type: 'Análise de Sangue',
      requestDate: '15 mar 2025',
      prescribedBy: 'João Silva',
      room: '105',
      status: 'Feito',
      statusColor: '#4caf50',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
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

export default PatientExamsView;

