// View: HospitalSystemView
// View principal que integra todos os componentes

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Header from './Header';
import Sidebar from './Sidebar';
import ContentArea from './ContentArea';

const HospitalSystemView = ({
  user,
  menuItems,
  currentRoute,
  onNavigate,
  onLogout,
  onUpdateUser,
  onSwitchToPatient,
  onSwitchToAdmin,
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

  return (
    <View style={styles.container}>
      <Header
        user={user}
        currentRoute={currentRoute}
        onMenuPress={toggleSidebar}
      />
      <View style={styles.mainContent}>
        <ContentArea
          currentRoute={currentRoute}
          user={user}
          onUpdateUser={onUpdateUser}
          onNavigate={handleNavigate}
          patientController={patientController}
          reportController={reportController}
          diaryController={diaryController}
          messageController={messageController}
          dischargeController={dischargeController}
          validationController={validationController}
          doctorController={doctorController}
          onAdmit={onAdmit}
          onSaveDiary={onSaveDiary}
          onDischarge={onDischarge}
          onSendMessage={onSendMessage}
          onApproveValidation={onApproveValidation}
          onRejectValidation={onRejectValidation}
        />
        {sidebarVisible && (
          <>
            <TouchableOpacity
              style={styles.overlay}
              activeOpacity={1}
              onPress={closeSidebar}
            />
            <View style={styles.sidebarContainer}>
              <Sidebar
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

export default HospitalSystemView;

