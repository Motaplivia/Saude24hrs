// View: PatientHomeView
// Tela inicial (home) do paciente

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const PatientHomeView = ({ patient, onNavigate }) => {
  const patientName = patient?.name || 'Maria de Fátima';
  const patientId = patient?.userNumber || patient?.id?.toString() || '136461477';
  const initials =
    patient?.initials ||
    (patient?.name
      ? patient.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
      : 'MF');

  const mainActions = [
    { id: 'teleconsulta', label: 'Teleconsulta', icon: 'headset', route: 'patient-messages' },
    { id: 'receitas', label: 'Receitas', icon: 'description', route: 'patient-prescriptions' },
    { id: 'exames', label: 'Exames', icon: 'assessment', route: 'patient-exams' },
    { id: 'saude-oral', label: 'Saúde oral', icon: 'medical-services', route: 'patient-screenings' },
    { id: 'consultas', label: 'Marcar consulta', icon: 'event', route: 'patient-screenings' },
    { id: 'favoritos', label: 'Favoritos', icon: 'settings', route: 'patient-screenings' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Card principal verde */}
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroName}>{patientName}</Text>
            <Text style={styles.heroId}>N.º de utente: {patientId}</Text>
            <Text style={styles.heroUnit}>Unidade de saúde</Text>
            <Text style={styles.heroStatus}>Sem inscrição</Text>
          </View>
        </View>
      </View>

      {/* Grid de ícones */}
      <View style={styles.actionsGrid}>
        {mainActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.actionIconCard}
            onPress={() => onNavigate && onNavigate(action.route)}
            activeOpacity={0.75}
          >
            <View style={styles.actionIconContainer}>
              <MaterialIcons name={action.icon} size={30} color="#566246" />
            </View>
            <Text style={styles.actionIconLabel} numberOfLines={2}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Próximos eventos / card simples */}
      <View style={styles.eventsCard}>
        <View style={styles.eventsHeader}>
          <Text style={styles.eventsTitle}>Próximos eventos (0)</Text>
          <TouchableOpacity onPress={() => onNavigate && onNavigate('patient-history')}>
            <Text style={styles.eventsLink}>Ver tudo</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.eventsEmpty}>Nenhum evento agendado.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F2EB' },
  heroCard: {
    backgroundColor: '#566246',
    borderRadius: 20,
    padding: 20,
    margin: 16,
  },
  heroHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#A4C2A5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#566246', fontWeight: '700', fontSize: 18 },
  heroName: { fontSize: 22, fontWeight: '800', color: '#fff' },
  heroId: { color: '#F1F2EB', marginTop: 4 },
  heroUnit: { color: '#D8DAD3', marginTop: 12, fontSize: 13 },
  heroStatus: { color: '#ffffff', fontWeight: '700', fontSize: 16, marginTop: 2 },

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  actionIconCard: { width: '30%', alignItems: 'center', marginBottom: 18 },
  actionIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#A4C2A5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionIcon: { fontSize: 30 },
  actionIconLabel: { fontSize: 14, fontWeight: '600', color: '#566246', textAlign: 'center' },

  eventsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    margin: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D8DAD3',
  },
  eventsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eventsTitle: { fontSize: 16, fontWeight: '700', color: '#4A4A48' },
  eventsLink: { fontSize: 14, color: '#566246', fontWeight: '600' },
  eventsEmpty: { marginTop: 10, color: '#4A4A48', fontSize: 14 },
});

export default PatientHomeView;



