// Model: Paciente
// Representa os dados do paciente

class Paciente {
  constructor(data) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.email = data.email || '';
    this.userNumber = data.userNumber || '';
    this.diagnosis = data.diagnosis || '';
    this.service = data.service || '';
    this.ward = data.ward || '';
    this.bed = data.bed || '';
    this.status = data.status || 'ativo';
    this.location = data.location || '';
    this.admissionDate = data.admissionDate || null;
    this.daysOfHospitalization = data.daysOfHospitalization || 0;
    this.observations = data.observations || '';
    this.validationPending = data.validationPending || false;
    this.eligibleForDischarge = data.eligibleForDischarge || false;
    this.password = data.password || '';
    this.accessCode = data.accessCode || '';
  }

  getDaysOfHospitalization() {
    if (this.admissionDate) {
      const today = new Date();
      const admission = new Date(this.admissionDate);
      const diffTime = Math.abs(today - admission);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return this.daysOfHospitalization;
  }

  getLocation() {
    if (this.ward && this.bed) {
      return `${this.ward} - Cama ${this.bed}`;
    }
    return this.location || '';
  }

  toJSON() {
    const json = {
      id: this.id,
      name: this.name,
      email: this.email || '',
      userNumber: this.userNumber,
      diagnosis: this.diagnosis,
      service: this.service,
      ward: this.ward,
      bed: this.bed,
      status: this.status,
      location: this.getLocation(),
      admissionDate: this.admissionDate,
      daysOfHospitalization: this.getDaysOfHospitalization(),
      observations: this.observations,
      validationPending: this.validationPending,
      eligibleForDischarge: this.eligibleForDischarge,
    };
    // Não inclui senha e código de acesso no JSON por segurança
    // Eles só são retornados quando necessário (ex: criação)
    return json;
  }

  // Retorna dados completos incluindo credenciais (apenas para uso interno)
  toJSONWithCredentials() {
    return {
      ...this.toJSON(),
      password: this.password,
      accessCode: this.accessCode,
    };
  }
}

export default Paciente;



