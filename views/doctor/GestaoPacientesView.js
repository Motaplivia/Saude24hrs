// View: GestaoPacientesView
// Tela de Gestão de Pacientes

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const GestaoPacientesView = ({ patientController, validationController, diaryController, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState('todos');
  const [selectedStatus, setSelectedStatus] = useState('todos');
  const [patients, setPatients] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showServiceSelectModal, setShowServiceSelectModal] = useState(false);
  const [showDiaryModal, setShowDiaryModal] = useState(false);
  const [patientDiaries, setPatientDiaries] = useState([]);
  const [referralData, setReferralData] = useState({
    newService: '',
    reason: '',
  });

  useEffect(() => {
    loadPatients();
  }, [searchQuery, selectedService, selectedStatus, patientController]);

  const loadPatients = async () => {
    if (!patientController) return;

    if (patientController.ensureLoaded) {
      await patientController.ensureLoaded();
    }

    let filtered = patientController.getAllPatients();

    // Aplica filtro de pesquisa primeiro
    if (searchQuery.trim()) {
      filtered = filtered.filter(patient => {
        const searchLower = searchQuery.toLowerCase();
        return (
          patient.name.toLowerCase().includes(searchLower) ||
          patient.userNumber.toLowerCase().includes(searchLower) ||
          patient.id.toString().includes(searchQuery)
        );
      });
    }

    // Aplica filtro de serviço
    if (selectedService !== 'todos') {
      filtered = filtered.filter(patient => patient.service === selectedService);
    }

    // Aplica filtro de status (mapeia "Internado" para "ativo" e "Alta" para "inativo")
    if (selectedStatus !== 'todos') {
      const statusMap = {
        'Internado': 'ativo',
        'Alta': 'inativo'
      };
      const mappedStatus = statusMap[selectedStatus] || selectedStatus;
      filtered = filtered.filter(patient => patient.status === mappedStatus);
    }

    setPatients(filtered);
  };

  // Obtém serviços únicos dos pacientes
  const availableServices = useMemo(() => {
    if (!patientController) return [];
    const allPatients = patientController.getAllPatients();
    const services = Array.from(new Set(allPatients.map(p => p.service).filter(Boolean)));
    return ['todos', ...services.sort()];
  }, [patientController, patients]);

  const services = availableServices.length > 1 
    ? availableServices 
    : ['todos', 'Cardiologia', 'Neurologia', 'Pediatria', 'Ortopedia', 'Pneumologia', 'Endocrinologia', 'Gastroenterologia', 'Reumatologia'];
  
  const statuses = ['todos', 'Internado', 'Alta'];

  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
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

  const availableServicesList = [
    'Cardiologia',
    'Neurologia',
    'Pediatria',
    'Ortopedia',
    'Pneumologia',
    'Endocrinologia',
    'Gastroenterologia',
    'Reumatologia',
    'Psiquiatria',
    'Clínica Geral',
  ];

  const handleSubmitReferral = () => {
    if (!referralData.newService) {
      Alert.alert('Erro', 'Por favor, selecione o novo serviço');
      return;
    }

    if (!selectedPatient) {
      Alert.alert('Erro', 'Paciente não selecionado');
      return;
    }

    if (referralData.newService === selectedPatient.service) {
      Alert.alert('Erro', 'O novo serviço deve ser diferente do serviço atual');
      return;
    }

    if (validationController) {
      validationController.createValidation({
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        specialty: referralData.newService,
        newService: referralData.newService,
        previousService: selectedPatient.service,
        userNumber: selectedPatient.userNumber,
        requestedBy: 'Sistema',
        reason: referralData.reason,
      });

      Alert.alert(
        'Sucesso',
        `Paciente ${selectedPatient.name} encaminhado para ${referralData.newService}.\n\nA validação está pendente de aprovação pelo médico responsável.`
      );

      setShowReferralModal(false);
      setReferralData({ newService: '', reason: '' });
    } else {
      Alert.alert('Erro', 'Sistema de validação não disponível');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        {/* Barra de pesquisa e filtro */}
        <View style={styles.searchFilterContainer}>
          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color="#566246" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Pesquisar pacientes..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <MaterialIcons name="filter-list" size={20} color="#566246" />
            {(selectedService !== 'todos' || selectedStatus !== 'todos') && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>
                  {(selectedService !== 'todos' ? 1 : 0) + (selectedStatus !== 'todos' ? 1 : 0)}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Patients List */}
        {patients.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="people-outline" size={48} color="#D8DAD3" />
            <Text style={styles.emptyText}>Nenhum paciente encontrado</Text>
            <Text style={styles.emptySubtext}>
              Tente ajustar os filtros de pesquisa
            </Text>
          </View>
        ) : (
          <View style={styles.patientsList}>
            {patients.map((patient) => (
              <TouchableOpacity
                key={patient.id}
                style={styles.patientCard}
                onPress={() => handlePatientClick(patient)}
                activeOpacity={0.7}
              >
                <View style={styles.patientHeader}>
                  <View style={styles.patientInfo}>
                    <Text style={styles.patientName}>{patient.name}</Text>
                    <Text style={styles.patientId}>
                      {patient.userNumber} • {patient.service}
                    </Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    patient.status === 'ativo' ? styles.statusActive : styles.statusInactive
                  ]}>
                    <Text style={[
                      patient.status === 'ativo' ? styles.statusText : styles.statusTextWhite
                    ]}>
                      {patient.status === 'ativo' ? 'Internado' : 'Alta'}
                    </Text>
                  </View>
                </View>

                <View style={styles.patientDetails}>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="local-hospital" size={16} color="#4A4A48" />
                    <Text style={styles.detailValue}>{patient.location || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="assignment" size={16} color="#4A4A48" />
                    <Text style={styles.detailValue} numberOfLines={1}>
                      {patient.diagnosis || 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="calendar-today" size={16} color="#4A4A48" />
                    <Text style={styles.detailValue}>
                      {patient.daysOfHospitalization || 0} dias de internamento
                    </Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <MaterialIcons name="chevron-right" size={24} color="#566246" />
                  <Text style={styles.viewDetailsText}>Ver detalhes</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Modal de filtros */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <MaterialIcons name="close" size={24} color="#566246" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {/* Filtro de Serviço */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Serviço</Text>
                {services.map((service) => (
                  <TouchableOpacity
                    key={service}
                    style={[
                      styles.modalItem,
                      selectedService === service && styles.modalItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedService(service);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        selectedService === service && styles.modalItemTextSelected,
                      ]}
                    >
                      {service === 'todos' ? 'Todos os Serviços' : service}
                    </Text>
                    {selectedService === service && (
                      <MaterialIcons name="check" size={18} color="#566246" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Filtro de Estado */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Estado</Text>
                {statuses.map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.modalItem,
                      selectedStatus === status && styles.modalItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedStatus(status);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        selectedStatus === status && styles.modalItemTextSelected,
                      ]}
                    >
                      {status === 'todos' ? 'Todos' : status}
                    </Text>
                    {selectedStatus === status && (
                      <MaterialIcons name="check" size={18} color="#566246" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Botão de aplicar */}
              <TouchableOpacity
                style={styles.applyFilterButton}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.applyFilterButtonText}>Aplicar Filtros</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de detalhes do paciente */}
      <Modal
        visible={showPatientModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPatientModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.patientModalContent}>
            <View style={styles.patientModalHeader}>
              <Text style={styles.patientModalTitle}>Informações do Paciente</Text>
              <TouchableOpacity onPress={() => setShowPatientModal(false)}>
                <MaterialIcons name="close" size={24} color="#566246" />
              </TouchableOpacity>
            </View>

            {selectedPatient && (
              <ScrollView style={styles.patientModalBody} showsVerticalScrollIndicator={false}>
                {/* Informações Pessoais */}
                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>Informações Pessoais</Text>
                  
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Nome</Text>
                    <Text style={styles.infoValue}>{selectedPatient.name}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{selectedPatient.email || 'N/A'}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Número de Utente</Text>
                    <Text style={styles.infoValue}>{selectedPatient.userNumber}</Text>
                  </View>

                </View>

                {/* Informações Médicas */}
                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>Informações Médicas</Text>
                  
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Diagnóstico</Text>
                    <Text style={styles.infoValue}>{selectedPatient.diagnosis || 'N/A'}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Serviço</Text>
                    <Text style={styles.infoValue}>{selectedPatient.service || 'N/A'}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Estado</Text>
                    <View style={[
                      styles.statusBadgeInline,
                      selectedPatient.status === 'ativo' ? styles.statusActive : styles.statusInactive
                    ]}>
                      <Text style={styles.statusText}>
                        {selectedPatient.status === 'ativo' ? 'Internado' : 'Alta'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Informações de Internamento */}
                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>Internamento</Text>
                  
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Enfermaria</Text>
                    <Text style={styles.infoValue}>{selectedPatient.ward || 'N/A'}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Cama</Text>
                    <Text style={styles.infoValue}>{selectedPatient.bed || 'N/A'}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Localização</Text>
                    <Text style={styles.infoValue}>{selectedPatient.location || 'N/A'}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Data de Admissão</Text>
                    <Text style={styles.infoValue}>{formatDate(selectedPatient.admissionDate)}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Dias de Internamento</Text>
                    <Text style={styles.infoValue}>
                      {selectedPatient.daysOfHospitalization || 0} dias
                    </Text>
                  </View>
                </View>

                {/* Observações */}
                {selectedPatient.observations && (
                  <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Observações</Text>
                    <Text style={styles.observationsText}>{selectedPatient.observations}</Text>
                  </View>
                )}

                {/* Status de Validação */}
                <View style={styles.infoSection}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Validação Pendente</Text>
                    <View style={[
                      styles.statusBadgeInline,
                      selectedPatient.validationPending ? styles.statusPending : styles.statusApproved
                    ]}>
                      <Text style={[
                        styles.statusText,
                        selectedPatient.validationPending && styles.statusTextWhite
                      ]}>
                        {selectedPatient.validationPending ? 'Sim' : 'Não'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Elegível para Alta</Text>
                    <View style={[
                      styles.statusBadgeInline,
                      selectedPatient.eligibleForDischarge ? styles.statusApproved : styles.statusInactive
                    ]}>
                      <Text style={styles.statusText}>
                        {selectedPatient.eligibleForDischarge ? 'Sim' : 'Não'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Botões de Ação */}
                <View style={styles.modalActions}>
                  <View style={styles.modalActionsRow}>
                    <TouchableOpacity
                      style={styles.modalActionButton}
                      onPress={() => {
                        if (selectedPatient && diaryController) {
                          const diaries = diaryController.getDiariesByPatientId(selectedPatient.id);
                          setPatientDiaries(diaries ? diaries.sort((a, b) => new Date(b.date) - new Date(a.date)) : []);
                          setShowDiaryModal(true);
                        }
                      }}
                    >
                      <MaterialIcons name="book" size={18} color="#566246" />
                      <Text style={styles.modalActionButtonText}>Ver Diário</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.modalActionButton}
                      onPress={() => {
                        setShowPatientModal(false);
                        if (onNavigate) onNavigate('relatorio-internamento');
                      }}
                    >
                      <MaterialIcons name="description" size={18} color="#566246" />
                      <Text style={styles.modalActionButtonText}>Ver Relatório</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.modalActionButtonReferral}
                    onPress={() => {
                      setShowPatientModal(false);
                      setShowReferralModal(true);
                    }}
                  >
                    <MaterialIcons name="swap-horiz" size={18} color="#ffffff" />
                    <Text style={styles.modalActionButtonReferralText}>Encaminhar</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
            <View style={styles.patientModalBottomSpacer} />
          </View>
        </View>
      </Modal>

      {/* Modal de Encaminhamento */}
      <Modal
        visible={showReferralModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReferralModal(false)}
      >
        <View style={styles.referralModalOverlay}>
          <View style={styles.referralModalContent}>
            <View style={styles.referralModalHeader}>
              <Text style={styles.referralModalTitle}>Encaminhar Paciente</Text>
              <TouchableOpacity onPress={() => setShowReferralModal(false)}>
                <MaterialIcons name="close" size={24} color="#566246" />
              </TouchableOpacity>
            </View>

            {selectedPatient && (
              <ScrollView style={styles.referralModalBody}>
                <View style={styles.referralInfoSection}>
                  <Text style={styles.referralInfoLabel}>Paciente</Text>
                  <Text style={styles.referralInfoValue}>{selectedPatient.name}</Text>
                </View>

                <View style={styles.referralInfoSection}>
                  <Text style={styles.referralInfoLabel}>Serviço Atual</Text>
                  <Text style={styles.referralInfoValue}>{selectedPatient.service || 'N/A'}</Text>
                </View>

                <View style={styles.referralField}>
                  <Text style={styles.referralLabel}>Novo Serviço *</Text>
                  <TouchableOpacity
                    style={styles.referralSelectContainer}
                    onPress={() => setShowServiceSelectModal(true)}
                  >
                    <Text style={[
                      styles.referralSelectText,
                      referralData.newService && styles.referralSelectTextActive
                    ]}>
                      {referralData.newService || 'Selecione o serviço'}
                    </Text>
                    <MaterialIcons name="arrow-drop-down" size={20} color="#566246" />
                  </TouchableOpacity>
                </View>

                <View style={styles.referralField}>
                  <Text style={styles.referralLabel}>Motivo do Encaminhamento</Text>
                  <TextInput
                    style={styles.referralTextArea}
                    placeholder="Descreva o motivo do encaminhamento..."
                    value={referralData.reason}
                    onChangeText={(text) => setReferralData({ ...referralData, reason: text })}
                    multiline
                    numberOfLines={4}
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.referralModalActions}>
                  <TouchableOpacity
                    style={styles.referralCancelButton}
                    onPress={() => {
                      setShowReferralModal(false);
                      setReferralData({ newService: '', reason: '' });
                    }}
                  >
                    <Text style={styles.referralCancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.referralSubmitButton}
                    onPress={handleSubmitReferral}
                  >
                    <Text style={styles.referralSubmitButtonText}>Encaminhar</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de Seleção de Serviço */}
      <Modal
        visible={showServiceSelectModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowServiceSelectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Serviço</Text>
              <TouchableOpacity onPress={() => setShowServiceSelectModal(false)}>
                <MaterialIcons name="close" size={24} color="#566246" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {availableServicesList
                .filter(s => s !== selectedPatient?.service)
                .map((service) => (
                  <TouchableOpacity
                    key={service}
                    style={[
                      styles.modalItem,
                      referralData.newService === service && styles.modalItemSelected,
                    ]}
                    onPress={() => {
                      setReferralData({ ...referralData, newService: service });
                      setShowServiceSelectModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        referralData.newService === service && styles.modalItemTextSelected,
                      ]}
                    >
                      {service}
                    </Text>
                    {referralData.newService === service && (
                      <MaterialIcons name="check" size={18} color="#566246" />
                    )}
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de Diários Médicos */}
      <Modal
        visible={showDiaryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDiaryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.patientModalContent}>
            <View style={styles.patientModalHeader}>
              <Text style={styles.patientModalTitle}>
                <MaterialIcons name="book" size={22} color="#566246" /> Diários Médicos
              </Text>
              <TouchableOpacity onPress={() => setShowDiaryModal(false)}>
                <MaterialIcons name="close" size={24} color="#566246" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.patientModalBody} showsVerticalScrollIndicator={false}>
              {selectedPatient && (
                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>Paciente: {selectedPatient.name}</Text>
                  <Text style={styles.infoValue}>{selectedPatient.userNumber}</Text>
                </View>
              )}
              
              {patientDiaries.length > 0 ? (
                patientDiaries.map((diary, index) => (
                  <View key={diary.id || index} style={styles.diaryEntry}>
                    <View style={styles.diaryHeader}>
                      <Text style={styles.diaryDate}>{formatDate(diary.date)}</Text>
                      <Text style={styles.diaryNumber}>Registro #{index + 1}</Text>
                    </View>
                    <View style={styles.diaryVitals}>
                      {diary.temperature && (
                        <View style={styles.diaryVitalItem}>
                          <MaterialIcons name="device-thermostat" size={16} color="#4A4A48" />
                          <Text style={styles.diaryVitalText}>{diary.temperature}°C</Text>
                        </View>
                      )}
                      {diary.heartRate && (
                        <View style={styles.diaryVitalItem}>
                          <MaterialIcons name="favorite" size={16} color="#4A4A48" />
                          <Text style={styles.diaryVitalText}>{diary.heartRate} bpm</Text>
                        </View>
                      )}
                      {diary.systolicBP && diary.diastolicBP && (
                        <View style={styles.diaryVitalItem}>
                          <MaterialIcons name="monitor-heart-rate" size={16} color="#4A4A48" />
                          <Text style={styles.diaryVitalText}>{diary.systolicBP}/{diary.diastolicBP}</Text>
                        </View>
                      )}
                      {diary.spO2 && (
                        <View style={styles.diaryVitalItem}>
                          <MaterialIcons name="air" size={16} color="#4A4A48" />
                          <Text style={styles.diaryVitalText}>{diary.spO2}%</Text>
                        </View>
                      )}
                    </View>
                    {(diary.bowelMovement || diary.urinaryOutput) && (
                      <View style={styles.diaryAdditional}>
                        <Text style={styles.diaryAdditionalLabel}>Eliminações:</Text>
                        <Text style={styles.diaryAdditionalText}>{diary.bowelMovement || 'N/A'} / {diary.urinaryOutput || 'N/A'}</Text>
                      </View>
                    )}
                    {diary.medications && diary.medications.length > 0 && (
                      <View style={styles.diaryMedications}>
                        <Text style={styles.diaryMedicationsLabel}>
                          <MaterialIcons name="medication" size={14} color="#566246" /> Medicações:
                        </Text>
                        {diary.medications.map((med, medIndex) => (
                          <Text key={medIndex} style={styles.diaryMedicationsText}>
                            • {med.name} - {med.dosage} {med.time && `(${med.time})`}
                          </Text>
                        ))}
                      </View>
                    )}
                    {diary.exams && diary.exams.length > 0 && (
                      <View style={styles.diaryExams}>
                        <Text style={styles.diaryExamsLabel}>
                          <MaterialIcons name="science" size={14} color="#566246" /> Exames:
                        </Text>
                        {diary.exams.map((exam, examIndex) => (
                          <Text key={examIndex} style={styles.diaryExamsText}>
                            • {exam.type} - {exam.result || 'N/A'} {exam.date && `(${exam.date})`}
                          </Text>
                        ))}
                      </View>
                    )}
                    {diary.diagnosis && (
                      <View style={styles.diaryObservations}>
                        <Text style={styles.diaryObservationsLabel}>Diagnóstico:</Text>
                        <Text style={styles.diaryObservationsText}>{diary.diagnosis}</Text>
                      </View>
                    )}
                    {diary.observations && (
                      <View style={styles.diaryObservations}>
                        <Text style={styles.diaryObservationsLabel}>Observações:</Text>
                        <Text style={styles.diaryObservationsText}>{diary.observations}</Text>
                      </View>
                    )}
                  </View>
                ))
              ) : (
                <View style={styles.emptyDiary}>
                  <MaterialIcons name="book-outline" size={48} color="#D8DAD3" />
                  <Text style={styles.emptyDiaryText}>Nenhum registro de diário encontrado</Text>
                </View>
              )}
            </ScrollView>
            <View style={styles.patientModalBottomSpacer} />
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
    borderWidth: 0,
    borderColor: 'transparent',
  },
  searchFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F2EB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D8DAD3',
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#4A4A48',
    height: '100%',
  },
  filterButton: {
    backgroundColor: '#A4C2A5',
    borderRadius: 10,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    height: 48,
    width: 48,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#f44336',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  patientsList: {
    gap: 12,
  },
  patientCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D8DAD3',
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#566246',
    marginBottom: 4,
  },
  patientId: {
    fontSize: 14,
    color: '#4A4A48',
  },
  statusBadge: {
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginLeft: 10,
  },
  statusActive: {
    backgroundColor: '#A4C2A5',
  },
  statusInactive: {
    backgroundColor: '#D8DAD3',
  },
  statusPending: {
    backgroundColor: '#ff9800',
  },
  statusApproved: {
    backgroundColor: '#A4C2A5',
  },
  statusText: {
    color: '#566246',
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextWhite: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  patientDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 14,
    color: '#566246',
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#D8DAD3',
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#566246',
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#4A4A48',
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#4A4A48',
    marginTop: 4,
    textAlign: 'center',
    opacity: 0.7,
  },
  // Estilos dos modais
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: 40,
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
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#566246',
    marginBottom: 12,
  },
  applyFilterButton: {
    backgroundColor: '#566246',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  applyFilterButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  // Modal de detalhes do paciente
  patientModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '90%',
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  patientModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#D8DAD3',
  },
  patientModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#566246',
  },
  patientModalBody: {
    padding: 20,
    paddingBottom: 20,
  },
  patientModalBottomSpacer: {
    height: 100,
    backgroundColor: '#fff',
    width: '100%',
  },
  diaryEntry: {
    backgroundColor: '#F1F2EB',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D8DAD3',
  },
  diaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D8DAD3',
  },
  diaryDate: {
    fontSize: 14,
    fontWeight: '700',
    color: '#566246',
  },
  diaryNumber: {
    fontSize: 12,
    color: '#4A4A48',
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  diaryVitals: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  diaryVitalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  diaryVitalText: {
    fontSize: 13,
    color: '#566246',
    fontWeight: '600',
  },
  diaryAdditional: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  diaryAdditionalLabel: {
    fontSize: 13,
    color: '#4A4A48',
    fontWeight: '500',
  },
  diaryAdditionalText: {
    fontSize: 13,
    color: '#566246',
  },
  diaryMedications: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#D8DAD3',
  },
  diaryMedicationsLabel: {
    fontSize: 13,
    color: '#566246',
    fontWeight: '600',
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  diaryMedicationsText: {
    fontSize: 12,
    color: '#4A4A48',
    marginLeft: 8,
    marginBottom: 4,
  },
  diaryExams: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#D8DAD3',
  },
  diaryExamsLabel: {
    fontSize: 13,
    color: '#566246',
    fontWeight: '600',
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  diaryExamsText: {
    fontSize: 12,
    color: '#4A4A48',
    marginLeft: 8,
    marginBottom: 4,
  },
  diaryObservations: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#D8DAD3',
  },
  diaryObservationsLabel: {
    fontSize: 13,
    color: '#4A4A48',
    fontWeight: '600',
    marginBottom: 4,
  },
  diaryObservationsText: {
    fontSize: 13,
    color: '#4A4A48',
    lineHeight: 18,
  },
  emptyDiary: {
    padding: 40,
    alignItems: 'center',
  },
  emptyDiaryText: {
    fontSize: 14,
    color: '#4A4A48',
    marginTop: 12,
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#566246',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D8DAD3',
  },
  infoLabel: {
    fontSize: 15,
    color: '#4A4A48',
    fontWeight: '600',
    flex: 1,
  },
  infoValue: {
    fontSize: 15,
    color: '#566246',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  statusBadgeInline: {
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  observationsText: {
    fontSize: 15,
    color: '#4A4A48',
    lineHeight: 22,
    paddingVertical: 12,
  },
  modalActions: {
    marginTop: 20,
    paddingTop: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#D8DAD3',
    gap: 12,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A4C2A5',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 6,
    minHeight: 44,
  },
  modalActionButtonText: {
    fontSize: 13,
    color: '#566246',
    fontWeight: '600',
    flexShrink: 1,
  },
  modalActionButtonReferral: {
    width: '100%',
    backgroundColor: '#566246',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    minHeight: 44,
  },
  modalActionButtonReferralText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  referralModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  referralModalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  referralModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#D8DAD3',
  },
  referralModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#566246',
  },
  referralModalBody: {
    padding: 20,
  },
  referralInfoSection: {
    marginBottom: 20,
  },
  referralInfoLabel: {
    fontSize: 12,
    color: '#4A4A48',
    marginBottom: 4,
    fontWeight: '500',
  },
  referralInfoValue: {
    fontSize: 16,
    color: '#566246',
    fontWeight: '600',
  },
  referralField: {
    marginBottom: 20,
  },
  referralLabel: {
    fontSize: 14,
    color: '#4A4A48',
    marginBottom: 8,
    fontWeight: '600',
  },
  referralSelectContainer: {
    backgroundColor: '#F1F2EB',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D8DAD3',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  referralSelectText: {
    fontSize: 16,
    color: '#999',
  },
  referralSelectTextActive: {
    color: '#4A4A48',
    fontWeight: '600',
  },
  referralTextArea: {
    backgroundColor: '#F1F2EB',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#4A4A48',
    borderWidth: 1,
    borderColor: '#D8DAD3',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  referralModalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  referralCancelButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#D8DAD3',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  referralCancelButtonText: {
    color: '#566246',
    fontSize: 16,
    fontWeight: '700',
  },
  referralSubmitButton: {
    flex: 1,
    backgroundColor: '#566246',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  referralSubmitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default GestaoPacientesView;
