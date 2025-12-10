// Controller: ControladorDiario
// Gerencia a lógica do diário do paciente

import Diario from '../models/Diario';
import ControladorPaciente from './ControladorPaciente';

class ControladorDiario {
  constructor(patientController = null) {
    this.diaries = [];
    this.patientController = patientController || new ControladorPaciente();
    this.initializeMockData();
  }

  // Inicializa dados mockados
  initializeMockData() {
    const today = new Date();
    const startOfDay = (offsetHours = 0) => {
      const date = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        0,
        0,
        0,
        0
      );
      date.setHours(date.getHours() + offsetHours);
      return date.toISOString();
    };

    const mockEntries = [
      {
        id: 1,
        patientId: 1,
        date: startOfDay(-2),
        temperature: 37.2,
        heartRate: 72,
        systolicBP: 118,
        diastolicBP: 76,
        spO2: 97,
        bowelMovement: 'Regular',
        urinaryOutput: 'Adequado',
        diagnosis: 'Insuficiência Cardíaca',
        observations: 'Paciente estável, relatou leve fadiga durante a tarde.',
        medications: [
          { name: 'Furosemida', dosage: '40mg', time: '08:00' },
          { name: 'Enalapril', dosage: '10mg', time: '08:00' },
        ],
        exams: [
          { type: 'Hemograma', result: 'Normal', date: '01/12/2025' },
        ],
      },
      {
        id: 2,
        patientId: 1,
        date: startOfDay(-26),
        temperature: 38.1,
        heartRate: 88,
        systolicBP: 126,
        diastolicBP: 82,
        spO2: 94,
        bowelMovement: 'Regular',
        urinaryOutput: 'Adequado',
        diagnosis: 'Insuficiência Cardíaca',
        observations: 'Febre após fisioterapia, administrado antipirético.',
      },
      {
        id: 3,
        patientId: 2,
        date: startOfDay(-4),
        temperature: 37.8,
        heartRate: 85,
        systolicBP: 124,
        diastolicBP: 78,
        spO2: 92,
        bowelMovement: 'Levemente reduzida',
        urinaryOutput: 'Adequado',
        diagnosis: 'Pneumonia',
        observations: 'Relatou tosse produtiva durante a madrugada.',
      },
      {
        id: 4,
        patientId: 3,
        date: startOfDay(-6),
        temperature: 36.7,
        heartRate: 70,
        systolicBP: 116,
        diastolicBP: 74,
        spO2: 98,
        bowelMovement: 'Regular',
        urinaryOutput: 'Adequado',
        diagnosis: 'Fratura de Fêmur',
        observations: 'Paciente em reabilitação, respondeu bem aos exercícios.',
      },
      {
        id: 5,
        patientId: 5,
        date: startOfDay(-3),
        temperature: 37.5,
        heartRate: 90,
        systolicBP: 130,
        diastolicBP: 84,
        spO2: 95,
        bowelMovement: 'Irregular',
        urinaryOutput: 'Aumentada',
        diagnosis: 'Diabetes',
        observations: 'Relatou hiperglicemia pós-almoço, monitorização reforçada.',
      },
    ];

    mockEntries.forEach(entry => {
      this.diaries.push(new Diario(entry));
    });
  }

  // Cria um novo registro de diário
  createDiary(diaryData) {
    const diary = new Diario({
      ...diaryData,
      id: this.diaries.length + 1,
      date: new Date().toISOString(),
    });
    this.diaries.push(diary);
    return diary.toJSON();
  }

  // Retorna todos os diários
  getAllDiaries() {
    return this.diaries.map(diary => diary.toJSON());
  }

  // Retorna diários de um paciente
  getDiariesByPatientId(patientId) {
    return this.diaries
      .filter(diary => diary.patientId === patientId)
      .map(diary => diary.toJSON());
  }

  // Retorna o último diário de um paciente
  getLastDiaryByPatientId(patientId) {
    const patientDiaries = this.diaries
      .filter(diary => diary.patientId === patientId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return patientDiaries.length > 0 ? patientDiaries[0].toJSON() : null;
  }

  // Retorna os registros mais recentes
  getRecentEntries(limit = 5) {
    return this.diaries
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit)
      .map(diary => diary.toJSON());
  }

  // Retorna um resumo de sinais vitais recentes para um paciente
  getPatientTrendSummary(patientId, lastNDays = 3) {
    const now = new Date();
    const cutoff = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - lastNDays
    );

    const entries = this.diaries
      .filter(entry => entry.patientId === patientId)
      .filter(entry => new Date(entry.date) >= cutoff);

    if (entries.length === 0) {
      return {
        totalEntries: 0,
        averageTemperature: null,
        averageSpO2: null,
        daysWithFever: 0,
        daysWithLowSaturation: 0,
      };
    }

    const aggregates = entries.reduce(
      (acc, entry) => {
        const temp = parseFloat(entry.temperature);
        const spo2 = parseFloat(entry.spO2);

        if (!Number.isNaN(temp)) {
          acc.temperatureSum += temp;
          acc.temperatureCount += 1;
          if (temp >= 38) {
            acc.daysWithFever += 1;
          }
        }

        if (!Number.isNaN(spo2)) {
          acc.spO2Sum += spo2;
          acc.spO2Count += 1;
          if (spo2 < 90) {
            acc.daysWithLowSaturation += 1;
          }
        }

        return acc;
      },
      {
        temperatureSum: 0,
        temperatureCount: 0,
        spO2Sum: 0,
        spO2Count: 0,
        daysWithFever: 0,
        daysWithLowSaturation: 0,
      }
    );

    return {
      totalEntries: entries.length,
      averageTemperature:
        aggregates.temperatureCount > 0
          ? Number((aggregates.temperatureSum / aggregates.temperatureCount).toFixed(1))
          : null,
      averageSpO2:
        aggregates.spO2Count > 0
          ? Number((aggregates.spO2Sum / aggregates.spO2Count).toFixed(0))
          : null,
      daysWithFever: aggregates.daysWithFever,
      daysWithLowSaturation: aggregates.daysWithLowSaturation,
    };
  }
}

export default ControladorDiario;

