// Controller: ControladorNavegacaoPaciente
// Gerencia a navegação das telas do paciente

class ControladorNavegacaoPaciente {
  constructor() {
    this.currentRoute = 'patient-home';
  }

  // Define a rota ativa
  setActiveRoute(route) {
    this.currentRoute = route;
  }

  // Retorna a rota atual
  getCurrentRoute() {
    return this.currentRoute;
  }

  // Navega para uma rota
  navigateTo(route) {
    this.setActiveRoute(route);
    return this.currentRoute;
  }
}

export default ControladorNavegacaoPaciente;

