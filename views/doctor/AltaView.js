// View: AltaView
// Tela de Dar Alta

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const AltaView = ({ dischargeController, patientController, diaryController, onDischarge }) => {
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [dischargeNote, setDischargeNote] = useState('');
  const [patientData, setPatientData] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const loadPatients = async () => {
      if (!patientController) return;
      if (patientController.ensureLoaded) {
        await patientController.ensureLoaded();
      }
      setPatients(patientController.getAllPatients());
    };
    loadPatients();
  }, [patientController]);

  // Obtém apenas pacientes internados (ativos)
  const activePatients = useMemo(() => {
    return patients.filter(p => p.status === 'ativo');
  }, [patients]);

  useEffect(() => {
    if (selectedPatientId && dischargeController) {
      const data = dischargeController.getPatientDischargeData(selectedPatientId);
      setPatientData(data);
    } else {
      setPatientData(null);
    }
  }, [selectedPatientId, dischargeController]);

  const handleSubmit = async () => {
    if (!selectedPatientId) {
      Alert.alert('Erro', 'Por favor, selecione um paciente');
      return;
    }

    if (!dischargeNote.trim()) {
      Alert.alert('Erro', 'Por favor, preencha a nota de alta');
      return;
    }

    setIsLoading(true);
    try {
      const dischargeData = {
        patientId: selectedPatientId,
        dischargeNote: dischargeNote.trim(),
        ...patientData,
      };

      if (onDischarge) {
        await onDischarge(dischargeData);
      }

      // Limpar campos após salvar
      setSelectedPatientId(null);
      setDischargeNote('');
      setPatientData(null);

      Alert.alert('Sucesso', 'Alta processada com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Erro ao processar alta. Tente novamente.');
      console.error('Erro ao processar alta:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPatient = activePatients.find((p) => p.id === selectedPatientId);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Selecionar Paciente *</Text>
            <TouchableOpacity
              style={styles.selectContainer}
              onPress={() => setShowPatientModal(true)}
            >
              <MaterialIcons name="person" size={20} color="#566246" />
              <Text style={[styles.selectText, selectedPatientId && styles.selectTextActive]}>
                {selectedPatient
                  ? `${selectedPatient.name} - ${selectedPatient.location || 'N/A'}`
                  : 'Selecione o paciente'}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={20} color="#566246" />
            </TouchableOpacity>
          </View>

          {patientData && selectedPatient && (
            <>
              <View style={styles.patientInfoCard}>
                <View style={styles.patientInfoHeader}>
                  <MaterialIcons name="info" size={18} color="#566246" />
                  <Text style={styles.patientInfoTitle}>Informações do Paciente</Text>
                </View>
                <View style={styles.patientInfoGrid}>
                  <View style={styles.patientInfoItem}>
                    <MaterialIcons name="calendar-today" size={16} color="#4A4A48" />
                    <Text style={styles.patientInfoLabel}>Dias de Internamento</Text>
                    <Text style={styles.patientInfoValue}>{patientData.daysOfInternment || 0} dias</Text>
                  </View>
                  <View style={styles.patientInfoItem}>
                    <MaterialIcons name="location-on" size={16} color="#4A4A48" />
                    <Text style={styles.patientInfoLabel}>Localização</Text>
                    <Text style={styles.patientInfoValue}>{patientData.location || 'N/A'}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.parametersCard}>
                <View style={styles.parametersHeader}>
                  <MaterialIcons name="assessment" size={18} color="#566246" />
                  <Text style={styles.parametersTitle}>Parâmetros dos Últimos 3 Dias</Text>
                </View>
                <View style={styles.parameterRow}>
                  <View style={styles.parameterBox}>
                    <MaterialIcons name="device-thermostat" size={20} color="#566246" />
                    <Text style={styles.parameterLabel}>Dias com febre (&gt;38°C)</Text>
                    <Text style={styles.parameterValue}>{patientData.daysWithFever || 0} dias</Text>
                  </View>
                  <View style={styles.parameterBox}>
                    <MaterialIcons name="air" size={20} color="#566246" />
                    <Text style={styles.parameterLabel}>Dias com saturação baixa (&lt;88%)</Text>
                    <Text style={styles.parameterValue}>
                      {patientData.daysWithLowSaturation || 0} dias
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Nota de Alta *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Escreva as indicações de tratamento em casa e recomendações..."
              value={dischargeNote}
              onChangeText={setDischargeNote}
              multiline
              numberOfLines={6}
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]} 
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <MaterialIcons name="check-circle" size={20} color="#ffffff" />
          <Text style={styles.submitButtonText}>
            {isLoading ? 'Processando...' : 'Processar Alta'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal de Seleção de Paciente */}
      <Modal
        visible={showPatientModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPatientModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Paciente</Text>
              <TouchableOpacity onPress={() => setShowPatientModal(false)}>
                <MaterialIcons name="close" size={24} color="#566246" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
              {activePatients.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialIcons name="inbox" size={48} color="#D8DAD3" />
                  <Text style={styles.emptyText}>Nenhum paciente internado encontrado</Text>
                </View>
              ) : (
                activePatients.map((patient) => (
                  <TouchableOpacity
                    key={patient.id}
                    style={[
                      styles.modalItem,
                      selectedPatientId === patient.id && styles.modalItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedPatientId(patient.id);
                      setShowPatientModal(false);
                    }}
                  >
                    <View style={styles.modalItemContent}>
                      <View style={styles.modalItemHeader}>
                        <MaterialIcons name="person" size={20} color="#566246" />
                        <Text style={styles.modalItemName}>{patient.name}</Text>
                      </View>
                      <View style={styles.modalItemDetails}>
                        <Text style={styles.modalItemDetail}>
                          <MaterialIcons name="location-on" size={14} color="#4A4A48" /> {patient.location || 'N/A'}
                        </Text>
                        <Text style={styles.modalItemDetail}>
                          <MaterialIcons name="medical-services" size={14} color="#4A4A48" /> {patient.service || 'N/A'}
                        </Text>
                      </View>
                    </View>
                    {selectedPatientId === patient.id && (
                      <MaterialIcons name="check-circle" size={20} color="#566246" />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
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
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 0,
    padding: 16,
    margin: 0,
    marginBottom: 0,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  form: {
    marginBottom: 20,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#566246',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#F1F2EB',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#4A4A48',
    borderWidth: 1,
    borderColor: '#D8DAD3',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  selectContainer: {
    backgroundColor: '#F1F2EB',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D8DAD3',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectText: {
    fontSize: 16,
    color: '#999',
    flex: 1,
  },
  selectTextActive: {
    color: '#4A4A48',
    fontWeight: '500',
  },
  patientInfoCard: {
    backgroundColor: '#F1F2EB',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D8DAD3',
  },
  patientInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  patientInfoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#566246',
  },
  patientInfoGrid: {
    gap: 12,
  },
  patientInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  patientInfoLabel: {
    fontSize: 14,
    color: '#4A4A48',
    flex: 1,
  },
  patientInfoValue: {
    fontSize: 14,
    color: '#566246',
    fontWeight: '600',
  },
  parametersCard: {
    backgroundColor: '#F1F2EB',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D8DAD3',
  },
  parametersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  parametersTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#566246',
  },
  parameterRow: {
    flexDirection: 'row',
    gap: 10,
  },
  parameterBox: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8DAD3',
  },
  parameterLabel: {
    fontSize: 12,
    color: '#4A4A48',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  parameterValue: {
    fontSize: 18,
    color: '#566246',
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: '#566246',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#D8DAD3',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#566246',
  },
  modalList: {
    padding: 16,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#F1F2EB',
    borderWidth: 1,
    borderColor: '#D8DAD3',
  },
  modalItemSelected: {
    backgroundColor: '#A4C2A5',
    borderColor: '#566246',
  },
  modalItemContent: {
    flex: 1,
  },
  modalItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  modalItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#566246',
  },
  modalItemDetails: {
    gap: 4,
  },
  modalItemDetail: {
    fontSize: 13,
    color: '#4A4A48',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#4A4A48',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default AltaView;

