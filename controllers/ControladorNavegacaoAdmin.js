// Controller: ControladorNavegacaoAdmin
// Gerencia a navegação das telas do administrador

import Menu from '../models/Menu';

class ControladorNavegacaoAdmin {
  constructor() {
    this.menu = new Menu();
    this.currentRoute = 'admin-inicio';
    this.initializeMenu();
  }

  // Inicializa os itens do menu
  initializeMenu() {
    const menuItems = [
      { id: 'admin-inicio', label: 'Início', route: 'admin-inicio' },
      { id: 'admin-dados-hospital', label: 'Dados do Hospital', route: 'admin-dados-hospital' },
      { id: 'admin-gestao-medicos', label: 'Gestão de Médicos', route: 'admin-gestao-medicos' },
      { id: 'admin-gestao-enfermarias', label: 'Gestão de Enfermarias', route: 'admin-gestao-enfermarias' },
      { id: 'admin-gestao-pacientes', label: 'Gestão de Pacientes', route: 'admin-gestao-pacientes' },
      { id: 'admin-gestao-leitos', label: 'Gestão dos Leitos', route: 'admin-gestao-leitos' },
    ];

    menuItems.forEach(item => {
      this.menu.addItem(item);
    });

    this.setActiveRoute('admin-inicio');
  }

  // Define a rota ativa
  setActiveRoute(route) {
    this.currentRoute = route;
    const item = this.menu.getItemById(route);
    if (item) {
      this.menu.setActiveItem(route);
    }
  }

  // Retorna a rota atual
  getCurrentRoute() {
    return this.currentRoute;
  }

  // Retorna os itens do menu
  getMenuItems() {
    return this.menu.getItems();
  }

  // Navega para uma rota
  navigateTo(route) {
    this.setActiveRoute(route);
    return this.currentRoute;
  }
}

export default ControladorNavegacaoAdmin;



