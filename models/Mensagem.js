// Model: Mensagem
// Representa as mensagens entre paciente e médico

class Mensagem {
  constructor(data) {
    this.id = data.id || null;
    this.patientId = data.patientId || null;
    this.patientName = data.patientName || '';
    this.date = data.date || new Date().toISOString();
    this.patientMessage = data.patientMessage || '';
    this.doctorResponse = data.doctorResponse || '';
    this.status = data.status || 'pendente'; // pendente ou respondida
    this.answeredAt = data.answeredAt || null;
  }

  markAsAnswered(response) {
    this.doctorResponse = response;
    this.status = 'respondida';
    this.answeredAt = new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      patientId: this.patientId,
      patientName: this.patientName,
      date: this.date,
      patientMessage: this.patientMessage,
      doctorResponse: this.doctorResponse,
      status: this.status,
      answeredAt: this.answeredAt,
    };
  }
}

export default Mensagem;



