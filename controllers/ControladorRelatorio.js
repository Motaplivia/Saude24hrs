// Controller: ControladorRelatorio
// Gerencia a lógica dos relatórios de internamento

import Relatorio from '../models/Relatorio';
import ControladorPaciente from './ControladorPaciente';
import ControladorDiario from './ControladorDiario';

class ControladorRelatorio {
  constructor(patientController = null, diaryController = null) {
    this.reports = [];
    this.patientController = patientController || new ControladorPaciente();
    this.diaryController = diaryController || new ControladorDiario(this.patientController);
    this.initializeMockData();
  }

  // Inicializa dados mockados
  initializeMockData() {
    const mockReports = [
      {
        id: 4,
        patientId: 1,
        patientName: 'Ana Costa',
        diagnosis: 'Insuficiência Cardíaca',
        service: 'Cardiologia',
        location: 'Enfermaria A - Cama 12',
        status: 'ativos',
        daysOfHospitalization: 10,
        averages: {
          temperature: 36.9,
          heartRate: 70,
          spO2: 97,
        },
      },
      {
        id: 5,
        patientId: 2,
        patientName: 'João Silva',
        diagnosis: 'Pneumonia',
        service: 'Pneumologia',
        location: 'Enfermaria B - Cama 5',
        status: 'ativos',
        daysOfHospitalization: 5,
        averages: {
          temperature: 37.2,
          heartRate: 75,
          spO2: 95,
        },
      },
      {
        id: 6,
        patientId: 4,
        patientName: 'Pedro Oliveira',
        diagnosis: 'Hipertensão',
        service: 'Cardiologia',
        location: 'Enfermaria A - Cama 15',
        status: 'ativos',
        daysOfHospitalization: 7,
        averages: {
          temperature: 36.7,
          heartRate: 68,
          spO2: 98,
        },
      },
      {
        id: 7,
        patientId: 6,
        patientName: 'Ricardo Alves',
        diagnosis: 'Bronquite',
        service: 'Pneumologia',
        location: 'Enfermaria B - Cama 10',
        status: 'inativos',
        daysOfHospitalization: 12,
        averages: {
          temperature: 37.1,
          heartRate: 82,
          spO2: 94,
        },
      },
    ];

    mockReports.forEach(reportData => {
      this.reports.push(new Relatorio(reportData));
    });
  }

  // Retorna todos os relatórios
  getAllReports() {
    return this.reports.map(report => report.toJSON());
  }

  // Busca relatórios com filtros
  searchReports(searchQuery, service, status) {
    let filtered = [...this.reports];

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(report =>
        report.patientName.toLowerCase().includes(lowerQuery) ||
        report.patientId.toString().includes(searchQuery)
      );
    }

    if (service && service !== 'todos') {
      filtered = filtered.filter(report => report.service === service);
    }

    if (status && status !== 'todos') {
      filtered = filtered.filter(report => report.status === status);
    }

    return filtered.map(report => report.toJSON());
  }

  // Retorna relatório por ID do paciente
  getReportByPatientId(patientId) {
    const report = this.reports.find(r => r.patientId === patientId);
    return report ? report.toJSON() : null;
  }
}

export default ControladorRelatorio;

