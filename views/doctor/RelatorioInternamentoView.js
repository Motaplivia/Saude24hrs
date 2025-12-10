// View: RelatorioInternamentoView
// Tela de Relatório de Internamento

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

const RelatorioInternamentoView = ({ reportController, diaryController, patientController }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState('todos');
  const [selectedStatus, setSelectedStatus] = useState('todos');
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [patientDiaries, setPatientDiaries] = useState([]);
  const [patientData, setPatientData] = useState(null);

  useEffect(() => {
    loadReports();
  }, [searchQuery, selectedService, selectedStatus, reportController]);

  const loadReports = () => {
    if (!reportController) return;
    
    // Mapeia status para o formato do controller
    const statusMap = {
      'Internado': 'ativos',
      'Alta': 'inativos'
    };
    const mappedStatus = statusMap[selectedStatus] || selectedStatus;
    
    const filteredReports = reportController.searchReports(
      searchQuery || '',
      selectedService === 'todos' ? '' : selectedService,
      mappedStatus === 'todos' ? '' : mappedStatus
    );
    setReports(filteredReports);
    
    // Atualiza o relatório selecionado se não existir mais nos resultados filtrados
    if (filteredReports.length > 0) {
      const currentReportExists = selectedReport && 
        filteredReports.some(r => r.id === selectedReport.id);
      if (!currentReportExists) {
        setSelectedReport(filteredReports[0]);
      }
    } else {
      setSelectedReport(null);
    }
  };

  // Obtém serviços únicos dos relatórios
  const availableServices = useMemo(() => {
    if (!reportController) return [];
    const allReports = reportController.getAllReports();
    const services = Array.from(new Set(allReports.map(r => r.service).filter(Boolean)));
    return ['todos', ...services.sort()];
  }, [reportController]);

  const services = availableServices.length > 1 
    ? availableServices 
    : ['todos', 'Cardiologia', 'Neurologia', 'Pediatria', 'Ortopedia', 'Pneumologia'];
  
  const statuses = ['todos', 'Internado', 'Alta'];

  const handleReportClick = (report) => {
    setSelectedReport(report);
    // Carrega dados completos do paciente e diários
    if (patientController && report.patientId) {
      const patient = patientController.getPatientById(report.patientId);
      setPatientData(patient || null);
    } else {
      setPatientData(null);
    }
    if (diaryController && report.patientId) {
      const diaries = diaryController.getDiariesByPatientId(report.patientId);
      setPatientDiaries(diaries ? diaries.sort((a, b) => new Date(b.date) - new Date(a.date)) : []);
    } else {
      setPatientDiaries([]);
    }
    setShowDetailModal(true);
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

  const generateReportHTML = () => {
    if (!selectedReport) return '';

    const diariesHTML = patientDiaries.map((diary, index) => {
      const medicationsHTML = diary.medications && diary.medications.length > 0
        ? `<div style="margin-top: 10px;">
            <strong style="color: #566246;">Medicações:</strong>
            <ul style="margin-top: 5px; padding-left: 20px;">
              ${diary.medications.map(med => 
                `<li style="margin-bottom: 5px; color: #4A4A48;">
                  ${med.name} - ${med.dosage} ${med.time ? `(${med.time})` : ''}
                </li>`
              ).join('')}
            </ul>
          </div>`
        : '';

      const examsHTML = diary.exams && diary.exams.length > 0
        ? `<div style="margin-top: 10px;">
            <strong style="color: #566246;">Exames:</strong>
            <ul style="margin-top: 5px; padding-left: 20px;">
              ${diary.exams.map(exam => 
                `<li style="margin-bottom: 5px; color: #4A4A48;">
                  ${exam.type} - ${exam.result || 'N/A'} ${exam.date ? `(${exam.date})` : ''}
                </li>`
              ).join('')}
            </ul>
          </div>`
        : '';

      return `
        <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #D8DAD3; border-radius: 8px;">
          <h3 style="color: #566246; margin-bottom: 10px;">Registro ${index + 1} - ${formatDate(diary.date)}</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #D8DAD3;"><strong>Temperatura:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #D8DAD3;">${diary.temperature || 'N/A'}°C</td>
              <td style="padding: 8px; border-bottom: 1px solid #D8DAD3;"><strong>FC:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #D8DAD3;">${diary.heartRate || 'N/A'} bpm</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #D8DAD3;"><strong>PA:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #D8DAD3;">${diary.systolicBP || 'N/A'}/${diary.diastolicBP || 'N/A'} mmHg</td>
              <td style="padding: 8px; border-bottom: 1px solid #D8DAD3;"><strong>SpO2:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #D8DAD3;">${diary.spO2 || 'N/A'}%</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #D8DAD3;"><strong>Eliminações:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #D8DAD3;" colspan="3">${diary.bowelMovement || 'N/A'} / ${diary.urinaryOutput || 'N/A'}</td>
            </tr>
          </table>
          ${medicationsHTML}
          ${examsHTML}
          ${diary.observations ? `<p style="margin-top: 10px; color: #4A4A48;"><strong>Observações:</strong> ${diary.observations}</p>` : ''}
        </div>
      `;
    }).join('');

    const patientInfoHTML = patientData ? `
      <div style="margin-bottom: 20px; padding: 15px; background-color: #F1F2EB; border-radius: 8px;">
        <h2 style="color: #566246; margin-bottom: 15px;">Informações do Paciente</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #D8DAD3;"><strong>Nome:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #D8DAD3;">${patientData.name}</td>
            <td style="padding: 8px; border-bottom: 1px solid #D8DAD3;"><strong>Nº Utente:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #D8DAD3;">${patientData.userNumber || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #D8DAD3;"><strong>Email:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #D8DAD3;">${patientData.email || 'N/A'}</td>
            <td style="padding: 8px; border-bottom: 1px solid #D8DAD3;"><strong>Data Admissão:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #D8DAD3;">${formatDate(patientData.admissionDate)}</td>
          </tr>
        </table>
      </div>
    ` : '';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #4A4A48;
            }
            h1 {
              color: #566246;
              border-bottom: 2px solid #A4C2A5;
              padding-bottom: 10px;
            }
            h2 {
              color: #566246;
              margin-top: 30px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .summary {
              background-color: #F1F2EB;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #D8DAD3;
              text-align: center;
              color: #4A4A48;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>RELATÓRIO DE INTERNAMENTO</h1>
            <p>Data de Emissão: ${formatDate(new Date().toISOString())}</p>
          </div>

          ${patientInfoHTML}

          <div class="summary">
            <h2 style="margin-top: 0;">Resumo do Internamento</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px;"><strong>Diagnóstico:</strong></td>
                <td style="padding: 8px;">${selectedReport.diagnosis || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px;"><strong>Serviço:</strong></td>
                <td style="padding: 8px;">${selectedReport.service || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px;"><strong>Localização:</strong></td>
                <td style="padding: 8px;">${selectedReport.location || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px;"><strong>Dias de Internamento:</strong></td>
                <td style="padding: 8px;">${selectedReport.daysOfHospitalization || 0} dias</td>
              </tr>
              <tr>
                <td style="padding: 8px;"><strong>Status:</strong></td>
                <td style="padding: 8px;">${selectedReport.status === 'ativos' ? 'Internado' : 'Alta'}</td>
              </tr>
            </table>
          </div>

          <div class="summary">
            <h2 style="margin-top: 0;">Médias Vitais</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px;"><strong>Temperatura Média:</strong></td>
                <td style="padding: 8px;">${selectedReport.averages?.temperature || 0}°C</td>
                <td style="padding: 8px;"><strong>FC Média:</strong></td>
                <td style="padding: 8px;">${selectedReport.averages?.heartRate || 0} bpm</td>
                <td style="padding: 8px;"><strong>SpO2 Média:</strong></td>
                <td style="padding: 8px;">${selectedReport.averages?.spO2 || 0}%</td>
              </tr>
            </table>
          </div>

          <h2>Diário Médico Completo</h2>
          <p style="color: #4A4A48; margin-bottom: 15px;">Total de registros: ${patientDiaries.length}</p>
          ${diariesHTML.length > 0 ? diariesHTML : '<p style="color: #4A4A48;">Nenhum registro de diário encontrado.</p>'}

          ${patientData?.observations ? `
            <div style="margin-top: 30px; padding: 15px; background-color: #F1F2EB; border-radius: 8px;">
              <h2 style="margin-top: 0;">Observações Gerais</h2>
              <p style="color: #4A4A48;">${patientData.observations}</p>
            </div>
          ` : ''}

          <div class="footer">
            <p>Relatório gerado automaticamente pelo Sistema Médico</p>
            <p>Este documento é confidencial e destinado exclusivamente ao uso médico.</p>
          </div>
        </body>
      </html>
    `;
  };

  const handleDownload = async () => {
    if (!selectedReport) return;

    try {
      const html = generateReportHTML();
      const { uri } = await Print.printToFileAsync({ html });
      
      const fileName = `Relatorio_${selectedReport.patientName.replace(/\s/g, '_')}_${new Date().getTime()}.pdf`;
      const newUri = FileSystem.documentDirectory + fileName;
      
      await FileSystem.moveAsync({
        from: uri,
        to: newUri,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(newUri);
      } else {
        Alert.alert('Sucesso', `Relatório salvo em: ${newUri}`);
      }
    } catch (error) {
      console.error('Erro ao baixar relatório:', error);
      Alert.alert('Erro', 'Não foi possível baixar o relatório.');
    }
  };

  const handlePrint = async () => {
    if (!selectedReport) return;

    try {
      const html = generateReportHTML();
      await Print.printAsync({ html });
    } catch (error) {
      console.error('Erro ao imprimir relatório:', error);
      Alert.alert('Erro', 'Não foi possível imprimir o relatório.');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        {/* Barra de pesquisa e filtro */}
        <View style={styles.searchFilterContainer}>
          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color="#566246" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Pesquisar relatórios..."
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

        {/* Lista de Relatórios */}
        {reports.length > 0 ? (
          <View style={styles.reportsList}>
            {reports.map((report) => (
              <TouchableOpacity
                key={report.id}
                style={[
                  styles.reportListItem,
                  selectedReport?.id === report.id && styles.reportListItemSelected,
                ]}
                onPress={() => handleReportClick(report)}
              >
                <View style={styles.reportListItemContent}>
                  <View style={styles.reportListItemHeader}>
                    <Text style={styles.reportListItemName}>{report.patientName}</Text>
                    <View style={[
                      styles.statusBadgeSmall,
                      report.status === 'ativos' ? styles.statusActive : styles.statusInactive
                    ]}>
                      <Text style={styles.statusTextSmall}>
                        {report.status === 'ativos' ? 'Internado' : 'Alta'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.reportListItemService}>{report.service}</Text>
                  <Text style={styles.reportListItemLocation}>
                    <MaterialIcons name="location-on" size={14} color="#4A4A48" /> {report.location}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="description" size={48} color="#D8DAD3" />
            <Text style={styles.emptyText}>Nenhum relatório encontrado</Text>
          </View>
        )}

      </View>

      {/* Modal de Filtros */}
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

      {/* Modal de Detalhes Completos */}
      <Modal
        visible={showDetailModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.detailModalContainer}>
          <View style={styles.detailModalHeader}>
            <Text style={styles.detailModalTitle}>Relatório Completo</Text>
            <TouchableOpacity onPress={() => setShowDetailModal(false)}>
              <MaterialIcons name="close" size={24} color="#566246" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.detailModalContent} showsVerticalScrollIndicator={false}>
            {selectedReport && (
              <>
                {/* Informações do Paciente */}
                {patientData && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>
                      <MaterialIcons name="person" size={18} color="#566246" /> Informações do Paciente
                    </Text>
                    <View style={styles.detailInfoGrid}>
                      <View style={styles.detailInfoItem}>
                        <Text style={styles.detailInfoLabel}>Nome</Text>
                        <Text style={styles.detailInfoValue}>{patientData.name}</Text>
                      </View>
                      <View style={styles.detailInfoItem}>
                        <Text style={styles.detailInfoLabel}>Nº Utente</Text>
                        <Text style={styles.detailInfoValue}>{patientData.userNumber || 'N/A'}</Text>
                      </View>
                      <View style={styles.detailInfoItem}>
                        <Text style={styles.detailInfoLabel}>Email</Text>
                        <Text style={styles.detailInfoValue}>{patientData.email || 'N/A'}</Text>
                      </View>
                      <View style={styles.detailInfoItem}>
                        <Text style={styles.detailInfoLabel}>Data Admissão</Text>
                        <Text style={styles.detailInfoValue}>{formatDate(patientData.admissionDate)}</Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Resumo do Internamento */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>
                    <MaterialIcons name="local-hospital" size={18} color="#566246" /> Resumo do Internamento
                  </Text>
                  <View style={styles.detailInfoGrid}>
                    <View style={styles.detailInfoItem}>
                      <Text style={styles.detailInfoLabel}>Diagnóstico</Text>
                      <Text style={styles.detailInfoValue}>{selectedReport.diagnosis || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailInfoItem}>
                      <Text style={styles.detailInfoLabel}>Serviço</Text>
                      <Text style={styles.detailInfoValue}>{selectedReport.service || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailInfoItem}>
                      <Text style={styles.detailInfoLabel}>Localização</Text>
                      <Text style={styles.detailInfoValue}>{selectedReport.location || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailInfoItem}>
                      <Text style={styles.detailInfoLabel}>Dias de Internamento</Text>
                      <Text style={styles.detailInfoValue}>{selectedReport.daysOfHospitalization || 0} dias</Text>
                    </View>
                    <View style={styles.detailInfoItem}>
                      <Text style={styles.detailInfoLabel}>Status</Text>
                      <View style={[
                        styles.statusBadgeInline,
                        selectedReport.status === 'ativos' ? styles.statusActive : styles.statusInactive
                      ]}>
                        <Text style={styles.statusTextInline}>
                          {selectedReport.status === 'ativos' ? 'Internado' : 'Alta'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Médias Vitais */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>
                    <MaterialIcons name="favorite" size={18} color="#566246" /> Médias Vitais
                  </Text>
                  <View style={styles.vitalsGrid}>
                    <View style={styles.vitalCard}>
                      <MaterialIcons name="device-thermostat" size={24} color="#566246" />
                      <Text style={styles.vitalValue}>{selectedReport.averages?.temperature || 0}°C</Text>
                      <Text style={styles.vitalLabel}>Temperatura</Text>
                    </View>
                    <View style={styles.vitalCard}>
                      <MaterialIcons name="favorite" size={24} color="#566246" />
                      <Text style={styles.vitalValue}>{selectedReport.averages?.heartRate || 0}</Text>
                      <Text style={styles.vitalLabel}>FC (bpm)</Text>
                    </View>
                    <View style={styles.vitalCard}>
                      <MaterialIcons name="air" size={24} color="#566246" />
                      <Text style={styles.vitalValue}>{selectedReport.averages?.spO2 || 0}%</Text>
                      <Text style={styles.vitalLabel}>SpO2</Text>
                    </View>
                  </View>
                </View>

                {/* Diário Médico */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>
                    <MaterialIcons name="book" size={18} color="#566246" /> Diário Médico ({patientDiaries.length} registros)
                  </Text>
                  {patientDiaries.length > 0 ? (
                    patientDiaries.map((diary, index) => (
                      <View key={diary.id} style={styles.diaryEntry}>
                        <View style={styles.diaryHeader}>
                          <Text style={styles.diaryDate}>{formatDate(diary.date)}</Text>
                          <Text style={styles.diaryNumber}>Registro #{index + 1}</Text>
                        </View>
                        <View style={styles.diaryVitals}>
                          <View style={styles.diaryVitalItem}>
                            <MaterialIcons name="device-thermostat" size={16} color="#4A4A48" />
                            <Text style={styles.diaryVitalText}>{diary.temperature}°C</Text>
                          </View>
                          <View style={styles.diaryVitalItem}>
                            <MaterialIcons name="favorite" size={16} color="#4A4A48" />
                            <Text style={styles.diaryVitalText}>{diary.heartRate} bpm</Text>
                          </View>
                          <View style={styles.diaryVitalItem}>
                            <MaterialIcons name="monitor-heart-rate" size={16} color="#4A4A48" />
                            <Text style={styles.diaryVitalText}>{diary.systolicBP}/{diary.diastolicBP}</Text>
                          </View>
                          <View style={styles.diaryVitalItem}>
                            <MaterialIcons name="air" size={16} color="#4A4A48" />
                            <Text style={styles.diaryVitalText}>{diary.spO2}%</Text>
                          </View>
                        </View>
                        <View style={styles.diaryAdditional}>
                          <Text style={styles.diaryAdditionalLabel}>Eliminações:</Text>
                          <Text style={styles.diaryAdditionalText}>{diary.bowelMovement} / {diary.urinaryOutput}</Text>
                        </View>
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
                </View>

                {/* Observações Gerais */}
                {patientData?.observations && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>
                      <MaterialIcons name="note" size={18} color="#566246" /> Observações Gerais
                    </Text>
                    <Text style={styles.observationsText}>{patientData.observations}</Text>
                  </View>
                )}

                {/* Botões de Ação no Modal */}
                <View style={styles.detailModalActions}>
                  <TouchableOpacity 
                    style={styles.detailDownloadButton}
                    onPress={handleDownload}
                  >
                    <MaterialIcons name="download" size={20} color="#ffffff" />
                    <Text style={styles.detailDownloadButtonText}>Baixar PDF</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.detailPrintButton}
                    onPress={handlePrint}
                  >
                    <MaterialIcons name="print" size={20} color="#566246" />
                    <Text style={styles.detailPrintButtonText}>Imprimir</Text>
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
  scrollContent: {
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 0,
    padding: 16,
    margin: 0,
    borderWidth: 0,
    borderColor: 'transparent',
    minHeight: '100%',
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
  reportsList: {
    marginBottom: 16,
    gap: 12,
  },
  reportListItem: {
    backgroundColor: '#F1F2EB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D8DAD3',
  },
  reportListItemSelected: {
    backgroundColor: '#A4C2A5',
    borderColor: '#566246',
  },
  reportListItemContent: {
    gap: 6,
  },
  reportListItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportListItemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#566246',
    flex: 1,
  },
  statusBadgeSmall: {
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  statusActive: {
    backgroundColor: '#A4C2A5',
  },
  statusInactive: {
    backgroundColor: '#D8DAD3',
  },
  statusTextSmall: {
    color: '#566246',
    fontSize: 11,
    fontWeight: '600',
  },
  reportListItemService: {
    fontSize: 14,
    color: '#4A4A48',
  },
  reportListItemLocation: {
    fontSize: 12,
    color: '#4A4A48',
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#4A4A48',
    textAlign: 'center',
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
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
    fontWeight: '700',
    color: '#566246',
  },
  modalList: {
    padding: 20,
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
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
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
  detailModalContainer: {
    flex: 1,
    backgroundColor: '#F1F2EB',
  },
  detailModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#D8DAD3',
  },
  detailModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#566246',
  },
  detailModalContent: {
    flex: 1,
    padding: 16,
  },
  detailSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D8DAD3',
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#566246',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailInfoGrid: {
    gap: 12,
  },
  detailInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F2EB',
  },
  detailInfoLabel: {
    fontSize: 14,
    color: '#4A4A48',
    fontWeight: '500',
  },
  detailInfoValue: {
    fontSize: 14,
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
  statusTextInline: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  vitalsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  vitalCard: {
    flex: 1,
    backgroundColor: '#F1F2EB',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8DAD3',
  },
  vitalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#566246',
    marginTop: 8,
    marginBottom: 4,
  },
  vitalLabel: {
    fontSize: 12,
    color: '#4A4A48',
    textAlign: 'center',
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
  observationsText: {
    fontSize: 14,
    color: '#4A4A48',
    lineHeight: 20,
  },
  detailModalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#D8DAD3',
  },
  detailDownloadButton: {
    flex: 1,
    backgroundColor: '#566246',
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  detailDownloadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  detailPrintButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#A4C2A5',
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  detailPrintButtonText: {
    color: '#566246',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default RelatorioInternamentoView;

