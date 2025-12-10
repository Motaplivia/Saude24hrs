// Model: Relatorio
// Representa os relatórios de internamento

class Relatorio {
  constructor(data) {
    this.id = data.id || null;
    this.patientId = data.patientId || null;
    this.patientName = data.patientName || '';
    this.diagnosis = data.diagnosis || '';
    this.service = data.service || '';
    this.location = data.location || '';
    this.status = data.status || 'ativo';
    this.daysOfHospitalization = data.daysOfHospitalization || 0;
    this.averages = data.averages || {
      temperature: 0,
      heartRate: 0,
      spO2: 0,
    };
  }

  toJSON() {
    return {
      id: this.id,
      patientId: this.patientId,
      patientName: this.patientName,
      diagnosis: this.diagnosis,
      service: this.service,
      location: this.location,
      status: this.status,
      daysOfHospitalization: this.daysOfHospitalization,
      averages: this.averages,
    };
  }
}

export default Relatorio;



