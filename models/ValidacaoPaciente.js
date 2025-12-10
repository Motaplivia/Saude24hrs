// Model: ValidacaoPaciente
// Representa um registro de validação de paciente pendente

class ValidacaoPaciente {
  constructor(data) {
    this.id = data.id || null;
    this.patientId = data.patientId || null;
    this.patientName = data.patientName || '';
    this.specialty = data.specialty || '';
    this.newService = data.newService || data.specialty || ''; // Novo serviço para o qual está sendo encaminhado
    this.previousService = data.previousService || ''; // Serviço anterior
    this.userNumber = data.userNumber || '';
    this.requestDate = data.requestDate || new Date().toISOString();
    this.status = data.status || 'pendente'; // pendente, aprovado, rejeitado
    this.requestedBy = data.requestedBy || '';
    this.reason = data.reason || ''; // Motivo do encaminhamento
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  getFormattedRequestDate() {
    return this.formatDate(this.requestDate);
  }

  approve() {
    this.status = 'aprovado';
  }

  reject() {
    this.status = 'rejeitado';
  }

  toJSON() {
    return {
      id: this.id,
      patientId: this.patientId,
      patientName: this.patientName,
      specialty: this.specialty,
      newService: this.newService,
      previousService: this.previousService,
      userNumber: this.userNumber,
      requestDate: this.requestDate,
      formattedRequestDate: this.getFormattedRequestDate(),
      status: this.status,
      requestedBy: this.requestedBy,
      reason: this.reason,
    };
  }
}

export default ValidacaoPaciente;



