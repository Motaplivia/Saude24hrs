// Model: Diario
// Representa o diário do paciente com sinais vitais

class Diario {
  constructor(data) {
    this.id = data.id || null;
    this.patientId = data.patientId || null;
    this.date = data.date || new Date().toISOString();
    this.temperature = data.temperature || '';
    this.heartRate = data.heartRate || '';
    this.systolicBP = data.systolicBP || '';
    this.diastolicBP = data.diastolicBP || '';
    this.spO2 = data.spO2 || '';
    this.bowelMovement = data.bowelMovement || '';
    this.urinaryOutput = data.urinaryOutput || '';
    this.diagnosis = data.diagnosis || '';
    this.observations = data.observations || '';
    this.medications = data.medications || []; // Array de medicações aplicadas
    this.exams = data.exams || []; // Array de exames realizados
  }

  toJSON() {
    return {
      id: this.id,
      patientId: this.patientId,
      date: this.date,
      temperature: this.temperature,
      heartRate: this.heartRate,
      systolicBP: this.systolicBP,
      diastolicBP: this.diastolicBP,
      spO2: this.spO2,
      bowelMovement: this.bowelMovement,
      urinaryOutput: this.urinaryOutput,
      diagnosis: this.diagnosis,
      observations: this.observations,
      medications: this.medications,
      exams: this.exams,
    };
  }
}

export default Diario;



