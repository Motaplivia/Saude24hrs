// View: AdminHomeView
// Tela inicial do administrador

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const AdminHomeView = ({
  user,
  onNavigate,
  patientController,
  messageController,
  validationController,
  dischargeController,
  diaryController,
  reportController,
  doctorController,
  wardController,
}) => {
  const { header, heroAttentionCount, activePatients, activeDoctors, pendingValidations, pendingMessages } = useMemo(() => {
    const administratorName = user?.name || 'Administrador';

    const allPatients = patientController?.getAllPatients?.() || [];
    const activePatientsList = allPatients.filter(patient => patient.status === 'ativo');

    const pendingValidationsList = validationController?.getPendingValidations?.() || [];
    const pendingMessagesList = messageController?.getPendingMessages?.() || [];

    const allDoctors = doctorController?.getAllDoctors?.() || [];
    const activeDoctorsList = allDoctors.filter(doctor => doctor.status === 'Ativo');

    return {
      header: {
        administratorName,
      },
      heroAttentionCount: (pendingValidationsList.length || 0) + (pendingMessagesList.length || 0),
      activePatients: activePatientsList,
      activeDoctors: activeDoctorsList,
      pendingValidations: pendingValidationsList,
      pendingMessages: pendingMessagesList,
    };
  }, [user, patientController, messageController, validationController, doctorController]);

  const handleNavigate = (route) => {
    if (route && onNavigate) {
      onNavigate(route);
    }
  };

  // Ações principais em grid de 6 (2x3)
  const mainActions = [
    {
      id: 'action-patients',
      label: 'Gestão de Pacientes',
      icon: 'people',
      route: 'admin-gestao-pacientes',
    },
    {
      id: 'action-doctors',
      label: 'Gestão de Médicos',
      icon: 'medical-services',
      route: 'admin-gestao-medicos',
    },
    {
      id: 'action-wards',
      label: 'Enfermarias',
      icon: 'hotel',
      route: 'admin-gestao-enfermarias',
    },
    {
      id: 'action-hospital-data',
      label: 'Dados Hospitalares',
      icon: 'business',
      route: 'admin-dados-hospital',
    },
    {
      id: 'action-validations',
      label: 'Validações',
      icon: 'check-circle',
      route: 'admin-gestao-pacientes',
      badge: pendingValidations?.length > 0 ? pendingValidations.length : null,
    },
    {
      id: 'action-messages',
      label: 'Mensagens',
      icon: 'message',
      route: 'admin-gestao-medicos',
      badge: pendingMessages?.length > 0 ? pendingMessages.length : null,
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Card principal verde com informações do admin */}
        <View style={styles.heroCard}>
          <Text style={styles.heroName}>{header.administratorName}</Text>
          <Text style={styles.heroRole}>Administrador</Text>
          <View style={styles.heroStats}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{activePatients?.length || 0}</Text>
              <Text style={styles.heroStatLabel}>Pacientes</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{activeDoctors?.length || 0}</Text>
              <Text style={styles.heroStatLabel}>Médicos</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{heroAttentionCount || 0}</Text>
              <Text style={styles.heroStatLabel}>Pendências</Text>
            </View>
          </View>
        </View>

        {/* Grid de ações rápidas - 2 linhas de 3 */}
        <View style={styles.actionsGrid}>
          {mainActions.map(action => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionIconCard}
              onPress={() => handleNavigate(action.route)}
              activeOpacity={0.7}
            >
              <View style={styles.actionIconContainer}>
                <MaterialIcons name={action.icon} size={28} color="#566246" />
                {action.badge && action.badge > 0 && (
                  <View style={styles.actionBadge}>
                    <Text style={styles.actionBadgeText}>{action.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.actionIconLabel} numberOfLines={2}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Seção compacta de eventos/pendências */}
        {((pendingValidations?.length || 0) > 0 || (pendingMessages?.length || 0) > 0) && (
          <View style={styles.eventsCard}>
            <View style={styles.eventsHeader}>
              <Text style={styles.eventsTitle}>
                Pendências ({heroAttentionCount || 0})
              </Text>
              <TouchableOpacity onPress={() => handleNavigate('admin-gestao-pacientes')}>
                <Text style={styles.eventsLink}>Ver tudo</Text>
              </TouchableOpacity>
            </View>
            {(pendingValidations?.length || 0) > 0 && (
              <TouchableOpacity
                style={styles.eventItem}
                onPress={() => handleNavigate('admin-gestao-pacientes')}
              >
                <Text style={styles.eventItemText}>
                  {pendingValidations.length} validação{pendingValidations.length > 1 ? 'ões' : ''} pendente{pendingValidations.length > 1 ? 's' : ''}
                </Text>
              </TouchableOpacity>
            )}
            {(pendingMessages?.length || 0) > 0 && (
              <TouchableOpacity
                style={styles.eventItem}
                onPress={() => handleNavigate('admin-gestao-medicos')}
              >
                <Text style={styles.eventItemText}>
                  {pendingMessages.length} mensagem{pendingMessages.length > 1 ? 'ens' : ''} não respondida{pendingMessages.length > 1 ? 's' : ''}
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
  container: {
    flex: 1,
    backgroundColor: '#F1F2EB',
  },
  content: {
    padding: 16,
    gap: 20,
  },
  // Card principal verde (inspirado na imagem)
  heroCard: {
    backgroundColor: '#566246',
    borderRadius: 20,
    padding: 24,
    marginBottom: 8,
  },
  heroName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  heroRole: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 20,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  heroStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#ffffff',
    opacity: 0.3,
    marginHorizontal: 12,
  },
  heroStatValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  heroStatLabel: {
    fontSize: 13,
    color: '#ffffff',
    opacity: 0.85,
  },
  // Grid de ações (2 linhas de 3 ícones)
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 4,
  },
  actionIconCard: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 16,
  },
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
  actionIcon: {
    fontSize: 28,
  },
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
  actionBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  actionIconLabel: {
    fontSize: 12,
    color: '#566246',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  // Seção de eventos/pendências compacta
  eventsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#D8DAD3',
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A4A48',
  },
  eventsLink: {
    fontSize: 14,
    color: '#566246',
    fontWeight: '600',
  },
  eventItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D8DAD3',
  },
  eventItemText: {
    fontSize: 14,
    color: '#4A4A48',
  },
  // Estilos antigos removidos - mantidos apenas para compatibilidade se necessário
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A4A48',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 13,
    color: '#566246',
  },
});

export default AdminHomeView;

