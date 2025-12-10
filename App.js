// App Principal
// Integra o padrão MVC: Models, Views e Controllers

import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import HospitalSystemView from './views/shared/HospitalSystemView';
import PatientSystemView from './views/patient/PatientSystemView';
import AdminSystemView from './views/admin/AdminSystemView';
import LoginView from './views/shared/LoginView';
import RegisterView from './views/shared/RegisterView';
import ForgotPasswordView from './views/shared/ForgotPasswordView';
import FamilyAccessView from './views/shared/FamilyAccessView';
import ControladorUsuario from './controllers/ControladorUsuario';
import ControladorNavegacao from './controllers/ControladorNavegacao';
import ControladorNavegacaoPaciente from './controllers/ControladorNavegacaoPaciente';
import ControladorNavegacaoAdmin from './controllers/ControladorNavegacaoAdmin';
import ControladorPaciente from './controllers/ControladorPaciente';
import ControladorRelatorio from './controllers/ControladorRelatorio';
import ControladorDiario from './controllers/ControladorDiario';
import ControladorMensagem from './controllers/ControladorMensagem';
import ControladorAlta from './controllers/ControladorAlta';
import ControladorValidacaoPaciente from './controllers/ControladorValidacaoPaciente';
import ControladorMedico from './controllers/ControladorMedico';
import ControladorEnfermaria from './controllers/ControladorEnfermaria';

export default function App() {
  // Inicializa os controllers
  const [userController] = useState(() => new ControladorUsuario());
  const [navigationController] = useState(() => new ControladorNavegacao());
  const [patientNavigationController] = useState(() => new ControladorNavegacaoPaciente());
  const [adminNavigationController] = useState(() => new ControladorNavegacaoAdmin());
  const [patientController] = useState(() => new ControladorPaciente());
  const [diaryController] = useState(
    () => new ControladorDiario(patientController)
  );
  const [reportController] = useState(
    () => new ControladorRelatorio(patientController, diaryController)
  );
  const [messageController] = useState(() => new ControladorMensagem());
  const [dischargeController] = useState(
    () => new ControladorAlta(patientController, diaryController)
  );
  const [validationController] = useState(() => new ControladorValidacaoPaciente(patientController));
  const [doctorController] = useState(() => new ControladorMedico());
  const [wardController] = useState(() => new ControladorEnfermaria());

  // Estados
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'doctor', 'patient' ou 'admin'
  const [menuItems, setMenuItems] = useState([]);
  const [currentRoute, setCurrentRoute] = useState('inicio');
  const [patientRoute, setPatientRoute] = useState('patient-home');
  const [adminRoute, setAdminRoute] = useState('admin-inicio');
  const [authScreen, setAuthScreen] = useState('login'); // 'login', 'register', 'forgot-password', 'family-access'

  // Inicializa os dados apenas se o usuário estiver logado
  useEffect(() => {
    if (user) {
      if (userType === 'admin') {
        // Inicializa o menu do admin
        const items = adminNavigationController.getMenuItems();
        setMenuItems(items);
        setAdminRoute(adminNavigationController.getCurrentRoute());
      } else if (userType === 'patient') {
        // Menu do paciente já é gerenciado pelo PatientNavigationController
      } else {
        // Inicializa o menu do médico
        const items = navigationController.getMenuItems();
        setMenuItems(items);
        setCurrentRoute(navigationController.getCurrentRoute());
      }
    }
  }, [user, userType]);

  // Atualiza o menu quando a rota do admin mudar
  useEffect(() => {
    if (userType === 'admin' && adminRoute) {
      adminNavigationController.setActiveRoute(adminRoute);
      const items = adminNavigationController.getMenuItems();
      setMenuItems(items);
    }
  }, [adminRoute, userType]);

  // Handler para navegação
  const handleNavigate = (route) => {
    navigationController.navigateTo(route);
    setCurrentRoute(navigationController.getCurrentRoute());
    setMenuItems(navigationController.getMenuItems());
  };

  // Handler para logout
  const handleLogout = () => {
    userController.logout();
    setUser(null);
    setAuthScreen('login');
    console.log('Usuário deslogado');
  };

  // Handler para login
  const handleLogin = (credentials) => {
    // Se já veio credencial com role (ex: paciente/familiar), respeita
    const loggedUser = credentials?.role
      ? credentials
      : userController.login(credentials);

    setUser(loggedUser);

    // Determina o tipo de usuário baseado no role
    if (loggedUser.role === 'Administrador Geral') {
      setUserType('admin');
    } else if (loggedUser.role === 'Paciente') {
      setUserType('patient');
    } else if (loggedUser.role === 'Familiar') {
      setUserType('patient');
    } else {
      setUserType('doctor');
    }

    console.log('Usuário logado:', loggedUser);
  };

  // Handler para registro
  const handleRegister = (registerData) => {
    const registeredUser = userController.register(registerData);
    // Após registro, redireciona para login
    setAuthScreen('login');
    console.log('Usuário registrado. Faça login para continuar.');
  };

  // Handler para navegar para registro
  const handleNavigateToRegister = () => {
    setAuthScreen('register');
  };

  // Handler para navegar para login
  const handleNavigateToLogin = () => {
    setAuthScreen('login');
  };

  // Handler para esqueceu senha
  const handleForgotPassword = () => {
    setAuthScreen('forgot-password');
  };

  // Handler para acesso de familiares
  const handleFamilyAccess = () => {
    setAuthScreen('family-access');
  };

  // Handler para atualizar usuário
  const handleUpdateUser = (userData) => {
    const updatedUser = userController.updateUser(userData);
    setUser(updatedUser);
    console.log('Usuário atualizado');
  };

  // Handler para admissão de paciente
  const handleAdmit = async (patientData) => {
    const newPatient = await patientController.addPatient(patientData);
    console.log('Paciente admitido:', newPatient);
    // As credenciais já são exibidas no console pelo controller
    return newPatient; // Retorna com credenciais para uso na view
  };

  // Handler para salvar diário
  const handleSaveDiary = async (diaryData) => {
    const newDiary = await diaryController.createDiary(diaryData);
    console.log('Diário salvo:', newDiary);
  };

  // Handler para dar alta
  const handleDischarge = async (dischargeData) => {
    try {
      const discharge = await dischargeController.processDischarge(dischargeData);
      console.log('Alta processada:', discharge);
      return discharge;
    } catch (error) {
      console.error('Erro ao processar alta:', error);
      throw error;
    }
  };

  // Handler para enviar mensagem
  const handleSendMessage = (messageId, response) => {
    const message = messageController.answerMessage(messageId, response);
    console.log('Mensagem respondida:', message);
  };

  // Handler para aprovar validação
  const handleApproveValidation = (validationId) => {
    const validation = validationController.approveValidation(validationId);
    console.log('Validação aprovada:', validation);
  };

  // Handler para rejeitar validação
  const handleRejectValidation = (validationId) => {
    const validation = validationController.rejectValidation(validationId);
    console.log('Validação rejeitada:', validation);
  };

  // Handler para alternar para modo paciente
  const handleSwitchToPatient = () => {
    setUserType('patient');
    setPatientRoute('patient-home');
    console.log('Alternado para modo paciente');
  };

  // Handler para alternar para modo admin
  const handleSwitchToAdmin = () => {
    adminNavigationController.navigateTo('admin-inicio');
    setMenuItems(adminNavigationController.getMenuItems());
    setAdminRoute(adminNavigationController.getCurrentRoute());
    setUserType('admin');
    console.log('Alternado para modo admin');
  };

  // Handler para alternar para modo médico
  const handleSwitchToDoctor = () => {
    setUserType('doctor');
    setCurrentRoute('inicio');
    console.log('Alternado para modo médico');
  };

  // Se não há usuário logado, mostra tela de autenticação
  if (!user) {
    return (
      <>
        <StatusBar style="auto" />
        {authScreen === 'login' ? (
          <LoginView
            onLogin={handleLogin}
            onForgotPassword={handleForgotPassword}
            doctorController={doctorController}
            patientController={patientController}
          />
        ) : authScreen === 'register' ? (
          <RegisterView
            onRegister={handleRegister}
            onNavigateToLogin={handleNavigateToLogin}
          />
        ) : authScreen === 'forgot-password' ? (
          <ForgotPasswordView
            onBack={() => setAuthScreen('login')}
            doctorController={doctorController}
            patientController={patientController}
          />
        ) : authScreen === 'family-access' ? (
          <FamilyAccessView
            onLogin={handleLogin}
            onBack={() => setAuthScreen('login')}
            patientController={patientController}
          />
        ) : null}
      </>
    );
  }

  // Handler para navegação do paciente
  const handlePatientNavigate = (route) => {
    patientNavigationController.navigateTo(route);
    setPatientRoute(patientNavigationController.getCurrentRoute());
  };

  // Handler para navegação do admin
  const handleAdminNavigate = (route) => {
    adminNavigationController.navigateTo(route);
    setAdminRoute(adminNavigationController.getCurrentRoute());
    setMenuItems(adminNavigationController.getMenuItems());
  };

  // Se há usuário logado, mostra o sistema apropriado
  if (userType === 'admin') {
    return (
      <>
        <StatusBar style="auto" />
        <AdminSystemView
          user={user}
          menuItems={menuItems}
          currentRoute={adminRoute}
          onNavigate={handleAdminNavigate}
          onLogout={handleLogout}
          patientController={patientController}
          messageController={messageController}
          validationController={validationController}
          dischargeController={dischargeController}
          diaryController={diaryController}
          reportController={reportController}
          doctorController={doctorController}
          wardController={wardController}
        />
      </>
    );
  }

  if (userType === 'patient') {
    // Busca dados do paciente
    const currentPatient = patientController.getPatientById(user?.patientId) || {
      id: '4369325233',
      name: 'Maria de Fatima',
      initials: 'MF',
      userNumber: '4369325233',
      email: 'mariafatima@gmail.com',
      phone: '96342462',
    };

    return (
      <>
        <StatusBar style="auto" />
        <PatientSystemView
          patient={currentPatient}
          currentRoute={patientRoute}
          onNavigate={handlePatientNavigate}
          onSwitchToDoctor={null}
        />
      </>
    );
  }

  // Sistema do médico
  return (
    <>
      <StatusBar style="auto" />
      <HospitalSystemView
        user={user}
        menuItems={menuItems}
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        onUpdateUser={handleUpdateUser}
        onSwitchToPatient={handleSwitchToPatient}
        onSwitchToAdmin={handleSwitchToAdmin}
        patientController={patientController}
        reportController={reportController}
        diaryController={diaryController}
        messageController={messageController}
        dischargeController={dischargeController}
        validationController={validationController}
        doctorController={doctorController}
        onAdmit={handleAdmit}
        onSaveDiary={handleSaveDiary}
        onDischarge={handleDischarge}
        onSendMessage={handleSendMessage}
        onApproveValidation={handleApproveValidation}
        onRejectValidation={handleRejectValidation}
      />
    </>
  );
}
