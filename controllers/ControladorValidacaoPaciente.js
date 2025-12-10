// Controller: ControladorValidacaoPaciente
// Gerencia a lógica de validação de pacientes

import ValidacaoPaciente from '../models/ValidacaoPaciente';

class ControladorValidacaoPaciente {
  constructor(patientController = null) {
    this.validations = [];
    this.patientController = patientController;
    this.initializeMockData();
  }

  // Inicializa dados mockados
  initializeMockData() {
    const mockValidations = [
      {
        id: 1,
        patientId: 1,
        patientName: 'Ana Costa',
        specialty: 'Neurologia',
        newService: 'Neurologia',
        previousService: 'Clínica Geral',
        userNumber: 'PT000001',
        requestDate: new Date('2025-01-12').toISOString(),
        status: 'pendente',
        requestedBy: 'Sistema',
        reason: 'Encaminhamento para avaliação neurológica',
      },
      {
        id: 2,
        patientId: 2,
        patientName: 'João Silva',
        specialty: 'Cardiologia',
        newService: 'Cardiologia',
        previousService: 'Clínica Geral',
        userNumber: 'PT000002',
        requestDate: new Date('2025-01-18').toISOString(),
        status: 'pendente',
        requestedBy: 'Sistema',
        reason: 'Encaminhamento para avaliação cardiológica',
      },
    ];

    mockValidations.forEach(validationData => {
      this.validations.push(new ValidacaoPaciente(validationData));
    });
  }

  // Retorna todas as validações pendentes
  getPendingValidations() {
    return this.validations
      .filter(validation => validation.status === 'pendente')
      .map(validation => validation.toJSON());
  }

  // Retorna todas as validações
  getAllValidations() {
    return this.validations.map(validation => validation.toJSON());
  }

  // Aprova uma validação e atualiza o serviço do paciente
  approveValidation(validationId) {
    const validation = this.validations.find(v => v.id === validationId);
    if (validation && validation.status === 'pendente') {
      validation.approve();
      
      // Atualiza o serviço do paciente se houver patientController
      if (this.patientController && validation.patientId && validation.newService) {
        const patient = this.patientController.patients.find(p => p.id === validation.patientId);
        if (patient) {
          // Atualiza o serviço do paciente
          patient.service = validation.newService;
          patient.validationPending = false;
          
          // Salva no Firebase se disponível
          if (this.patientController.saveToFirebase) {
            this.patientController.saveToFirebase();
          }
        }
      }
      
      return validation.toJSON();
    }
    return null;
  }

  // Rejeita uma validação
  rejectValidation(validationId) {
    const validation = this.validations.find(v => v.id === validationId);
    if (validation && validation.status === 'pendente') {
      validation.reject();
      return validation.toJSON();
    }
    return null;
  }

  // Cria uma nova validação (encaminhamento)
  createValidation(validationData) {
    const validation = new ValidacaoPaciente({
      ...validationData,
      id: this.validations.length + 1,
      requestDate: new Date().toISOString(),
      status: 'pendente',
    });
    this.validations.push(validation);
    
    // Marca o paciente como pendente de validação
    if (this.patientController && validationData.patientId) {
      const patient = this.patientController.patients.find(p => p.id === validationData.patientId);
      if (patient) {
        patient.validationPending = true;
      }
    }
    
    return validation.toJSON();
  }

  // Busca validação por ID do paciente
  getValidationByPatientId(patientId) {
    return this.validations
      .filter(v => v.patientId === patientId)
      .map(v => v.toJSON());
  }
}

export default ControladorValidacaoPaciente;

