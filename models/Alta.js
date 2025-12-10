// Model: Alta
// Representa o processo de alta do paciente

class Alta {
  constructor(data) {
    this.id = data.id || null;
    this.patientId = data.patientId || null;
    this.patientName = data.patientName || '';
    this.location = data.location || '';
    this.daysOfInternment = data.daysOfInternment || 0;
    this.daysWithFever = data.daysWithFever || 0;
    this.daysWithLowSaturation = data.daysWithLowSaturation || 0;
    this.dischargeNote = data.dischargeNote || '';
    this.dischargeDate = data.dischargeDate || null;
  }

  toJSON() {
    return {
      id: this.id,
      patientId: this.patientId,
      patientName: this.patientName,
      location: this.location,
      daysOfInternment: this.daysOfInternment,
      daysWithFever: this.daysWithFever,
      daysWithLowSaturation: this.daysWithLowSaturation,
      dischargeNote: this.dischargeNote,
      dischargeDate: this.dischargeDate,
    };
  }
}

export default Alta;



