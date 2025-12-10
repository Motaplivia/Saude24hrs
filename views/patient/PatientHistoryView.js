// View: PatientHistoryView
// Tela de Histórico de Internamento do Paciente

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const PatientHistoryView = ({ patient }) => {
  const internments = [
    {
      id: 1,
      startDate: '10 Jan',
      endDate: '15 Jan',
      year: '2025',
      hospital: 'Centro Hospitalar Lisboa',
      diagnosis: 'Pneumonia',
    },
    {
      id: 2,
      startDate: '22 Nov',
      endDate: '27 Nov',
      year: '2019',
      hospital: 'Hospital São João',
      diagnosis: 'Insuficiência Renal',
    },
    {
      id: 3,
      startDate: '05 Aug',
      endDate: '10 Aug',
      year: '2015',
      hospital: 'Hospital Santa Maria',
      diagnosis: 'Diabetes',
    },
    {
      id: 4,
      startDate: '12 Mar',
      endDate: '18 Mar',
      year: '2013',
      hospital: 'Hospital Dr. Francisco Gentil',
      diagnosis: 'Asma',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {internments.map((internment) => (
          <View key={internment.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.dateRange}>
                {internment.startDate} - {internment.endDate}
              </Text>
              <Text style={styles.year}>{internment.year}</Text>
            </View>
            <Text style={styles.hospital}>{internment.hospital}</Text>
            <Text style={styles.diagnosis}>
              Diagnóstico: {internment.diagnosis}
            </Text>
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
  card: {
    backgroundColor: '#c8e6c9',
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateRange: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  year: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  hospital: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  diagnosis: {
    fontSize: 16,
    color: '#000',
  },
});

export default PatientHistoryView;

