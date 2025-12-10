// View: AdminSystemView
// View principal que integra as telas do administrador

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import AdminHomeView from './AdminHomeView';
import HospitalDataView from './HospitalDataView';
import GestaoMedicosView from './GestaoMedicosView';
import PatientManagementView from './PatientManagementView';
import WardManagementView from './WardManagementView';

const AdminSystemView = ({
  user,
  menuItems,
  currentRoute,
  onNavigate,
  onLogout,
  patientController,
  messageController,
  validationController,
  dischargeController,
  diaryController,
  reportController,
  doctorController,
  wardController,
}) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const closeSidebar = () => {
    setSidebarVisible(false);
  };

  const handleNavigate = (route) => {
    closeSidebar();
    onNavigate(route);
  };

  const renderContent = () => {
    switch (currentRoute) {
      case 'admin-inicio':
        return (
          <AdminHomeView
            user={user}
            onNavigate={handleNavigate}
            patientController={patientController}
            messageController={messageController}
            validationController={validationController}
            dischargeController={dischargeController}
            diaryController={diaryController}
            reportController={reportController}
            doctorController={doctorController}
            wardController={wardController}
          />
        );
      case 'admin-dados-hospital':
        return <HospitalDataView />;
      case 'admin-gestao-medicos':
        return <GestaoMedicosView onNavigate={handleNavigate} doctorController={doctorController} />;
      case 'admin-gestao-pacientes':
        return <PatientManagementView patientController={patientController} />;
      case 'admin-gestao-enfermarias':
        return <WardManagementView wardController={wardController} />;
      case 'admin-gestao-leitos':
        return <WardManagementView wardController={wardController} />;
      default:
        return <AdminHomeView />;
    }
  };

  return (
    <View style={styles.container}>
      <AdminHeader
        user={user}
        currentRoute={currentRoute}
        onMenuPress={toggleSidebar}
      />
      <View style={styles.mainContent}>
        <View style={styles.contentArea}>
          {renderContent()}
        </View>
        {sidebarVisible && (
          <>
            <TouchableOpacity
              style={styles.overlay}
              activeOpacity={1}
              onPress={closeSidebar}
            />
            <View style={styles.sidebarContainer}>
              <AdminSidebar
                user={user}
                menuItems={menuItems}
                currentRoute={currentRoute}
                onNavigate={handleNavigate}
                onLogout={onLogout}
              />
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F2EB',
  },
  mainContent: {
    flex: 1,
    position: 'relative',
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#F1F2EB',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  sidebarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default AdminSystemView;



