// Controller: ControladorUsuario
// Gerencia a lógica relacionada ao usuário

import Usuario from '../models/Usuario';

class ControladorUsuario {
  constructor() {
    this.currentUser = null;
  }

  // Inicializa o usuário atual
  initializeUser(userData) {
    this.currentUser = new Usuario(userData);
    return this.currentUser;
  }

  // Retorna o usuário atual
  getCurrentUser() {
    return this.currentUser ? this.currentUser.toJSON() : null;
  }

  // Faz logout do usuário
  logout() {
    this.currentUser = null;
    return true;
  }

  // Atualiza dados do usuário
  updateUser(userData) {
    if (this.currentUser) {
      Object.assign(this.currentUser, userData);
      return this.currentUser.toJSON();
    }
    return null;
  }

  // Faz login do usuário
  login(credentials) {
    // Aqui você faria a validação real com backend
    // Por enquanto, vamos simular um login bem-sucedido
    // Se o email contém "admin", faz login como administrador
    const email = credentials.email || 'Marcos.sousa@gmail.com';
    let userData;

    if (email.toLowerCase().includes('admin') || email.toLowerCase().includes('claudio')) {
      userData = {
        id: 1,
        name: 'Sr. Claudio Sousa',
        email: email,
        role: 'Administrador Geral',
        initials: 'CS',
        phone: '933257841',
      };
    } else {
      userData = {
        id: 1,
        name: 'Dr. Marcos Sousa',
        email: email,
        role: 'Médico',
        initials: 'DM',
        phone: '933257841',
      };
    }

    this.currentUser = new Usuario(userData);
    return this.currentUser.toJSON();
  }

  // Registra um novo usuário
  register(registerData) {
    // Aqui você faria o registro real com backend
    // Por enquanto, vamos simular um registro bem-sucedido
    const userData = {
      id: Date.now(),
      name: registerData.fullName,
      email: registerData.email || `${registerData.userNumber}@hospital.com`,
      role: 'Médico',
      initials: this.getInitialsFromName(registerData.fullName),
      phone: '',
    };
    this.currentUser = new Usuario(userData);
    return this.currentUser.toJSON();
  }

  // Extrai iniciais do nome
  getInitialsFromName(name) {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}

export default ControladorUsuario;

