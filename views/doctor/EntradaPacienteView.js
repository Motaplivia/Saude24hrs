// View: EntradaPacienteView
// Tela de Entrada de Paciente

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const EntradaPacienteView = ({ patientController, onAdmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    userNumber: '',
    service: '',
    ward: '',
    bed: '',
    diagnosis: '',
    observations: '',
  });
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showWardModal, setShowWardModal] = useState(false);
  const [showBedModal, setShowBedModal] = useState(false);

  const services = [
    'Cardiologia',
    'Neurologia',
    'Pediatria',
    'Ortopedia',
    'Pneumologia',
    'Endocrinologia',
    'Gastroenterologia',
    'Reumatologia',
    'Ginecologia',
    'Oftalmologia',
    'Dermatologia',
    'Psiquiatria',
    'Urologia',
    'Oncologia',
    'Anestesiologia',
    'Medicina Geral',
  ];

  // Obtém enfermarias disponíveis do controller
  const availableWards = useMemo(() => {
    if (!patientController) return [];
    return patientController.getAvailableWards() || [];
  }, [patientController]);

  // Obtém leitos disponíveis da enfermaria selecionada
  const availableBeds = useMemo(() => {
    if (!formData.ward || !patientController) return [];
    return patientController.getAvailableBeds(formData.ward) || [];
  }, [formData.ward, patientController]);

  useEffect(() => {
    if (patientController?.ensureLoaded) {
      patientController.ensureLoaded();
    }
  }, [patientController]);

  // Limpa o leito quando a enfermaria muda
  useEffect(() => {
    if (formData.ward) {
      setFormData(prev => ({ ...prev, bed: '' }));
    }
  }, [formData.ward]);

  const handleSubmit = () => {
    // Validação dos campos obrigatórios
    if (!formData.name.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o nome do paciente');
      return;
    }
    if (!formData.email.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o email do paciente');
      return;
    }
    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      Alert.alert('Erro', 'Por favor, insira um email válido');
      return;
    }
    if (!formData.userNumber.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o número de utente');
      return;
    }
    if (!formData.service) {
      Alert.alert('Erro', 'Por favor, selecione o serviço');
      return;
    }
    if (!formData.ward.trim()) {
      Alert.alert('Erro', 'Por favor, selecione a enfermaria');
      return;
    }
    if (!formData.bed.trim()) {
      Alert.alert('Erro', 'Por favor, selecione um leito disponível');
      return;
    }
    if (!formData.diagnosis.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o diagnóstico');
      return;
    }

    // Verifica se já existe paciente com o mesmo número de utente
    const existingPatients = patientController.getAllPatients();
    const existingPatient = existingPatients.find(
      p => p.userNumber.toLowerCase() === formData.userNumber.trim().toLowerCase()
    );

    if (existingPatient && existingPatient.status === 'ativo') {
      Alert.alert(
        'Paciente já cadastrado',
        `Já existe um paciente ativo com o número de utente ${formData.userNumber}. Deseja continuar mesmo assim?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Continuar',
            onPress: () => {
              submitPatient();
            },
          },
        ]
      );
      return;
    }

    submitPatient();
  };

  const submitPatient = async () => {
    if (onAdmit) {
      const patientData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        userNumber: formData.userNumber.trim().toUpperCase(),
        service: formData.service,
        ward: formData.ward,
        bed: formData.bed.trim(),
        diagnosis: formData.diagnosis.trim(),
        observations: formData.observations.trim(),
        status: 'ativo',
        validationPending: true,
        eligibleForDischarge: false,
      };

      let patientWithCredentials = null;
      try {
        // Chama o handler que retorna o paciente com credenciais
        patientWithCredentials = await onAdmit(patientData);
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível salvar o paciente. Tente novamente.');
        return;
      }

      // Limpa o formulário após sucesso
      setFormData({
        name: '',
        email: '',
        userNumber: '',
        service: '',
        ward: '',
        bed: '',
        diagnosis: '',
        observations: '',
      });

      // Exibe informações de acesso
      const credentialsMessage = patientWithCredentials && patientWithCredentials.password
        ? `\n\n📧 Email: ${patientWithCredentials.email}\n🔑 Senha: ${patientWithCredentials.password}\n🔐 Código Familiar: ${patientWithCredentials.accessCode}\n\nAs credenciais foram enviadas por email.`
        : '\n\nAs credenciais foram enviadas por email.';

      Alert.alert(
        'Sucesso',
        `Paciente admitido com sucesso!${credentialsMessage}`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Opcional: navegar para outra tela
            },
          },
        ]
      );
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <Text style={styles.title}>Dar Entrada de Paciente</Text>
        <Text style={styles.subtitle}>
          Registre a entrada de um novo paciente em internamento
        </Text>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Nome do Paciente *</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o nome completo"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="exemplo@email.com"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text.toLowerCase() })}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.helperText}>
              O paciente receberá por email a senha de acesso e o código para familiares
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Número de Utente *</Text>
            <TextInput
              style={styles.input}
              placeholder="PT000000"
              value={formData.userNumber}
              onChangeText={(text) => setFormData({ ...formData, userNumber: text.toUpperCase() })}
              autoCapitalize="characters"
              maxLength={10}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Serviço *</Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => setShowServiceModal(true)}
            >
              <Text style={[styles.selectText, !formData.service && styles.selectPlaceholder]}>
                {formData.service || 'Selecione o Serviço'}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={24} color="#566246" />
            </TouchableOpacity>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Enfermaria *</Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => setShowWardModal(true)}
              disabled={availableWards.length === 0}
            >
              <Text style={[styles.selectText, !formData.ward && styles.selectPlaceholder]}>
                {formData.ward 
                  ? `${formData.ward} (${availableWards.find(w => w.name === formData.ward)?.availableBeds || 0} leitos disponíveis)`
                  : availableWards.length === 0 
                    ? 'Nenhuma enfermaria disponível'
                    : 'Selecione a Enfermaria'}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={24} color="#566246" />
            </TouchableOpacity>
            {availableWards.length === 0 && (
              <Text style={styles.warningText}>
                Todas as enfermarias estão lotadas
              </Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Número da Cama *</Text>
            <TouchableOpacity
              style={[styles.selectInput, !formData.ward && styles.selectInputDisabled]}
              onPress={() => {
                if (formData.ward && availableBeds.length > 0) {
                  setShowBedModal(true);
                } else if (!formData.ward) {
                  Alert.alert('Atenção', 'Selecione primeiro uma enfermaria');
                } else {
                  Alert.alert('Atenção', 'Não há leitos disponíveis nesta enfermaria');
                }
              }}
              disabled={!formData.ward || availableBeds.length === 0}
            >
              <Text style={[styles.selectText, !formData.bed && styles.selectPlaceholder]}>
                {formData.bed 
                  ? `Cama ${formData.bed}`
                  : !formData.ward
                    ? 'Selecione primeiro a enfermaria'
                    : availableBeds.length === 0
                      ? 'Nenhum leito disponível'
                      : `${availableBeds.length} leito(s) disponível(is)`}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={24} color={formData.ward ? "#566246" : "#D8DAD3"} />
            </TouchableOpacity>
            {formData.ward && availableBeds.length === 0 && (
              <Text style={styles.warningText}>
                Esta enfermaria está lotada. Selecione outra enfermaria.
              </Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Diagnóstico *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Digite o diagnóstico do paciente"
              value={formData.diagnosis}
              onChangeText={(text) => setFormData({ ...formData, diagnosis: text })}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Observações</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Observações adicionais (opcional)"
              value={formData.observations}
              onChangeText={(text) => setFormData({ ...formData, observations: text })}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Dar Entrada</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de seleção de serviço */}
      <Modal
        visible={showServiceModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowServiceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Serviço</Text>
              <TouchableOpacity onPress={() => setShowServiceModal(false)}>
                <MaterialIcons name="close" size={24} color="#566246" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {services.map((service) => (
                <TouchableOpacity
                  key={service}
                  style={[
                    styles.modalItem,
                    formData.service === service && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    setFormData({ ...formData, service });
                    setShowServiceModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      formData.service === service && styles.modalItemTextSelected,
                    ]}
                  >
                    {service}
                  </Text>
                  {formData.service === service && (
                    <MaterialIcons name="check" size={18} color="#566246" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de seleção de enfermaria */}
      <Modal
        visible={showWardModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowWardModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Enfermaria</Text>
              <TouchableOpacity onPress={() => setShowWardModal(false)}>
                <MaterialIcons name="close" size={24} color="#566246" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {availableWards.length === 0 ? (
                <View style={styles.emptyModalState}>
                  <Text style={styles.emptyModalText}>
                    Todas as enfermarias estão lotadas
                  </Text>
                </View>
              ) : (
                availableWards.map((ward) => (
                  <TouchableOpacity
                    key={ward.name}
                    style={[
                      styles.modalItem,
                      formData.ward === ward.name && styles.modalItemSelected,
                    ]}
                    onPress={() => {
                      setFormData({ ...formData, ward: ward.name, bed: '' });
                      setShowWardModal(false);
                    }}
                  >
                    <View style={styles.modalItemContent}>
                      <Text
                        style={[
                          styles.modalItemText,
                          formData.ward === ward.name && styles.modalItemTextSelected,
                        ]}
                      >
                        {ward.name}
                      </Text>
                      <Text style={styles.modalItemSubtext}>
                        {ward.availableBeds} de {ward.totalBeds} leitos disponíveis
                      </Text>
                    </View>
                    {formData.ward === ward.name && (
                      <MaterialIcons name="check" size={18} color="#566246" />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de seleção de leito */}
      <Modal
        visible={showBedModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBedModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Selecionar Leito - {formData.ward}
              </Text>
              <TouchableOpacity onPress={() => setShowBedModal(false)}>
                <MaterialIcons name="close" size={24} color="#566246" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {availableBeds.length === 0 ? (
                <View style={styles.emptyModalState}>
                  <Text style={styles.emptyModalText}>
                    Não há leitos disponíveis nesta enfermaria
                  </Text>
                </View>
              ) : (
                availableBeds.map((bed) => (
                  <TouchableOpacity
                    key={bed}
                    style={[
                      styles.modalItem,
                      formData.bed === bed && styles.modalItemSelected,
                    ]}
                    onPress={() => {
                      setFormData({ ...formData, bed });
                      setShowBedModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        formData.bed === bed && styles.modalItemTextSelected,
                      ]}
                    >
                      Cama {bed}
                    </Text>
                    {formData.bed === bed && (
                      <MaterialIcons name="check" size={18} color="#566246" />
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
  form: {
    marginBottom: 20,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4A4A48',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#4A4A48',
    marginTop: 4,
    fontStyle: 'italic',
    opacity: 0.7,
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
    minHeight: 100,
    textAlignVertical: 'top',
  },
  selectInput: {
    backgroundColor: '#F1F2EB',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#D8DAD3',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    fontSize: 16,
    color: '#4A4A48',
  },
  selectPlaceholder: {
    color: '#999',
  },
  selectInputDisabled: {
    opacity: 0.6,
  },
  warningText: {
    fontSize: 12,
    color: '#f44336',
    marginTop: 4,
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: '#566246',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  // Estilos do modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
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
    fontWeight: '600',
    color: '#4A4A48',
  },
  modalList: {
    padding: 16,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F1F2EB',
  },
  modalItemSelected: {
    backgroundColor: '#A4C2A5',
  },
  modalItemText: {
    fontSize: 16,
    color: '#4A4A48',
  },
  modalItemTextSelected: {
    color: '#566246',
    fontWeight: '600',
  },
  modalItemContent: {
    flex: 1,
  },
  modalItemSubtext: {
    fontSize: 12,
    color: '#4A4A48',
    marginTop: 2,
    opacity: 0.7,
  },
  emptyModalState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyModalText: {
    fontSize: 14,
    color: '#4A4A48',
    textAlign: 'center',
  },
});

export default EntradaPacienteView;
