// Controller: ControladorPaciente
// Gerencia a lógica relacionada aos pacientes

import Paciente from '../models/Paciente';
import { db } from '../config/firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  orderBy,
  query,
  onSnapshot,
} from 'firebase/firestore';

class ControladorPaciente {
  constructor() {
    this.patients = [];
    this.collectionName = 'pacientes';
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
      console.log('✅ Firebase inicializado e dados de pacientes carregados');
    } catch (error) {
      console.error('Erro ao inicializar pacientes no Firebase:', error);
      // mantém mock local se falhar
    }
  }

  async ensureLoaded() {
    if (!this.initialized) {
      await this.init();
    }
  }

  // Inicializa dados mockados
  initializeMockData() {
    const mockPatients = [
      {
        id: 1,
        name: 'Ana Costa',
        userNumber: 'PT000001',
        diagnosis: 'Insuficiência Cardíaca',
        service: 'Cardiologia',
        ward: 'Enfermaria A',
        bed: '12',
        status: 'ativo',
        admissionDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        observations: '',
        validationPending: false,
        eligibleForDischarge: true,
      },
      {
        id: 2,
        name: 'João Silva',
        userNumber: 'PT000002',
        diagnosis: 'Pneumonia',
        service: 'Pneumologia',
        ward: 'Enfermaria B',
        bed: '5',
        status: 'ativo',
        admissionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        observations: '',
        validationPending: true,
        eligibleForDischarge: false,
      },
      {
        id: 3,
        name: 'Maria Santos',
        userNumber: 'PT000003',
        diagnosis: 'Fratura de Fêmur',
        service: 'Ortopedia',
        ward: 'Enfermaria C',
        bed: '8',
        status: 'ativo',
        admissionDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        observations: '',
        validationPending: true,
        eligibleForDischarge: false,
      },
      {
        id: 4,
        name: 'Pedro Oliveira',
        userNumber: 'PT000004',
        diagnosis: 'Hipertensão',
        service: 'Cardiologia',
        ward: 'Enfermaria A',
        bed: '15',
        status: 'ativo',
        admissionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        observations: '',
        validationPending: false,
        eligibleForDischarge: false,
      },
      {
        id: 5,
        name: 'Carla Mendes',
        userNumber: 'PT000005',
        diagnosis: 'Diabetes',
        service: 'Endocrinologia',
        ward: 'Enfermaria D',
        bed: '3',
        status: 'ativo',
        admissionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        observations: '',
        validationPending: true,
        eligibleForDischarge: false,
      },
      {
        id: 6,
        name: 'Ricardo Alves',
        userNumber: 'PT000006',
        diagnosis: 'Bronquite',
        service: 'Pneumologia',
        ward: 'Enfermaria B',
        bed: '10',
        status: 'ativo',
        admissionDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        observations: '',
        validationPending: false,
        eligibleForDischarge: true,
      },
      {
        id: 7,
        name: 'Sofia Rodrigues',
        userNumber: 'PT000007',
        diagnosis: 'Artrite',
        service: 'Reumatologia',
        ward: 'Enfermaria E',
        bed: '6',
        status: 'ativo',
        admissionDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        observations: '',
        validationPending: false,
        eligibleForDischarge: false,
      },
      {
        id: 8,
        name: 'Miguel Costa',
        userNumber: 'PT000008',
        diagnosis: 'Gastrite',
        service: 'Gastroenterologia',
        ward: 'Enfermaria F',
        bed: '4',
        status: 'ativo',
        admissionDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        observations: '',
        validationPending: false,
        eligibleForDischarge: false,
      },
      {
        id: 9,
        name: 'Beatriz Ferreira',
        userNumber: 'PT000009',
        diagnosis: 'Asma',
        service: 'Pneumologia',
        ward: 'Enfermaria B',
        bed: '7',
        status: 'ativo',
        admissionDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        observations: '',
        validationPending: false,
        eligibleForDischarge: false,
      },
      {
        id: 10,
        name: 'André Sousa',
        userNumber: 'PT000010',
        diagnosis: 'Hepatite',
        service: 'Gastroenterologia',
        ward: 'Enfermaria F',
        bed: '9',
        status: 'ativo',
        admissionDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        observations: '',
        validationPending: false,
        eligibleForDischarge: false,
      },
      {
        id: 11,
        name: 'Inês Martins',
        userNumber: 'PT000011',
        diagnosis: 'Nefrite',
        service: 'Nefrologia',
        ward: 'Enfermaria G',
        bed: '2',
        status: 'ativo',
        admissionDate: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
        observations: '',
        validationPending: false,
        eligibleForDischarge: false,
      },
      {
        id: 12,
        name: 'Tiago Lopes',
        userNumber: 'PT000012',
        diagnosis: 'Dermatite',
        service: 'Dermatologia',
        ward: 'Enfermaria H',
        bed: '1',
        status: 'ativo',
        admissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        observations: '',
        validationPending: false,
        eligibleForDischarge: false,
      },
    ];

    mockPatients.forEach(patientData => {
      this.patients.push(new Paciente(patientData));
    });
  }

  async loadFromDatabase() {
    try {
      const patientsRef = collection(db, this.collectionName);
      const q = query(patientsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      this.patients = [];

      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        this.patients.push(new Paciente({
          id: docSnapshot.id,
          ...data,
        }));
      });

      console.log(`✅ ${this.patients.length} paciente(s) carregado(s) do Firebase`);
    } catch (error) {
      console.error('Erro ao carregar pacientes do Firebase:', error);
      // se falhar, mantém mock existente
    }
  }

  setupRealtimeListener() {
    try {
      const patientsRef = collection(db, this.collectionName);
      const q = query(patientsRef, orderBy('createdAt', 'desc'));

      this.unsubscribe = onSnapshot(q, (snapshot) => {
        const updated = [];
        snapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          updated.push(new Paciente({
            id: docSnapshot.id,
            ...data,
          }));
        });
        this.patients = updated;
        console.log(`📋 Pacientes atualizados em tempo real: ${updated.length}`);
      }, (error) => {
        console.error('Erro no listener de pacientes:', error);
      });
    } catch (error) {
      console.error('Erro ao configurar listener de pacientes:', error);
    }
  }

  // Retorna os próximos atendimentos agendados para o médico
  getUpcomingAppointments(doctorId = null) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const appointments = [
      {
        id: 'apt-001',
        patientId: 1,
        patientName: 'Ana Costa',
        reason: 'Avaliação pós-operatória',
        service: 'Cardiologia',
        ward: 'Enfermaria A',
        bed: '12',
        startTime: new Date(today.getTime() + 9 * 60 * 60 * 1000).toISOString(), // 09:00
        durationMinutes: 30,
      },
      {
        id: 'apt-002',
        patientId: 5,
        patientName: 'Carla Mendes',
        reason: 'Ajuste de medicação',
        service: 'Endocrinologia',
        ward: 'Enfermaria D',
        bed: '3',
        startTime: new Date(today.getTime() + 10 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(), // 10:15
        durationMinutes: 20,
      },
      {
        id: 'apt-003',
        patientId: 3,
        patientName: 'Maria Santos',
        reason: 'Reavaliação ortopédica',
        service: 'Ortopedia',
        ward: 'Enfermaria C',
        bed: '8',
        startTime: new Date(today.getTime() + 11 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(), // 11:30
        durationMinutes: 25,
      },
      {
        id: 'apt-004',
        patientId: 9,
        patientName: 'Beatriz Ferreira',
        reason: 'Consulta respiratória',
        service: 'Pneumologia',
        ward: 'Enfermaria B',
        bed: '7',
        startTime: new Date(today.getTime() + 14 * 60 * 60 * 1000).toISOString(), // 14:00
        durationMinutes: 30,
      },
      {
        id: 'apt-005',
        patientId: 7,
        patientName: 'Sofia Rodrigues',
        reason: 'Avaliação de dor crônica',
        service: 'Reumatologia',
        ward: 'Enfermaria E',
        bed: '6',
        startTime: new Date(today.getTime() + 15 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(), // 15:45
        durationMinutes: 20,
      },
    ];

    return appointments
      .filter(appointment => {
        const start = new Date(appointment.startTime);
        return start >= now;
      })
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  }

  // Gera uma senha aleatória segura
  generatePassword() {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

  // Gera um código de acesso numérico de 6 dígitos
  generateAccessCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Adiciona um novo paciente
  async addPatient(patientData) {
    await this.ensureLoaded();

    // Gera senha e código de acesso
    const password = this.generatePassword();
    const accessCode = this.generateAccessCode();

    const baseData = {
      ...patientData,
      email: patientData.email?.toLowerCase() || '',
      password,
      accessCode,
      admissionDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    try {
      const patientsRef = collection(db, this.collectionName);
      const docRef = await addDoc(patientsRef, baseData);

      const patient = new Paciente({
        id: docRef.id,
        ...baseData,
      });

      const patientWithCredentials = patient.toJSONWithCredentials();

      console.log('✅ Paciente adicionado no Firebase:', patient.toJSON());
      console.log('═══════════════════════════════════════════════════');
      console.log('📧 EMAIL ENVIADO PARA:', patient.email);
      console.log('═══════════════════════════════════════════════════');
      console.log('Olá ' + patient.name + ',');
      console.log('');
      console.log('Bem-vindo ao Sistema Hospitalar!');
      console.log('');
      console.log('Suas credenciais de acesso:');
      console.log('───────────────────────────────────────────────────');
      console.log('📧 Email:', patient.email);
      console.log('🔑 Senha de Acesso:', password);
      console.log('───────────────────────────────────────────────────');
      console.log('');
      console.log('Código de Acesso para Familiares:');
      console.log('───────────────────────────────────────────────────');
      console.log('🔐 Código:', accessCode);
      console.log('───────────────────────────────────────────────────');

      return patientWithCredentials;
    } catch (error) {
      console.error('Erro ao adicionar paciente no Firebase, usando fallback local:', error);

      // fallback local
      const maxId = this.patients.length > 0
        ? Math.max(...this.patients.map(p => p.id || 0))
        : 0;
      const nextId = maxId + 1;

      const patient = new Paciente({
        ...baseData,
        id: nextId,
      });

      this.patients.push(patient);
      return patient.toJSONWithCredentials();
    }
  }

  // Retorna todos os pacientes
  getAllPatients() {
    // Evita duplicados caso algum listener retorne entradas repetidas
    const uniqueById = new Map();
    this.patients.forEach(patient => {
      const key = patient.id || patient.userNumber || `${patient.name}-${patient.email}`;
      if (!uniqueById.has(key)) {
        uniqueById.set(key, patient);
      }
    });
    return Array.from(uniqueById.values()).map(patient => patient.toJSON());
  }

  async validateCredentials(email, password) {
    await this.ensureLoaded();
    const patient = this.patients.find(
      p =>
        (p.email || '').toLowerCase() === (email || '').toLowerCase() &&
        p.password === password
    );
    return patient ? patient.toJSON() : null;
  }

  async getPatientByAccessCode(code) {
    await this.ensureLoaded();
    const patient = this.patients.find(p => p.accessCode === code);
    return patient ? patient.toJSON() : null;
  }

  // Atualiza status ou campos simples do paciente
  async updatePatient(id, data) {
    await this.ensureLoaded();
    const patientIndex = this.patients.findIndex(p => p.id === id || p.id?.toString() === id?.toString());
    if (patientIndex === -1) return null;

    const updated = {
      ...this.patients[patientIndex].toJSONWithCredentials(),
      ...data,
    };

    try {
      const docRef = doc(db, this.collectionName, id.toString());
      await updateDoc(docRef, data);
      this.patients[patientIndex] = new Paciente(updated);
      return this.patients[patientIndex].toJSON();
    } catch (error) {
      console.error('Erro ao atualizar paciente no Firebase:', error);
      this.patients[patientIndex] = new Paciente(updated);
      return this.patients[patientIndex].toJSON();
    }
  }

  // Retorna a estrutura de enfermarias e leitos
  getWardsStructure() {
    return {
      'Enfermaria A': { totalBeds: 20 },
      'Enfermaria B': { totalBeds: 30 },
      'Enfermaria C': { totalBeds: 25 },
      'Enfermaria D': { totalBeds: 15 },
      'Enfermaria E': { totalBeds: 18 },
      'Enfermaria F': { totalBeds: 22 },
      'UTI': { totalBeds: 10 },
      'Enfermaria Pediátrica': { totalBeds: 12 },
    };
  }

  // Retorna leitos ocupados por enfermaria
  getOccupiedBeds() {
    const occupied = {};
    const activePatients = this.patients.filter(p => p.status === 'ativo');
    
    activePatients.forEach(patient => {
      const ward = patient.ward;
      const bed = patient.bed;
      if (ward && bed) {
        if (!occupied[ward]) {
          occupied[ward] = [];
        }
        occupied[ward].push(bed);
      }
    });
    
    return occupied;
  }

  // Retorna enfermarias com leitos disponíveis
  getAvailableWards() {
    const wardsStructure = this.getWardsStructure();
    const occupiedBeds = this.getOccupiedBeds();
    const availableWards = [];

    Object.keys(wardsStructure).forEach(wardName => {
      const totalBeds = wardsStructure[wardName].totalBeds;
      const occupied = occupiedBeds[wardName] || [];
      const availableCount = totalBeds - occupied.length;

      if (availableCount > 0) {
        availableWards.push({
          name: wardName,
          totalBeds: totalBeds,
          occupiedBeds: occupied.length,
          availableBeds: availableCount,
        });
      }
    });

    return availableWards;
  }

  // Retorna leitos disponíveis de uma enfermaria específica
  getAvailableBeds(wardName) {
    const wardsStructure = this.getWardsStructure();
    const ward = wardsStructure[wardName];
    
    if (!ward) {
      return [];
    }

    const occupiedBeds = this.getOccupiedBeds();
    const occupied = occupiedBeds[wardName] || [];
    const totalBeds = ward.totalBeds;
    
    const availableBeds = [];
    for (let i = 1; i <= totalBeds; i++) {
      const bedNumber = i.toString();
      if (!occupied.includes(bedNumber)) {
        availableBeds.push(bedNumber);
      }
    }

    return availableBeds;
  }

  // Busca paciente por ID
  getPatientById(id) {
    const patient = this.patients.find(p => p.id === id);
    return patient ? patient.toJSON() : null;
  }

  // Busca pacientes por nome ou ID
  searchPatients(query) {
    const lowerQuery = query.toLowerCase();
    return this.patients
      .filter(patient => 
        patient.name.toLowerCase().includes(lowerQuery) ||
        patient.userNumber.toLowerCase().includes(lowerQuery) ||
        patient.id.toString().includes(query)
      )
      .map(patient => patient.toJSON());
  }

  // Filtra pacientes por serviço
  filterByService(service) {
    if (service === 'todos' || !service) {
      return this.getAllPatients();
    }
    return this.patients
      .filter(patient => patient.service === service)
      .map(patient => patient.toJSON());
  }

  // Filtra pacientes por status
  filterByStatus(status) {
    if (status === 'todos' || !status) {
      return this.getAllPatients();
    }
    return this.patients
      .filter(patient => patient.status === status)
      .map(patient => patient.toJSON());
  }

  // Retorna estatísticas para o dashboard
  getDashboardStats() {
    const activePatients = this.patients.filter(p => p.status === 'ativo');
    const pendingValidation = this.patients.filter(p => p.validationPending);
    const eligibleForDischarge = this.patients.filter(p => p.eligibleForDischarge);
    // Total de internamentos = todos os pacientes que já foram internados (têm data de admissão)
    const totalInternments = this.patients.filter(p => p.admissionDate).length;

    return {
      activePatientsCount: activePatients.length,
      totalInternments: totalInternments,
      pendingValidationCount: pendingValidation.length,
      eligibleForDischargeCount: eligibleForDischarge.length,
    };
  }

  // Retorna pacientes pendentes de validação
  getPendingValidationPatients() {
    return this.patients
      .filter(patient => patient.validationPending)
      .map(patient => patient.toJSON());
  }

  // Retorna pacientes elegíveis para alta
  getEligibleForDischargePatients() {
    return this.patients
      .filter(patient => patient.eligibleForDischarge)
      .map(patient => patient.toJSON());
  }
}

export default ControladorPaciente;

