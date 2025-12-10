// Controller: ControladorNavegacao
// Gerencia a navegação e estado do menu

import Menu from '../models/Menu';

class ControladorNavegacao {
  constructor() {
    this.menu = new Menu();
    this.currentRoute = 'inicio';
    this.initializeMenu();
  }

  // Inicializa os itens do menu
  initializeMenu() {
    const menuItems = [
      { id: 'inicio', label: 'Início', route: 'inicio' },
      { id: 'ficha-pessoal', label: 'Ficha Pessoal', route: 'ficha-pessoal' },
      { id: 'validar-pacientes', label: 'Validar Pacientes', route: 'validar-pacientes' },
      { id: 'entrada-paciente', label: 'Entrada Paciente', route: 'entrada-paciente' },
      { id: 'relatorio-internamento', label: 'Relatório de Internamento', route: 'relatorio-internamento' },
      { id: 'gestao-pacientes', label: 'Gestão de Pacientes', route: 'gestao-pacientes' },
      { id: 'diario-paciente', label: 'Diário do Paciente', route: 'diario-paciente' },
      { id: 'mensagens', label: 'Mensagens', route: 'mensagens' },
      { id: 'dar-alta', label: 'Dar Alta', route: 'dar-alta' },
    ];

    menuItems.forEach(item => {
      this.menu.addItem(item);
    });

    this.setActiveRoute('inicio');
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

export default ControladorNavegacao;

