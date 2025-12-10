// Controller: ControladorMedico
// Gerencia a lógica relacionada aos médicos usando Firebase Firestore

import { db } from '../config/firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  setDoc,
} from 'firebase/firestore';

class ControladorMedico {
  constructor() {
    this.doctors = [];
    this.nextId = 1;
    this.collectionName = 'medicos';
    this.initialized = false;
    this.init();
  }

  // Inicializa o Firebase e carrega os dados
  async init() {
    try {
      await this.loadFromDatabase();
      this.initialized = true;
      console.log('✅ Firebase inicializado e dados carregados');
    } catch (error) {
      console.error('Erro ao inicializar Firebase:', error);
      // Se houver erro, usa dados mockados
      this.initializeMockData();
      // Tenta migrar dados mockados para o Firebase
      await this.migrateMockDataToFirebase();
    }
  }

  // Migra dados mockados para o Firebase (apenas na primeira vez)
  async migrateMockDataToFirebase() {
    try {
      const doctorsRef = collection(db, this.collectionName);
      const snapshot = await getDocs(doctorsRef);
      
      // Se não houver médicos no Firebase, migra os mockados
      if (snapshot.empty && this.doctors.length > 0) {
        console.log('🔄 Migrando dados mockados para Firebase...');
        for (const doctor of this.doctors) {
          await addDoc(doctorsRef, {
            ...doctor,
            createdAt: new Date().toISOString(),
          });
        }
        console.log('✅ Dados mockados migrados para Firebase');
      }
    } catch (error) {
      console.error('Erro ao migrar dados para Firebase:', error);
    }
  }

  // Carrega médicos do Firebase
  async loadFromDatabase() {
    try {
      const doctorsRef = collection(db, this.collectionName);
      const snapshot = await getDocs(doctorsRef);
      
      this.doctors = [];
      
      if (!snapshot.empty) {
        snapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          this.doctors.push({
            id: docSnapshot.id,
            ...data,
          });
        });
        
        // Ordena por ID numérico se existir, senão por nome
        this.doctors.sort((a, b) => {
          if (a.id && b.id && typeof a.id === 'number' && typeof b.id === 'number') {
            return a.id - b.id;
          }
          return (a.name || '').localeCompare(b.name || '');
        });
        
        // Calcula o próximo ID baseado no maior ID existente
        const numericIds = this.doctors
          .map(d => typeof d.id === 'number' ? d.id : 0)
          .filter(id => id > 0);
        this.nextId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;
      } else {
        // Se não houver médicos, inicializa com dados mockados
        this.initializeMockData();
        await this.migrateMockDataToFirebase();
        await this.loadFromDatabase(); // Recarrega após migração
      }
      
      console.log(`✅ ${this.doctors.length} médico(s) carregado(s) do Firebase`);
    } catch (error) {
      console.error('Erro ao carregar do Firebase:', error);
      // Se houver erro, usa dados mockados
      this.initializeMockData();
    }
  }

  // Inicializa dados mockados
  initializeMockData() {
    this.doctors = [
      { 
        id: 1, 
        name: 'Dr Marcos Souza', 
        email: 'marcos.souza@hospital.com',
        phone: '912345678',
        specialty: 'Cardiologia', 
        status: 'Ativo', 
        initials: 'MS',
        orderNumber: '0M01001',
        password: 'temp123'
      },
      { 
        id: 2, 
        name: 'Dra Suzana Mende', 
        email: 'suzana.mende@hospital.com',
        phone: '912345679',
        specialty: 'Radiologia', 
        status: 'Ativo', 
        initials: 'SM',
        orderNumber: '0M01002',
        password: 'temp123'
      },
      { 
        id: 3, 
        name: 'Dr João Silva', 
        email: 'joao.silva@hospital.com',
        phone: '912345680',
        specialty: 'Cardiologia', 
        status: 'Ativo', 
        initials: 'JS',
        orderNumber: '0M01003',
        password: 'temp123'
      },
      { 
        id: 4, 
        name: 'Dra Ana Costa', 
        email: 'ana.costa@hospital.com',
        phone: '912345681',
        specialty: 'Pediatria', 
        status: 'Ativo', 
        initials: 'AC',
        orderNumber: '0M01004',
        password: 'temp123'
      },
      { 
        id: 5, 
        name: 'Dr Pedro Santos', 
        email: 'pedro.santos@hospital.com',
        phone: '912345682',
        specialty: 'Ortopedia', 
        status: 'Ativo', 
        initials: 'PS',
        orderNumber: '0M01005',
        password: 'temp123'
      },
      { 
        id: 6, 
        name: 'Dra Maria Oliveira', 
        email: 'maria.oliveira@hospital.com',
        phone: '912345683',
        specialty: 'Neurologia', 
        status: 'Inativo', 
        initials: 'MO',
        orderNumber: '0M01006',
        password: 'temp123'
      },
      { 
        id: 7, 
        name: 'Dr Carlos Mendes', 
        email: 'carlos.mendes@hospital.com',
        phone: '912345684',
        specialty: 'Cardiologia', 
        status: 'Inativo', 
        initials: 'CM',
        orderNumber: '0M01007',
        password: 'temp123'
      },
      { 
        id: 8, 
        name: 'Dra Sofia Alves', 
        email: 'sofia.alves@hospital.com',
        phone: '912345685',
        specialty: 'Radiologia', 
        status: 'Inativo', 
        initials: 'SA',
        orderNumber: '0M01008',
        password: 'temp123'
      },
    ];
    this.nextId = 9;
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

  // Extrai iniciais do nome
  getInitialsFromName(name) {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  // Garante que os dados estão carregados
  async ensureLoaded() {
    if (!this.initialized) {
      await this.init();
    }
    if (this.doctors.length === 0) {
      await this.loadFromDatabase();
    }
  }

  // Retorna todos os médicos
  getAllDoctors() {
    return this.doctors.map(doctor => {
      // Remove a senha do retorno por segurança
      const { password, ...doctorWithoutPassword } = doctor;
      return doctorWithoutPassword;
    });
  }

  // Retorna um médico por ID
  getDoctorById(id) {
    const doctor = this.doctors.find(d => d.id === id || d.id?.toString() === id?.toString());
    if (doctor) {
      const { password, ...doctorWithoutPassword } = doctor;
      return doctorWithoutPassword;
    }
    return null;
  }

  // Retorna um médico por email (para login)
  getDoctorByEmail(email) {
    return this.doctors.find(d => d.email.toLowerCase() === email.toLowerCase());
  }

  // Adiciona um novo médico
  async addDoctor(doctorData) {
    try {
      // Valida se o email já existe
      await this.ensureLoaded();
      const existingDoctor = this.doctors.find(d => d.email.toLowerCase() === doctorData.email.toLowerCase());
      if (existingDoctor) {
        throw new Error('Já existe um médico cadastrado com este email');
      }

      // Gera senha aleatória
      const password = this.generatePassword();

      // Cria o novo médico
      const newDoctorData = {
        name: doctorData.fullName,
        email: doctorData.email.toLowerCase(),
        phone: doctorData.phone || '',
        specialty: doctorData.specialty,
        orderNumber: doctorData.orderNumber || '',
        status: doctorData.status || 'Ativo',
        initials: this.getInitialsFromName(doctorData.fullName),
        password: password,
        createdAt: new Date().toISOString(),
      };

      // Adiciona ao Firebase
      const doctorsRef = collection(db, this.collectionName);
      const docRef = await addDoc(doctorsRef, newDoctorData);

      // Adiciona ao array local
      const newDoctor = {
        id: docRef.id,
        ...newDoctorData,
      };
      this.doctors.push(newDoctor);

      console.log('✅ Médico adicionado ao Firebase:', docRef.id);

      // Retorna o médico com a senha (para exibir no console)
      return {
        ...newDoctor,
        password: password,
      };
    } catch (error) {
      console.error('Erro ao adicionar médico:', error);
      throw error;
    }
  }

  // Atualiza um médico existente
  async updateDoctor(id, doctorData) {
    try {
      await this.ensureLoaded();
      const doctor = this.doctors.find(d => d.id === id || d.id?.toString() === id?.toString());
      
      if (!doctor) {
        return null;
      }

      // Mantém a senha existente
      const existingPassword = doctor.password;

      const updateData = {
        name: doctorData.fullName || doctor.name,
        email: doctorData.email ? doctorData.email.toLowerCase() : doctor.email,
        phone: doctorData.phone || doctor.phone,
        specialty: doctorData.specialty || doctor.specialty,
        orderNumber: doctorData.orderNumber || doctor.orderNumber,
        status: doctorData.status || doctor.status,
        initials: doctorData.fullName ? this.getInitialsFromName(doctorData.fullName) : doctor.initials,
        password: existingPassword,
        updatedAt: new Date().toISOString(),
      };

      // Atualiza no Firebase
      const doctorRef = doc(db, this.collectionName, doctor.id.toString());
      await updateDoc(doctorRef, updateData);

      // Atualiza no array local
      const index = this.doctors.findIndex(d => d.id === id || d.id?.toString() === id?.toString());
      if (index !== -1) {
        this.doctors[index] = {
          ...this.doctors[index],
          ...updateData,
        };
      }

      console.log('✅ Médico atualizado no Firebase:', id);

      const { password, ...doctorWithoutPassword } = this.doctors[index];
      return doctorWithoutPassword;
    } catch (error) {
      console.error('Erro ao atualizar médico:', error);
      throw error;
    }
  }

  // Remove um médico
  async deleteDoctor(id) {
    try {
      await this.ensureLoaded();
      const doctor = this.doctors.find(d => d.id === id || d.id?.toString() === id?.toString());
      
      if (!doctor) {
        return false;
      }

      // Remove do Firebase
      const doctorRef = doc(db, this.collectionName, doctor.id.toString());
      await deleteDoc(doctorRef);

      // Remove do array local
      const index = this.doctors.findIndex(d => d.id === id || d.id?.toString() === id?.toString());
      if (index !== -1) {
        this.doctors.splice(index, 1);
      }

      console.log('✅ Médico removido do Firebase:', id);
      return true;
    } catch (error) {
      console.error('Erro ao remover médico:', error);
      throw error;
    }
  }

  // Valida credenciais de login
  validateCredentials(email, password) {
    const doctor = this.getDoctorByEmail(email);
    if (!doctor) {
      return null;
    }
    if (doctor.password === password) {
      const { password: _, ...doctorWithoutPassword } = doctor;
      return doctorWithoutPassword;
    }
    return null;
  }
}

export default ControladorMedico;
