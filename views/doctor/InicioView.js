// View: InicioView
// Tela inicial (home) do médico – versão minimalista inspirada no layout verde

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const InicioView = ({ user, patientController, messageController, doctorController, validationController, onNavigate }) => {
  const [doctorData, setDoctorData] = useState(null);
  const [stats, setStats] = useState({
    activePatientsCount: 0,
    totalInternments: 0,
    pendingValidationCount: 0,
    eligibleForDischargeCount: 0,
  });
  const [pendingMessagesCount, setPendingMessagesCount] = useState(0);
  const [nextAppointment, setNextAppointment] = useState(null);

  // Busca dados do médico no banco de dados
  useEffect(() => {
    const loadDoctorData = async () => {
      if (doctorController && user?.email) {
        await doctorController.ensureLoaded();
        const doctor = doctorController.getDoctorByEmail(user.email);
        if (doctor) {
          setDoctorData(doctor);
        }
      }
    };
    loadDoctorData();
  }, [doctorController, user?.email]);

  // Carrega estatísticas dinâmicas do banco de dados
  useEffect(() => {
    const loadStats = () => {
      if (patientController) {
        const dashboardStats = patientController.getDashboardStats();
        if (dashboardStats) {
          setStats(dashboardStats);
        }
      }

      // Carrega validações pendentes do validationController
      if (validationController) {
        const pendingValidations = validationController.getPendingValidations();
        if (pendingValidations) {
          setStats(prevStats => ({
            ...prevStats,
            pendingValidationCount: pendingValidations.length,
          }));
        }
      }

      // Carrega mensagens pendentes
      if (messageController) {
        const pendingMessages = messageController.getPendingMessages();
        setPendingMessagesCount(pendingMessages ? pendingMessages.length : 0);
      }

      // Carrega próximo atendimento
      if (patientController && user?.id) {
        const upcomingAppointments = patientController.getUpcomingAppointments(user.id);
        setNextAppointment(upcomingAppointments && upcomingAppointments.length > 0 ? upcomingAppointments[0] : null);
      }
    };

    loadStats();
    // Recarrega estatísticas a cada 30 segundos para manter dados atualizados
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [patientController, messageController, validationController, user?.id]);

  const userName = doctorData?.name || user?.name || 'Dr. Marcos Sousa';
  const doctorSpecialty = doctorData?.specialty || '';

  const todayLabel = (() => {
    const now = new Date();
    try {
      return now
        .toLocaleDateString('pt-PT', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
        })
        .replace(/^\w/, (c) => c.toUpperCase());
    } catch {
      return 'Hoje';
    }
  })();

  const mainActions = [
    { id: 'agenda', label: 'Agenda', icon: 'event', route: 'gestao-pacientes' },
    { id: 'pacientes', label: 'Pacientes', icon: 'people', route: 'gestao-pacientes', badge: stats.activePatientsCount > 0 ? stats.activePatientsCount : null },
    { id: 'mensagens', label: 'Mensagens', icon: 'message', route: 'mensagens', badge: pendingMessagesCount > 0 ? pendingMessagesCount : null },
    { id: 'validacoes', label: 'Validações', icon: 'assignment', route: 'validar-pacientes', badge: stats.pendingValidationCount > 0 ? stats.pendingValidationCount : null },
    { id: 'internacoes', label: 'Internações', icon: 'local-hospital', route: 'gestao-pacientes', badge: stats.totalInternments > 0 ? stats.totalInternments : null },
    { id: 'altas', label: 'Altas', icon: 'check-circle', route: 'dar-alta', badge: stats.eligibleForDischargeCount > 0 ? stats.eligibleForDischargeCount : null },
  ];

  const handleNavigate = (route) => {
    if (onNavigate && route) onNavigate(route);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Card principal verde */}
        <View style={styles.heroCard}>
          <Text style={styles.heroName}>{userName}</Text>
          <Text style={styles.heroRole}>{doctorSpecialty || 'Médico responsável'}</Text>
          <Text style={styles.heroDate}>{todayLabel}</Text>
          <View style={styles.heroStats}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{stats.activePatientsCount}</Text>
              <Text style={styles.heroStatLabel}>Pacientes</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{pendingMessagesCount}</Text>
              <Text style={styles.heroStatLabel}>Mensagens</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{stats.pendingValidationCount}</Text>
              <Text style={styles.heroStatLabel}>Pendências</Text>
            </View>
          </View>
        </View>

        {/* Grid de ações */}
        <View style={styles.actionsGrid}>
          {mainActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionIconCard}
              onPress={() => handleNavigate(action.route)}
              activeOpacity={0.75}
            >
              <View style={styles.actionIconContainer}>
                <MaterialIcons name={action.icon} size={28} color="#566246" />
                {action.badge ? (
                  <View style={styles.actionBadge}>
                    <Text style={styles.actionBadgeText}>{action.badge}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.actionIconLabel} numberOfLines={2}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Próximo atendimento / pendências compactas */}
        {(nextAppointment || pendingMessagesCount > 0 || stats.pendingValidationCount > 0) && (
          <View style={styles.eventsCard}>
            <View style={styles.eventsHeader}>
              <Text style={styles.eventsTitle}>Hoje</Text>
              <TouchableOpacity onPress={() => handleNavigate('gestao-pacientes')}>
                <Text style={styles.eventsLink}>Ver tudo</Text>
              </TouchableOpacity>
            </View>
            {nextAppointment ? (
              <TouchableOpacity
                style={styles.eventItem}
                onPress={() => handleNavigate('gestao-pacientes')}
              >
                <Text style={styles.eventItemTitle}>Próximo atendimento</Text>
                <Text style={styles.eventItemText}>
                  {nextAppointment.patientName} · {nextAppointment.service || 'Serviço'} ·{' '}
                  {new Date(nextAppointment.startTime || '').toLocaleTimeString('pt-PT', {
                    hour: '2-digit',
                    minute: '2-digit',
                  }) || '--:--'}
                </Text>
              </TouchableOpacity>
            ) : null}

            {pendingMessagesCount > 0 && (
              <TouchableOpacity
                style={styles.eventItem}
                onPress={() => handleNavigate('mensagens')}
              >
                <Text style={styles.eventItemTitle}>Mensagens pendentes</Text>
                <Text style={styles.eventItemText}>
                  {pendingMessagesCount} aguardando resposta
                </Text>
              </TouchableOpacity>
            )}

            {stats.pendingValidationCount > 0 && (
              <TouchableOpacity
                style={styles.eventItem}
                onPress={() => handleNavigate('validar-pacientes')}
              >
                <Text style={styles.eventItemTitle}>Validações</Text>
                <Text style={styles.eventItemText}>
                  {stats.pendingValidationCount} registro(s) para validar
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F2EB' },
  content: { padding: 16, gap: 16 },
  heroCard: {
    backgroundColor: '#566246',
    borderRadius: 20,
    padding: 24,
  },
  heroName: { fontSize: 24, fontWeight: '700', color: '#fff' },
  heroRole: { fontSize: 15, color: '#F1F2EB', marginTop: 4 },
  heroDate: { fontSize: 14, color: '#F1F2EB', opacity: 0.85, marginTop: 6 },
  heroStats: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  heroStatItem: { flex: 1, alignItems: 'center' },
  heroStatDivider: { width: 1, height: 26, backgroundColor: '#ffffff', opacity: 0.25, marginHorizontal: 10 },
  heroStatValue: { fontSize: 24, fontWeight: '700', color: '#fff' },
  heroStatLabel: { fontSize: 12, color: '#F1F2EB', opacity: 0.9 },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionIconCard: { width: '30%', alignItems: 'center', marginBottom: 12 },
  actionIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#A4C2A5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  actionIcon: { fontSize: 28 },
  actionBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#f44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  actionBadgeText: { color: '#ffffff', fontSize: 11, fontWeight: '700' },
  actionIconLabel: { fontSize: 12, color: '#566246', fontWeight: '600', textAlign: 'center' },
  eventsCard: { backgroundColor: '#ffffff', borderRadius: 0, padding: 16, borderWidth: 0, borderColor: 'transparent' },
  eventsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  eventsTitle: { fontSize: 16, fontWeight: '700', color: '#4A4A48' },
  eventsLink: { fontSize: 14, color: '#566246', fontWeight: '600' },
  eventItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#D8DAD3' },
  eventItemTitle: { fontSize: 14, fontWeight: '700', color: '#4A4A48' },
  eventItemText: { fontSize: 14, color: '#4A4A48', marginTop: 2 },
});

export default InicioView;

