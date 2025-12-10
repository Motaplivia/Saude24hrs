// View: ContentArea
// Componente visual da área de conteúdo principal

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import InicioView from '../doctor/InicioView';
import FichaPessoalView from '../doctor/FichaPessoalView';
import RelatorioInternamentoView from '../doctor/RelatorioInternamentoView';
import GestaoPacientesView from '../doctor/GestaoPacientesView';
import EntradaPacienteView from '../doctor/EntradaPacienteView';
import DiarioPacienteView from '../doctor/DiarioPacienteView';
import AltaView from '../doctor/AltaView';
import MensagensView from '../doctor/MensagensView';
import ValidarPacientesView from '../doctor/ValidarPacientesView';

const ContentArea = ({
  currentRoute,
  user,
  onUpdateUser,
  onNavigate,
  patientController,
  reportController,
  diaryController,
  messageController,
  dischargeController,
  validationController,
  doctorController,
  onAdmit,
  onSaveDiary,
  onDischarge,
  onSendMessage,
  onApproveValidation,
  onRejectValidation,
}) => {
  const renderContent = () => {
    switch (currentRoute) {
      case 'inicio':
        return (
          <InicioView
            user={user}
            patientController={patientController}
            messageController={messageController}
            doctorController={doctorController}
            validationController={validationController}
            onNavigate={onNavigate}
          />
        );
      case 'ficha-pessoal':
        return (
          <FichaPessoalView user={user} doctorController={doctorController} onUpdateUser={onUpdateUser} />
        );
      case 'relatorio-internamento':
        return (
          <RelatorioInternamentoView 
            reportController={reportController}
            diaryController={diaryController}
            patientController={patientController}
          />
        );
      case 'gestao-pacientes':
        return (
          <GestaoPacientesView
            patientController={patientController}
            validationController={validationController}
            diaryController={diaryController}
            onNavigate={onNavigate}
          />
        );
      case 'entrada-paciente':
        return (
          <EntradaPacienteView
            patientController={patientController}
            onAdmit={onAdmit}
          />
        );
      case 'diario-paciente':
        return (
          <DiarioPacienteView
            diaryController={diaryController}
            patientController={patientController}
            onSave={onSaveDiary}
          />
        );
      case 'dar-alta':
        return (
          <AltaView
            dischargeController={dischargeController}
            patientController={patientController}
            diaryController={diaryController}
            onDischarge={onDischarge}
          />
        );
      case 'mensagens':
        return (
          <MensagensView
            messageController={messageController}
            patientController={patientController}
            onSendMessage={onSendMessage}
          />
        );
      case 'validar-pacientes':
        return (
          <ValidarPacientesView
            validationController={validationController}
            patientController={patientController}
            diaryController={diaryController}
            onApprove={onApproveValidation}
            onReject={onRejectValidation}
          />
        );
      default:
        return (
          <View style={styles.contentContainer}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                {currentRoute.charAt(0).toUpperCase() + currentRoute.slice(1).replace('-', ' ')}
              </Text>
              <Text style={styles.cardText}>
                Conteúdo da seção {currentRoute} será exibido aqui.
              </Text>
            </View>
          </View>
        );
    }
  };

  return (
    <View style={styles.contentArea}>
      <ScrollView style={styles.scrollView}>
        {renderContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  contentArea: {
    flex: 1,
    backgroundColor: '#F1F2EB',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#D8DAD3',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#566246',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    color: '#4A4A48',
    lineHeight: 20,
  },
});

export default ContentArea;

