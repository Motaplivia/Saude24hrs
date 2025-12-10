// View: DiarioPacienteView
// Tela de Diário do Paciente

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const DiarioPacienteView = ({ diaryController, patientController, onSave }) => {
  const [formData, setFormData] = useState({
    patientId: null,
    temperature: '',
    heartRate: '',
    systolicBP: '',
    diastolicBP: '',
    spO2: '',
    bowelMovement: '',
    urinaryOutput: '',
    diagnosis: '',
    observations: '',
    medications: [],
    exams: [],
  });
  
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [showMedicationDetailsModal, setShowMedicationDetailsModal] = useState(false);
  const [showExamDetailsModal, setShowExamDetailsModal] = useState(false);
  const [showTimePickerModal, setShowTimePickerModal] = useState(false);
  const [timePickerType, setTimePickerType] = useState('medication'); // 'medication' or 'exam'
  
  const [selectedMedication, setSelectedMedication] = useState('');
  const [currentMedication, setCurrentMedication] = useState({
    name: '',
    dosage: '',
    time: '',
  });
  
  const [selectedExam, setSelectedExam] = useState('');
  const [currentExam, setCurrentExam] = useState({
    type: '',
    result: '',
    date: '',
  });

  const [selectedHour, setSelectedHour] = useState(8);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const hourScrollRef = useRef(null);
  const minuteScrollRef = useRef(null);

  // Rola para a hora selecionada quando o modal abre
  useEffect(() => {
    if (showTimePickerModal) {
      setTimeout(() => {
        if (hourScrollRef.current) {
          hourScrollRef.current.scrollTo({ y: selectedHour * 56, animated: true });
        }
        if (minuteScrollRef.current) {
          const minuteIndex = [0, 15, 30, 45].indexOf(selectedMinute);
          if (minuteIndex !== -1) {
            minuteScrollRef.current.scrollTo({ y: minuteIndex * 56, animated: true });
          }
        }
      }, 100);
    }
  }, [showTimePickerModal, selectedHour, selectedMinute]);

  // Listas pré-definidas
  const commonMedications = [
    'Paracetamol', 'Ibuprofeno', 'Dipirona', 'Omeprazol', 'Amoxicilina',
    'Azitromicina', 'Furosemida', 'Enalapril', 'Losartana', 'Metformina',
    'Insulina', 'Morfina', 'Diazepam', 'Lorazepam', 'Metoclopramida',
    'Ondansetrona', 'Ranitidina', 'Sinvastatina', 'Atenolol', 'Amlodipina'
  ];

  const medicationDosages = [
    '10mg', '20mg', '40mg', '50mg', '100mg', '250mg', '500mg', '750mg', '1g',
    '5ml', '10ml', '15ml', '20ml', '1 comprimido', '2 comprimidos', '3 comprimidos'
  ];

  const commonExams = [
    'Hemograma Completo', 'Glicemia', 'Colesterol Total', 'Triglicerídeos',
    'Creatinina', 'Ureia', 'TGO/AST', 'TGP/ALT', 'Bilirrubina Total',
    'Raio-X de Tórax', 'Raio-X de Abdome', 'Eletrocardiograma', 'Ecocardiograma',
    'Tomografia Computadorizada', 'Ressonância Magnética', 'Ultrassonografia',
    'Teste de COVID-19', 'Hemoglobina Glicada', 'TSH', 'T4 Livre'
  ];

  const examResults = [
    'Normal', 'Alterado', 'Elevado', 'Diminuído', 'Positivo', 'Negativo',
    'Sem alterações', 'Levemente alterado', 'Moderadamente alterado', 'Gravemente alterado'
  ];

  const handleSelectMedication = (medicationName) => {
    setSelectedMedication(medicationName);
    setCurrentMedication({ name: medicationName, dosage: '', time: '' });
    setShowMedicationModal(false);
    setShowMedicationDetailsModal(true);
  };

  const handleAddMedication = () => {
    if (!currentMedication.dosage.trim()) {
      Alert.alert('Erro', 'Por favor, preencha a dosagem');
      return;
    }
    
    setFormData({
      ...formData,
      medications: [...formData.medications, { ...currentMedication }],
    });
    
    setCurrentMedication({ name: '', dosage: '', time: '' });
    setSelectedMedication('');
    setShowMedicationDetailsModal(false);
  };

  const handleRemoveMedication = (index) => {
    const newMedications = formData.medications.filter((_, i) => i !== index);
    setFormData({ ...formData, medications: newMedications });
  };

  const handleSelectExam = (examType) => {
    setSelectedExam(examType);
    setCurrentExam({ type: examType, result: '', date: '' });
    setShowExamModal(false);
    setShowExamDetailsModal(true);
  };

  const handleAddExam = () => {
    if (!currentExam.result.trim()) {
      Alert.alert('Erro', 'Por favor, selecione o resultado');
      return;
    }
    
    setFormData({
      ...formData,
      exams: [...formData.exams, { ...currentExam }],
    });
    
    setCurrentExam({ type: '', result: '', date: '' });
    setSelectedExam('');
    setShowExamDetailsModal(false);
  };

  const handleRemoveExam = (index) => {
    const newExams = formData.exams.filter((_, i) => i !== index);
    setFormData({ ...formData, exams: newExams });
  };

  const handleSubmit = () => {
    if (!formData.patientId) {
      Alert.alert('Erro', 'Por favor, selecione um paciente');
      return;
    }
    
    if (!formData.diagnosis.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o diagnóstico');
      return;
    }
    
    if (!formData.observations.trim()) {
      Alert.alert('Erro', 'Por favor, preencha as observações');
      return;
    }
    
    if (onSave) {
      onSave(formData);
      
      // Limpar todos os campos e estados após salvar
      setFormData({
        patientId: null,
        temperature: '',
        heartRate: '',
        systolicBP: '',
        diastolicBP: '',
        spO2: '',
        bowelMovement: '',
        urinaryOutput: '',
        diagnosis: '',
        observations: '',
        medications: [],
        exams: [],
      });
      
      // Limpar estados de seleção
      setSelectedMedication('');
      setCurrentMedication({
        name: '',
        dosage: '',
        time: '',
      });
      
      setSelectedExam('');
      setCurrentExam({
        type: '',
        result: '',
        date: '',
      });
      
      // Fechar todos os modais
      setShowPatientModal(false);
      setShowMedicationModal(false);
      setShowExamModal(false);
      setShowMedicationDetailsModal(false);
      setShowExamDetailsModal(false);
      setShowTimePickerModal(false);
      
      // Resetar horário selecionado
      setSelectedHour(8);
      setSelectedMinute(0);
      
      Alert.alert('Sucesso', 'Diário registrado com sucesso!');
    }
  };

  const patients = patientController?.getAllPatients() || [];
  const activePatients = patients.filter(p => p.status === 'ativo');

  const formatDate = (dateString) => {
    if (!dateString) return '';
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
            <Text style={styles.label}>Paciente *</Text>
            <TouchableOpacity
              style={styles.selectContainer}
              onPress={() => setShowPatientModal(true)}
            >
              <Text style={[styles.selectText, formData.patientId && styles.selectTextActive]}>
                {formData.patientId
                  ? activePatients.find((p) => p.id === formData.patientId)?.name
                  : 'Selecione o paciente'}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={20} color="#566246" />
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Temperatura (°C)</Text>
              <TextInput
                style={styles.input}
                placeholder="36.5"
                value={formData.temperature}
                onChangeText={(text) => setFormData({ ...formData, temperature: text })}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Freq.Cardíaca (bpm)</Text>
              <TextInput
                style={styles.input}
                placeholder="70"
                value={formData.heartRate}
                onChangeText={(text) => setFormData({ ...formData, heartRate: text })}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Tensão Sistólica (mmHg)</Text>
              <TextInput
                style={styles.input}
                placeholder="120"
                value={formData.systolicBP}
                onChangeText={(text) => setFormData({ ...formData, systolicBP: text })}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Tensão Diastólica (mmHg)</Text>
              <TextInput
                style={styles.input}
                placeholder="80"
                value={formData.diastolicBP}
                onChangeText={(text) => setFormData({ ...formData, diastolicBP: text })}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Saturação de Oxigênio (%)</Text>
            <TextInput
              style={styles.input}
              placeholder="97"
              value={formData.spO2}
              onChangeText={(text) => setFormData({ ...formData, spO2: text })}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Eliminação Intestinal</Text>
              <TextInput
                style={styles.input}
                placeholder="Normal"
                value={formData.bowelMovement}
                onChangeText={(text) => setFormData({ ...formData, bowelMovement: text })}
              />
            </View>

            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Eliminação Urinária</Text>
              <TextInput
                style={styles.input}
                placeholder="Normal"
                value={formData.urinaryOutput}
                onChangeText={(text) => setFormData({ ...formData, urinaryOutput: text })}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Diagnóstico *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Digite o diagnóstico"
              value={formData.diagnosis}
              onChangeText={(text) => setFormData({ ...formData, diagnosis: text })}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Observações *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Digite as observações"
              value={formData.observations}
              onChangeText={(text) => setFormData({ ...formData, observations: text })}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Seção de Medicações */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <MaterialIcons name="medication" size={18} color="#566246" /> Medicações Aplicadas
            </Text>
            
            <View style={styles.addItemContainer}>
              <TouchableOpacity
                style={styles.addMedicationButton}
                onPress={() => setShowMedicationModal(true)}
              >
                <MaterialIcons name="add-circle-outline" size={20} color="#566246" />
                <Text style={styles.addMedicationButtonText}>Adicionar Medicação</Text>
              </TouchableOpacity>
            </View>

            {formData.medications.length > 0 && (
              <View style={styles.itemsList}>
                {formData.medications.map((medication, index) => (
                  <View key={index} style={styles.itemCard}>
                    <View style={styles.itemCardContent}>
                      <Text style={styles.itemCardName}>{medication.name}</Text>
                      <Text style={styles.itemCardDetails}>
                        {medication.dosage} {medication.time && `• ${medication.time}`}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeItemButton}
                      onPress={() => handleRemoveMedication(index)}
                    >
                      <MaterialIcons name="close" size={18} color="#f44336" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Seção de Exames */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <MaterialIcons name="science" size={18} color="#566246" /> Exames Realizados
            </Text>
            
            <View style={styles.addItemContainer}>
              <TouchableOpacity
                style={styles.addMedicationButton}
                onPress={() => setShowExamModal(true)}
              >
                <MaterialIcons name="add-circle-outline" size={20} color="#566246" />
                <Text style={styles.addMedicationButtonText}>Adicionar Exame</Text>
              </TouchableOpacity>
            </View>

            {formData.exams.length > 0 && (
              <View style={styles.itemsList}>
                {formData.exams.map((exam, index) => (
                  <View key={index} style={styles.itemCard}>
                    <View style={styles.itemCardContent}>
                      <Text style={styles.itemCardName}>{exam.type}</Text>
                      <Text style={styles.itemCardDetails}>
                        {exam.result} {exam.date && `• ${exam.date}`}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeItemButton}
                      onPress={() => handleRemoveExam(index)}
                    >
                      <MaterialIcons name="close" size={18} color="#f44336" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Guardar Diário</Text>
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
            <ScrollView style={styles.modalList}>
              {activePatients.length > 0 ? (
                activePatients.map((patient) => (
                  <TouchableOpacity
                    key={patient.id}
                    style={[
                      styles.modalItem,
                      formData.patientId === patient.id && styles.modalItemSelected,
                    ]}
                    onPress={() => {
                      setFormData({ ...formData, patientId: patient.id });
                      setShowPatientModal(false);
                    }}
                  >
                    <View style={styles.modalItemContent}>
                      <Text style={styles.modalItemText}>{patient.name}</Text>
                      <Text style={styles.modalItemSubtext}>
                        {patient.userNumber} • {patient.service}
                      </Text>
                    </View>
                    {formData.patientId === patient.id && (
                      <MaterialIcons name="check" size={18} color="#566246" />
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>Nenhum paciente ativo encontrado</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de Seleção de Medicação */}
      <Modal
        visible={showMedicationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMedicationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Medicação</Text>
              <TouchableOpacity onPress={() => setShowMedicationModal(false)}>
                <MaterialIcons name="close" size={24} color="#566246" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {commonMedications.map((medication) => (
                <TouchableOpacity
                  key={medication}
                  style={styles.modalItem}
                  onPress={() => handleSelectMedication(medication)}
                >
                  <Text style={styles.modalItemText}>{medication}</Text>
                  <MaterialIcons name="arrow-forward" size={18} color="#566246" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de Seleção de Exame */}
      <Modal
        visible={showExamModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowExamModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Exame</Text>
              <TouchableOpacity onPress={() => setShowExamModal(false)}>
                <MaterialIcons name="close" size={24} color="#566246" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {commonExams.map((exam) => (
                <TouchableOpacity
                  key={exam}
                  style={styles.modalItem}
                  onPress={() => handleSelectExam(exam)}
                >
                  <Text style={styles.modalItemText}>{exam}</Text>
                  <MaterialIcons name="arrow-forward" size={18} color="#566246" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de Detalhes da Medicação */}
      <Modal
        visible={showMedicationDetailsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowMedicationDetailsModal(false);
          setCurrentMedication({ name: '', dosage: '', time: '' });
          setSelectedMedication('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Registrar Medicação</Text>
              <TouchableOpacity onPress={() => {
                setShowMedicationDetailsModal(false);
                setCurrentMedication({ name: '', dosage: '', time: '' });
                setSelectedMedication('');
              }}>
                <MaterialIcons name="close" size={24} color="#566246" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              <View style={styles.detailsForm}>
                <View style={styles.detailsField}>
                  <Text style={styles.detailsLabel}>Medicação</Text>
                  <View style={styles.detailsValueContainer}>
                    <Text style={styles.detailsValue}>{selectedMedication}</Text>
                  </View>
                </View>

                <View style={styles.detailsField}>
                  <Text style={styles.detailsLabel}>Dosagem *</Text>
                  <TouchableOpacity
                    style={styles.detailsSelect}
                    onPress={() => {
                      Alert.alert(
                        'Selecionar Dose',
                        'Escolha a dosagem',
                        medicationDosages.map(dosage => ({
                          text: dosage,
                          onPress: () => setCurrentMedication({ ...currentMedication, dosage }),
                        })).concat([{ text: 'Cancelar', style: 'cancel' }])
                      );
                    }}
                  >
                    <Text style={[
                      styles.selectText,
                      currentMedication.dosage && styles.selectTextActive
                    ]}>
                      {currentMedication.dosage || 'Selecione a dosagem'}
                    </Text>
                    <MaterialIcons name="arrow-drop-down" size={20} color="#566246" />
                  </TouchableOpacity>
                </View>

                <View style={styles.detailsField}>
                  <Text style={styles.detailsLabel}>Horário</Text>
                  <TouchableOpacity
                    style={styles.detailsSelect}
                    onPress={() => {
                      // Parse current time if exists
                      if (currentMedication.time) {
                        const [hour, minute] = currentMedication.time.split(':').map(Number);
                        if (!isNaN(hour) && !isNaN(minute)) {
                          setSelectedHour(hour);
                          // Encontra o minuto mais próximo disponível (0, 15, 30, 45)
                          const availableMinutes = [0, 15, 30, 45];
                          const closestMinute = availableMinutes.reduce((prev, curr) => 
                            Math.abs(curr - minute) < Math.abs(prev - minute) ? curr : prev
                          );
                          setSelectedMinute(closestMinute);
                        }
                      } else {
                        // Define horário padrão se não houver
                        const now = new Date();
                        setSelectedHour(now.getHours());
                        setSelectedMinute(0);
                      }
                      setTimePickerType('medication');
                      setShowTimePickerModal(true);
                    }}
                  >
                    <MaterialIcons name="access-time" size={20} color="#566246" />
                    <Text style={[
                      styles.selectText,
                      currentMedication.time && styles.selectTextActive,
                      { flex: 1, marginLeft: 8 }
                    ]}>
                      {currentMedication.time || 'Selecione o horário'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[
                    styles.detailsSubmitButton,
                    !currentMedication.dosage && styles.detailsSubmitButtonDisabled
                  ]}
                  onPress={handleAddMedication}
                  disabled={!currentMedication.dosage}
                >
                  <Text style={styles.detailsSubmitButtonText}>Adicionar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de Detalhes do Exame */}
      <Modal
        visible={showExamDetailsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowExamDetailsModal(false);
          setCurrentExam({ type: '', result: '', date: '' });
          setSelectedExam('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Registrar Exame</Text>
              <TouchableOpacity onPress={() => {
                setShowExamDetailsModal(false);
                setCurrentExam({ type: '', result: '', date: '' });
                setSelectedExam('');
              }}>
                <MaterialIcons name="close" size={24} color="#566246" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              <View style={styles.detailsForm}>
                <View style={styles.detailsField}>
                  <Text style={styles.detailsLabel}>Tipo de Exame</Text>
                  <View style={styles.detailsValueContainer}>
                    <Text style={styles.detailsValue}>{selectedExam}</Text>
                  </View>
                </View>

                <View style={styles.detailsField}>
                  <Text style={styles.detailsLabel}>Resultado *</Text>
                  <TouchableOpacity
                    style={styles.detailsSelect}
                    onPress={() => {
                      Alert.alert(
                        'Selecionar Resultado',
                        'Escolha o resultado',
                        examResults.map(result => ({
                          text: result,
                          onPress: () => setCurrentExam({ ...currentExam, result }),
                        })).concat([{ text: 'Cancelar', style: 'cancel' }])
                      );
                    }}
                  >
                    <Text style={[
                      styles.selectText,
                      currentExam.result && styles.selectTextActive
                    ]}>
                      {currentExam.result || 'Selecione o resultado'}
                    </Text>
                    <MaterialIcons name="arrow-drop-down" size={20} color="#566246" />
                  </TouchableOpacity>
                </View>

                <View style={styles.detailsField}>
                  <Text style={styles.detailsLabel}>Data</Text>
                  <TextInput
                    style={styles.detailsInput}
                    placeholder="DD/MM/AAAA"
                    value={currentExam.date}
                    onChangeText={(text) => setCurrentExam({ ...currentExam, date: text })}
                    placeholderTextColor="#999"
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.detailsSubmitButton,
                    !currentExam.result && styles.detailsSubmitButtonDisabled
                  ]}
                  onPress={handleAddExam}
                  disabled={!currentExam.result}
                >
                  <Text style={styles.detailsSubmitButtonText}>Adicionar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de Seletor de Horário */}
      <Modal
        visible={showTimePickerModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTimePickerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.timePickerModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Horário</Text>
              <TouchableOpacity onPress={() => setShowTimePickerModal(false)}>
                <MaterialIcons name="close" size={24} color="#566246" />
              </TouchableOpacity>
            </View>
            <View style={styles.timePickerContainer}>
              <View style={styles.timePickerColumn}>
                <Text style={styles.timePickerLabel}>Hora</Text>
                <View style={styles.timePickerWrapper}>
                  <View style={styles.timePickerHighlight} />
                  <ScrollView 
                    ref={hourScrollRef}
                    style={styles.timePickerScroll} 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.timePickerContent}
                  >
                    {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                      <TouchableOpacity
                        key={hour}
                        style={[
                          styles.timePickerItem,
                          selectedHour === hour && styles.timePickerItemSelected,
                        ]}
                        onPress={() => {
                          setSelectedHour(hour);
                          hourScrollRef.current?.scrollTo({ y: hour * 56, animated: true });
                        }}
                      >
                        <Text style={[
                          styles.timePickerItemText,
                          selectedHour === hour && styles.timePickerItemTextSelected,
                        ]}>
                          {hour.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
              <Text style={styles.timePickerSeparator}>:</Text>
              <View style={styles.timePickerColumn}>
                <Text style={styles.timePickerLabel}>Minuto</Text>
                <View style={styles.timePickerWrapper}>
                  <View style={styles.timePickerHighlight} />
                  <ScrollView 
                    ref={minuteScrollRef}
                    style={styles.timePickerScroll} 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.timePickerContent}
                  >
                    {[0, 15, 30, 45].map((minute) => (
                      <TouchableOpacity
                        key={minute}
                        style={[
                          styles.timePickerItem,
                          selectedMinute === minute && styles.timePickerItemSelected,
                        ]}
                        onPress={() => {
                          setSelectedMinute(minute);
                          const minuteIndex = [0, 15, 30, 45].indexOf(minute);
                          if (minuteIndex !== -1) {
                            minuteScrollRef.current?.scrollTo({ y: minuteIndex * 56, animated: true });
                          }
                        }}
                      >
                        <Text style={[
                          styles.timePickerItemText,
                          selectedMinute === minute && styles.timePickerItemTextSelected,
                        ]}>
                          {minute.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>
            <View style={styles.timePickerActions}>
              <TouchableOpacity
                style={styles.timePickerCancelButton}
                onPress={() => setShowTimePickerModal(false)}
              >
                <Text style={styles.timePickerCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.timePickerConfirmButton}
                onPress={() => {
                  const timeString = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
                  if (timePickerType === 'medication') {
                    setCurrentMedication({ ...currentMedication, time: timeString });
                  } else {
                    // Para exames, se necessário no futuro
                    setCurrentExam({ ...currentExam, date: timeString });
                  }
                  setShowTimePickerModal(false);
                }}
              >
                <Text style={styles.timePickerConfirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
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
    backgroundColor: '#fff',
    borderRadius: 0,
    padding: 20,
    margin: 0,
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
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 14,
    color: '#4A4A48',
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
    minHeight: 100,
    textAlignVertical: 'top',
  },
  selectContainer: {
    backgroundColor: '#F1F2EB',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D8DAD3',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
  },
  selectText: {
    fontSize: 16,
    color: '#999',
  },
  selectTextActive: {
    color: '#4A4A48',
    fontWeight: '600',
  },
  chevron: {
    fontSize: 12,
    color: '#566246',
  },
  section: {
    marginTop: 30,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#566246',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addItemContainer: {
    marginBottom: 16,
  },
  addItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addItemField: {
    backgroundColor: '#F1F2EB',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#D8DAD3',
    minHeight: 44,
    justifyContent: 'center',
  },
  addItemFieldSelect: {
    backgroundColor: '#F1F2EB',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#D8DAD3',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
  },
  medicationField: {
    flex: 2.5,
  },
  dosageField: {
    flex: 1.2,
  },
  timeField: {
    flex: 1,
  },
  examField: {
    flex: 2.5,
  },
  resultField: {
    flex: 1.5,
  },
  dateField: {
    flex: 1,
  },
  addItemInput: {
    backgroundColor: '#F1F2EB',
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    color: '#4A4A48',
    borderWidth: 1,
    borderColor: '#D8DAD3',
    flex: 1,
  },
  addItemButton: {
    backgroundColor: '#566246',
    borderRadius: 10,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  itemsList: {
    gap: 10,
  },
  itemCard: {
    backgroundColor: '#F1F2EB',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8DAD3',
  },
  itemCardContent: {
    flex: 1,
  },
  itemCardName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#566246',
    marginBottom: 4,
  },
  itemCardDetails: {
    fontSize: 13,
    color: '#4A4A48',
  },
  removeItemButton: {
    padding: 4,
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: '#566246',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#fff',
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
  modalItemText: {
    fontSize: 16,
    color: '#4A4A48',
    fontWeight: '600',
  },
  modalItemSubtext: {
    fontSize: 13,
    color: '#4A4A48',
    marginTop: 4,
    opacity: 0.7,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#4A4A48',
    textAlign: 'center',
  },
  addMedicationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A4C2A5',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#D8DAD3',
  },
  addMedicationButtonText: {
    fontSize: 15,
    color: '#566246',
    fontWeight: '600',
  },
  detailsForm: {
    padding: 8,
  },
  detailsField: {
    marginBottom: 20,
  },
  detailsLabel: {
    fontSize: 14,
    color: '#4A4A48',
    fontWeight: '600',
    marginBottom: 8,
  },
  detailsValueContainer: {
    backgroundColor: '#F1F2EB',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D8DAD3',
  },
  detailsValue: {
    fontSize: 16,
    color: '#566246',
    fontWeight: '600',
  },
  detailsSelect: {
    backgroundColor: '#F1F2EB',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D8DAD3',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
  },
  detailsInput: {
    backgroundColor: '#F1F2EB',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#4A4A48',
    borderWidth: 1,
    borderColor: '#D8DAD3',
  },
  detailsSubmitButton: {
    backgroundColor: '#566246',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  detailsSubmitButtonDisabled: {
    backgroundColor: '#D8DAD3',
    opacity: 0.6,
  },
  detailsSubmitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  timePickerModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    gap: 10,
  },
  timePickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  timePickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#566246',
    marginBottom: 10,
  },
  timePickerWrapper: {
    height: 200,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  timePickerHighlight: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 48,
    marginTop: -24,
    backgroundColor: 'rgba(164, 194, 165, 0.2)',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#A4C2A5',
    zIndex: 1,
    pointerEvents: 'none',
  },
  timePickerScroll: {
    flex: 1,
  },
  timePickerContent: {
    paddingVertical: 70,
  },
  timePickerItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 4,
    backgroundColor: '#F1F2EB',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8DAD3',
    minHeight: 48,
    justifyContent: 'center',
  },
  timePickerItemSelected: {
    backgroundColor: '#A4C2A5',
    borderColor: '#566246',
  },
  timePickerItemText: {
    fontSize: 18,
    color: '#4A4A48',
    fontWeight: '500',
  },
  timePickerItemTextSelected: {
    color: '#566246',
    fontWeight: '700',
  },
  timePickerSeparator: {
    fontSize: 32,
    fontWeight: '700',
    color: '#566246',
    marginTop: 30,
  },
  timePickerActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 10,
  },
  timePickerCancelButton: {
    flex: 1,
    backgroundColor: '#F1F2EB',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8DAD3',
  },
  timePickerCancelButtonText: {
    color: '#566246',
    fontSize: 16,
    fontWeight: '600',
  },
  timePickerConfirmButton: {
    flex: 1,
    backgroundColor: '#566246',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  timePickerConfirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default DiarioPacienteView;

