// View: PatientSystemView
// View principal que integra as telas do paciente

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import PatientHeader from './PatientHeader';
import PatientSidebar from './PatientSidebar';
import PatientHomeView from './PatientHomeView';
import PatientProfileView from './PatientProfileView';
import PatientAllergiesView from './PatientAllergiesView';
import PatientVaccinesView from './PatientVaccinesView';
import PatientScreeningsView from './PatientScreeningsView';
import PatientHistoryView from './PatientHistoryView';
import PatientExamsView from './PatientExamsView';
import PatientPrescriptionsView from './PatientPrescriptionsView';
import PatientMessagesView from './PatientMessagesView';

const PatientSystemView = ({ patient, currentRoute, onNavigate, onMenuPress, onSwitchToDoctor }) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const closeSidebar = () => {
    setSidebarVisible(false);
  };

  const renderContent = () => {
    switch (currentRoute) {
      case 'patient-home':
        return <PatientHomeView patient={patient} onNavigate={onNavigate} />;
      case 'patient-profile':
        return <PatientProfileView patient={patient} onNavigate={onNavigate} />;
      case 'patient-allergies':
        return <PatientAllergiesView patient={patient} />;
      case 'patient-vaccines':
        return <PatientVaccinesView patient={patient} />;
      case 'patient-screenings':
        return <PatientScreeningsView patient={patient} />;
      case 'patient-history':
        return <PatientHistoryView patient={patient} />;
      case 'patient-exams':
        return <PatientExamsView patient={patient} />;
      case 'patient-prescriptions':
        return <PatientPrescriptionsView patient={patient} />;
      case 'patient-messages':
        return <PatientMessagesView patient={patient} />;
      default:
        return <PatientHomeView patient={patient} onNavigate={onNavigate} />;
    }
  };

  return (
    <View style={styles.container}>
      <PatientHeader
        onMenuPress={toggleSidebar}
        onProfilePress={() => onNavigate && onNavigate('patient-profile')}
        onSwitchToDoctor={onSwitchToDoctor}
        currentRoute={currentRoute}
      />
      {sidebarVisible && (
        <PatientSidebar
          patient={patient}
          currentRoute={currentRoute}
          onNavigate={onNavigate}
          onClose={closeSidebar}
        />
      )}
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default PatientSystemView;

