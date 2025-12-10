// Controller: ControladorAlta
// Gerencia a lógica de alta de pacientes usando Firebase Firestore

import { db } from '../config/firebase';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import Alta from '../models/Alta';
import ControladorPaciente from './ControladorPaciente';
import ControladorDiario from './ControladorDiario';

class ControladorAlta {
  constructor(patientController = null, diaryController = null) {
    this.patientController = patientController || new ControladorPaciente();
    this.diaryController = diaryController || new ControladorDiario(this.patientController);
    this.discharges = [];
    this.collectionName = 'altas';
    this.initialized = false;
    this.unsubscribe = null;
    this.init();
  }

  // Inicializa o Firebase e carrega os dados
  async init() {
    try {
      await this.loadFromDatabase();
      this.initialized = true;
      this.setupRealtimeListener();
      console.log('✅ Firebase inicializado e altas carregadas');
    } catch (error) {
      console.error('Erro ao inicializar Firebase:', error);
      // Se houver erro, usa dados mockados
      this.initializeMockData();
      // Tenta migrar dados mockados para o Firebase
      await this.migrateMockDataToFirebase();
    }
  }

  // Configura listener em tempo real para atualizações
  setupRealtimeListener() {
    try {
      const dischargesRef = collection(db, this.collectionName);
      const q = query(dischargesRef, orderBy('dischargeDate', 'desc'));
      
      this.unsubscribe = onSnapshot(q, (snapshot) => {
        this.discharges = [];
        snapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          this.discharges.push(new Alta({
            id: docSnapshot.id,
            ...data,
          }));
        });
        console.log('📋 Altas atualizadas em tempo real:', this.discharges.length);
      }, (error) => {
        console.error('Erro no listener de altas:', error);
      });
    } catch (error) {
      console.error('Erro ao configurar listener:', error);
    }
  }

  // Carrega altas do Firebase
  async loadFromDatabase() {
    try {
      const dischargesRef = collection(db, this.collectionName);
      const q = query(dischargesRef, orderBy('dischargeDate', 'desc'));
      const snapshot = await getDocs(q);
      
      this.discharges = [];
      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        this.discharges.push(new Alta({
          id: docSnapshot.id,
          ...data,
        }));
      });
      
      console.log(`✅ ${this.discharges.length} alta(s) carregada(s) do Firebase`);
    } catch (error) {
      console.error('Erro ao carregar altas do Firebase:', error);
      throw error;
    }
  }

  // Migra dados mockados para o Firebase (apenas na primeira vez)
  async migrateMockDataToFirebase() {
    try {
      const dischargesRef = collection(db, this.collectionName);
      const snapshot = await getDocs(dischargesRef);
      
      // Se não houver altas no Firebase, migra as mockadas
      if (snapshot.empty && this.discharges.length > 0) {
        console.log('🔄 Migrando altas mockadas para Firebase...');
        for (const discharge of this.discharges) {
          const dischargeData = discharge.toJSON();
          delete dischargeData.id; // Remove o ID para o Firebase gerar um novo
          await addDoc(dischargesRef, dischargeData);
        }
        console.log('✅ Altas mockadas migradas para Firebase');
        await this.loadFromDatabase();
      }
    } catch (error) {
      console.error('Erro ao migrar altas para Firebase:', error);
    }
  }

  // Inicializa dados mockados
  initializeMockData() {
    const mockDischarges = [
      {
        id: 1,
        patientId: 6,
        patientName: 'Ricardo Alves',
        location: 'Enfermaria B - Cama 10',
        daysOfInternment: 12,
        daysWithFever: 1,
        daysWithLowSaturation: 0,
        dischargeNote:
          'Paciente respondeu bem ao tratamento. Recomendada fisioterapia respiratória domiciliar e acompanhamento em 15 dias.',
        dischargeDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 2,
        patientId: 4,
        patientName: 'Pedro Oliveira',
        location: 'Enfermaria A - Cama 15',
        daysOfInternment: 7,
        daysWithFever: 0,
        daysWithLowSaturation: 0,
        dischargeNote:
          'Quadro de hipertensão controlado. Manter medicação habitual e monitorização domiciliar da pressão arterial.',
        dischargeDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    mockDischarges.forEach(dischargeData => {
      this.discharges.push(new Alta(dischargeData));
    });
  }

  // Garante que os dados estão carregados
  async ensureLoaded() {
    if (!this.initialized) {
      await this.init();
    }
  }

  // Processa a alta de um paciente
  async processDischarge(dischargeData) {
    try {
      await this.ensureLoaded();
      
      const newDischargeData = {
        patientId: dischargeData.patientId,
        patientName: dischargeData.patientName || '',
        location: dischargeData.location || '',
        daysOfInternment: dischargeData.daysOfInternment || 0,
        daysWithFever: dischargeData.daysWithFever || 0,
        daysWithLowSaturation: dischargeData.daysWithLowSaturation || 0,
        dischargeNote: dischargeData.dischargeNote || '',
        dischargeDate: new Date().toISOString(),
      };

      // Adiciona ao Firebase
      const dischargesRef = collection(db, this.collectionName);
      const docRef = await addDoc(dischargesRef, newDischargeData);

      // Atualiza o status do paciente para "Alta" no PatientController
      if (this.patientController && dischargeData.patientId) {
        try {
          await this.patientController.updatePatient(dischargeData.patientId, { status: 'inativo', eligibleForDischarge: false });
          console.log(`✅ Status do paciente ${dischargeData.patientId} atualizado para "Alta"`);
        } catch (error) {
          console.error('Erro ao atualizar status do paciente:', error);
        }
      }

      // Adiciona localmente
      const discharge = new Alta({
        id: docRef.id,
        ...newDischargeData,
      });
      this.discharges.push(discharge);

      console.log('✅ Alta processada no Firebase:', docRef.id);
      return discharge.toJSON();
    } catch (error) {
      console.error('Erro ao processar alta:', error);
      // Fallback: cria apenas localmente
      const discharge = new Alta({
        ...dischargeData,
        id: this.discharges.length + 1,
        dischargeDate: new Date().toISOString(),
      });
      this.discharges.push(discharge);
      return discharge.toJSON();
    }
  }

  // Retorna dados do paciente para alta
  getPatientDischargeData(patientId) {
    const patient = this.patientController.getPatientById(patientId);
    if (!patient) return null;

    const trendSummary = this.diaryController.getPatientTrendSummary(patientId);

    return {
      patientId: patient.id,
      patientName: patient.name,
      location: patient.location,
      daysOfInternment: patient.daysOfHospitalization,
      daysWithFever: trendSummary.daysWithFever,
      daysWithLowSaturation: trendSummary.daysWithLowSaturation,
    };
  }

  // Retorna todas as altas processadas
  getAllDischarges() {
    return this.discharges
      .sort((a, b) => new Date(b.dischargeDate) - new Date(a.dischargeDate))
      .map(discharge => discharge.toJSON());
  }

  // Retorna as últimas altas processadas
  getRecentDischarges(limit = 5) {
    return this.discharges
      .slice()
      .sort((a, b) => new Date(b.dischargeDate) - new Date(a.dischargeDate))
      .slice(0, limit)
      .map(discharge => discharge.toJSON());
  }

  // Limpa o listener quando não for mais necessário
  cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}

export default ControladorAlta;

