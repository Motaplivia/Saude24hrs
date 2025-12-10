// View: ValidarPacientesView
// Tela de Validar Pacientes

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const ValidarPacientesView = ({ validationController, patientController, diaryController, onApprove, onReject }) => {
  const [pendingValidations, setPendingValidations] = useState([]);
  const [selectedValidation, setSelectedValidation] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [patientDiaries, setPatientDiaries] = useState([]);
  const [patientHistory, setPatientHistory] = useState([]);

  useEffect(() => {
    loadValidations();
  }, []);

  const loadValidations = () => {
    const validations = validationController.getPendingValidations();
    setPendingValidations(validations);
  };

  const handleApprove = (validationId) => {
    if (onApprove) {
      onApprove(validationId);
    }
    validationController.approveValidation(validationId);
    loadValidations();
  };

  const handleReject = (validationId) => {
    if (onReject) {
      onReject(validationId);
    }
    validationController.rejectValidation(validationId);
    loadValidations();
  };

  const handleViewHistory = (validation) => {
    setSelectedValidation(validation);
    
    // Carrega dados do paciente
    if (patientController && validation.patientId) {
      const patient = patientController.getPatientById(validation.patientId);
      setPatientData(patient);
      
      // Carrega diários do paciente
      if (diaryController) {
        const diaries = diaryController.getDiariesByPatientId(validation.patientId);
        setPatientDiaries(diaries ? diaries.sort((a, b) => new Date(b.date) - new Date(a.date)) : []);
      }
      
      // Carrega histórico de validações/encaminhamentos
      if (validationController) {
        const history = validationController.getValidationByPatientId(validation.patientId);
        setPatientHistory(history || []);
      }
    }
    
    setShowHistoryModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.mainCard}>
        <Text style={styles.title}>Validar Registos de Pacientes</Text>
        <Text style={styles.subtitle}>
          Aprove ou rejeite novos registos de pacientes
        </Text>

        {pendingValidations.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Não há registos pendentes de validação</Text>
          </View>
        ) : (
          <View style={styles.validationsList}>
            {pendingValidations.map((validation) => (
              <View key={validation.id} style={styles.validationCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.patientName}>{validation.patientName}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Pendente</Text>
                  </View>
                </View>

                <View style={styles.cardDetails}>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="local-hospital" size={16} color="#566246" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Serviço Anterior</Text>
                      <Text style={styles.detailValue}>{validation.previousService || 'N/A'}</Text>
                    </View>
                  </View>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="arrow-forward" size={16} color="#566246" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Novo Serviço</Text>
                      <Text style={styles.detailValue}>{validation.newService || validation.specialty}</Text>
                    </View>
                  </View>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="badge" size={16} color="#566246" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Nº Utente</Text>
                      <Text style={styles.detailValue}>{validation.userNumber}</Text>
                    </View>
                  </View>
                  {validation.reason && (
                    <View style={styles.detailRow}>
                      <MaterialIcons name="note" size={16} color="#566246" />
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Motivo do Encaminhamento</Text>
                        <Text style={styles.detailValue}>{validation.reason}</Text>
                      </View>
                    </View>
                  )}
                </View>

                <View style={styles.requestDateSection}>
                  <Text style={styles.requestDateLabel}>Data do Pedido</Text>
                  <Text style={styles.requestDateValue}>
                    {validation.formattedRequestDate}
                  </Text>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.viewHistoryButton}
                    onPress={() => handleViewHistory(validation)}
                  >
                    <MaterialIcons name="history" size={18} color="#566246" />
                    <Text style={styles.viewHistoryButtonText}>Ver Histórico</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.approveButton}
                    onPress={() => handleApprove(validation.id)}
                  >
                    <Text style={styles.approveButtonText}>Aprovar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => handleReject(validation.id)}
                  >
                    <Text style={styles.rejectButtonText}>Rejeitar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Modal de Histórico do Paciente */}
      <Modal
        visible={showHistoryModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowHistoryModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Histórico Completo do Paciente</Text>
            <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
              <MaterialIcons name="close" size={24} color="#566246" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {selectedValidation && patientData && (
              <>
                {/* Informações do Paciente */}
                <View style={styles.historySection}>
                  <Text style={styles.historySectionTitle}>
                    <MaterialIcons name="person" size={18} color="#566246" /> Informações do Paciente
                  </Text>
                  <View style={styles.historyInfoGrid}>
                    <View style={styles.historyInfoItem}>
                      <Text style={styles.historyInfoLabel}>Nome</Text>
                      <Text style={styles.historyInfoValue}>{patientData.name}</Text>
                    </View>
                    <View style={styles.historyInfoItem}>
                      <Text style={styles.historyInfoLabel}>Nº Utente</Text>
                      <Text style={styles.historyInfoValue}>{patientData.userNumber || 'N/A'}</Text>
                    </View>
                    <View style={styles.historyInfoItem}>
                      <Text style={styles.historyInfoLabel}>Data de Admissão</Text>
                      <Text style={styles.historyInfoValue}>{formatDate(patientData.admissionDate)}</Text>
                    </View>
                    <View style={styles.historyInfoItem}>
                      <Text style={styles.historyInfoLabel}>Diagnóstico</Text>
                      <Text style={styles.historyInfoValue}>{patientData.diagnosis || 'N/A'}</Text>
                    </View>
                    <View style={styles.historyInfoItem}>
                      <Text style={styles.historyInfoLabel}>Serviço Atual</Text>
                      <Text style={styles.historyInfoValue}>{patientData.service || 'N/A'}</Text>
                    </View>
                    <View style={styles.historyInfoItem}>
                      <Text style={styles.historyInfoLabel}>Localização</Text>
                      <Text style={styles.historyInfoValue}>{patientData.location || 'N/A'}</Text>
                    </View>
                  </View>
                </View>

                {/* Histórico de Encaminhamentos */}
                {patientHistory.length > 0 && (
                  <View style={styles.historySection}>
                    <Text style={styles.historySectionTitle}>
                      <MaterialIcons name="swap-horiz" size={18} color="#566246" /> Histórico de Encaminhamentos
                    </Text>
                    {patientHistory.map((hist, index) => (
                      <View key={hist.id} style={styles.historyItem}>
                        <View style={styles.historyItemHeader}>
                          <Text style={styles.historyItemDate}>{formatDate(hist.requestDate)}</Text>
                          <View style={[
                            styles.historyStatusBadge,
                            hist.status === 'aprovado' ? styles.statusApproved : 
                            hist.status === 'rejeitado' ? styles.statusRejected : styles.statusPending
                          ]}>
                            <Text style={styles.historyStatusText}>
                              {hist.status === 'aprovado' ? 'Aprovado' : 
                               hist.status === 'rejeitado' ? 'Rejeitado' : 'Pendente'}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.historyItemContent}>
                          <Text style={styles.historyItemText}>
                            <Text style={styles.historyItemBold}>De:</Text> {hist.previousService || 'N/A'}
                          </Text>
                          <Text style={styles.historyItemText}>
                            <Text style={styles.historyItemBold}>Para:</Text> {hist.newService || hist.specialty}
                          </Text>
                          {hist.reason && (
                            <Text style={styles.historyItemText}>
                              <Text style={styles.historyItemBold}>Motivo:</Text> {hist.reason}
                            </Text>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* Diário Médico */}
                {patientDiaries.length > 0 && (
                  <View style={styles.historySection}>
                    <Text style={styles.historySectionTitle}>
                      <MaterialIcons name="book" size={18} color="#566246" /> Diário Médico ({patientDiaries.length} registros)
                    </Text>
                    {patientDiaries.slice(0, 5).map((diary) => (
                      <View key={diary.id} style={styles.diaryEntry}>
                        <Text style={styles.diaryDate}>{formatDate(diary.date)}</Text>
                        <View style={styles.diaryVitals}>
                          <Text style={styles.diaryVitalText}>Temp: {diary.temperature}°C</Text>
                          <Text style={styles.diaryVitalText}>FC: {diary.heartRate} bpm</Text>
                          <Text style={styles.diaryVitalText}>PA: {diary.systolicBP}/{diary.diastolicBP}</Text>
                          <Text style={styles.diaryVitalText}>SpO2: {diary.spO2}%</Text>
                        </View>
                        {diary.observations && (
                          <Text style={styles.diaryObservations}>{diary.observations}</Text>
                        )}
                      </View>
                    ))}
                    {patientDiaries.length > 5 && (
                      <Text style={styles.moreDiariesText}>
                        +{patientDiaries.length - 5} registros anteriores
                      </Text>
                    )}
                  </View>
                )}

                {/* Botões de Ação */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalApproveButton}
                    onPress={() => {
                      handleApprove(selectedValidation.id);
                      setShowHistoryModal(false);
                    }}
                  >
                    <Text style={styles.modalApproveButtonText}>Aprovar Encaminhamento</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalRejectButton}
                    onPress={() => {
                      handleReject(selectedValidation.id);
                      setShowHistoryModal(false);
                    }}
                  >
                    <Text style={styles.modalRejectButtonText}>Rejeitar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F2EB',
  },
  mainCard: {
    backgroundColor: '#ffffff',
    borderRadius: 0,
    padding: 20,
    margin: 0,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#566246',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#4A4A48',
    marginBottom: 25,
  },
  validationsList: {
    gap: 15,
  },
  validationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#D8DAD3',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  patientName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#566246',
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#A4C2A5',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginLeft: 10,
  },
  statusText: {
    color: '#566246',
    fontSize: 12,
    fontWeight: '600',
  },
  cardDetails: {
    marginBottom: 15,
  },
  detailText: {
    fontSize: 14,
    color: '#4A4A48',
    marginBottom: 4,
  },
  requestDateSection: {
    marginBottom: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#D8DAD3',
  },
  requestDateLabel: {
    fontSize: 14,
    color: '#4A4A48',
    marginBottom: 5,
    fontWeight: '600',
  },
  requestDateValue: {
    fontSize: 14,
    color: '#566246',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#566246',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  approveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#f44336',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#4A4A48',
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 10,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#4A4A48',
    marginBottom: 4,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#566246',
    fontWeight: '600',
  },
  viewHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F2EB',
    borderRadius: 10,
    paddingVertical: 12,
    gap: 8,
    marginBottom: 10,
  },
  viewHistoryButtonText: {
    color: '#566246',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F1F2EB',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#D8DAD3',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#566246',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  historySection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D8DAD3',
  },
  historySectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#566246',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyInfoGrid: {
    gap: 12,
  },
  historyInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F2EB',
  },
  historyInfoLabel: {
    fontSize: 14,
    color: '#4A4A48',
    fontWeight: '500',
  },
  historyInfoValue: {
    fontSize: 14,
    color: '#566246',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  historyItem: {
    backgroundColor: '#F1F2EB',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyItemDate: {
    fontSize: 13,
    color: '#4A4A48',
    fontWeight: '600',
  },
  historyStatusBadge: {
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  statusApproved: {
    backgroundColor: '#A4C2A5',
  },
  statusRejected: {
    backgroundColor: '#f44336',
  },
  statusPending: {
    backgroundColor: '#D8DAD3',
  },
  historyStatusText: {
    color: '#566246',
    fontSize: 11,
    fontWeight: '600',
  },
  historyItemContent: {
    gap: 6,
  },
  historyItemText: {
    fontSize: 13,
    color: '#4A4A48',
  },
  historyItemBold: {
    fontWeight: '700',
    color: '#566246',
  },
  diaryEntry: {
    backgroundColor: '#F1F2EB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  diaryDate: {
    fontSize: 13,
    fontWeight: '700',
    color: '#566246',
    marginBottom: 8,
  },
  diaryVitals: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  diaryVitalText: {
    fontSize: 12,
    color: '#4A4A48',
  },
  diaryObservations: {
    fontSize: 12,
    color: '#4A4A48',
    marginTop: 8,
    fontStyle: 'italic',
  },
  moreDiariesText: {
    fontSize: 12,
    color: '#4A4A48',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#D8DAD3',
  },
  modalApproveButton: {
    flex: 1,
    backgroundColor: '#566246',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalApproveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalRejectButton: {
    flex: 1,
    backgroundColor: '#f44336',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalRejectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ValidarPacientesView;

