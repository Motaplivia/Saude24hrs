// Controller: ControladorDiario
// Gerencia a lógica do diário do paciente

import Diario from '../models/Diario';
import ControladorPaciente from './ControladorPaciente';
import { db } from '../config/firebase';
import {
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';

class ControladorDiario {
  constructor(patientController = null) {
    this.diaries = [];
    this.patientController = patientController || new ControladorPaciente();
    this.collectionName = 'diarios';
    this.initialized = false;
    this.unsubscribe = null;
    this.initializeMockData();
    this.init();
  }

  async init() {
    try {
      await this.loadFromDatabase();
      this.initialized = true;
      this.setupRealtimeListener();
      console.log('✅ Firebase inicializado e diários carregados');
    } catch (error) {
      console.error('Erro ao inicializar diários no Firebase:', error);
      // mantém dados mock se falhar
    }
  }

  async ensureLoaded() {
    if (!this.initialized) {
      await this.init();
    }
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

  async loadFromDatabase() {
    try {
      const diariesRef = collection(db, this.collectionName);
      const q = query(diariesRef, orderBy('date', 'desc'));
      const snapshot = await getDocs(q);

      this.diaries = [];
      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        this.diaries.push(new Diario({
          id: docSnapshot.id,
          ...data,
        }));
      });

      console.log(`✅ ${this.diaries.length} diário(s) carregado(s) do Firebase`);
    } catch (error) {
      console.error('Erro ao carregar diários do Firebase:', error);
    }
  }

  setupRealtimeListener() {
    try {
      const diariesRef = collection(db, this.collectionName);
      const q = query(diariesRef, orderBy('date', 'desc'));
      this.unsubscribe = onSnapshot(q, (snapshot) => {
        const updated = [];
        snapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          updated.push(new Diario({
            id: docSnapshot.id,
            ...data,
          }));
        });
        this.diaries = updated;
        console.log('📒 Diários atualizados em tempo real:', updated.length);
      }, (error) => {
        console.error('Erro no listener de diários:', error);
      });
    } catch (error) {
      console.error('Erro ao configurar listener de diários:', error);
    }
  }

  // Cria um novo registro de diário
  async createDiary(diaryData) {
    await this.ensureLoaded();
    const newDiaryData = {
      ...diaryData,
      date: new Date().toISOString(),
    };

    try {
      const diariesRef = collection(db, this.collectionName);
      const docRef = await addDoc(diariesRef, newDiaryData);
      // Não adiciona localmente para evitar duplicação; listener atualizará o array
      return {
        id: docRef.id,
        ...newDiaryData,
      };
    } catch (error) {
      console.error('Erro ao gravar diário no Firebase, salvando localmente:', error);
      const diary = new Diario({
        ...newDiaryData,
        id: this.diaries.length + 1,
      });
      this.diaries.push(diary);
      return diary.toJSON();
    }
  }

  // Retorna todos os diários
  getAllDiaries() {
    const uniqueById = new Map();
    this.diaries.forEach(diary => {
      const key = diary.id || `${diary.patientId}-${diary.date}`;
      if (!uniqueById.has(key)) {
        uniqueById.set(key, diary);
      }
    });
    return Array.from(uniqueById.values()).map(diary => diary.toJSON());
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

