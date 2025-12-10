// Controller: ControladorEnfermaria
// Gerencia a lógica relacionada às enfermarias e leitos usando Firebase Firestore

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

class ControladorEnfermaria {
  constructor() {
    this.wards = [];
    this.nextId = 1;
    this.collectionName = 'enfermarias';
    this.initialized = false;
    this.init();
  }

  // Inicializa o Firebase e carrega os dados
  async init() {
    try {
      await this.loadFromDatabase();
      this.initialized = true;
      console.log('✅ Firebase inicializado e enfermarias carregadas');
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
      const wardsRef = collection(db, this.collectionName);
      const snapshot = await getDocs(wardsRef);
      
      // Se não houver enfermarias no Firebase, migra as mockadas
      if (snapshot.empty && this.wards.length > 0) {
        console.log('🔄 Migrando dados mockados para Firebase...');
        for (const ward of this.wards) {
          await addDoc(wardsRef, {
            ...ward,
            createdAt: new Date().toISOString(),
          });
        }
        console.log('✅ Dados mockados migrados para Firebase');
      }
    } catch (error) {
      console.error('Erro ao migrar dados para Firebase:', error);
    }
  }

  // Carrega enfermarias do Firebase
  async loadFromDatabase() {
    try {
      const wardsRef = collection(db, this.collectionName);
      const snapshot = await getDocs(wardsRef);
      
      this.wards = [];
      
      if (!snapshot.empty) {
        snapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          this.wards.push({
            id: docSnapshot.id,
            ...data,
          });
        });
        
        // Ordena por nome
        this.wards.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      } else {
        // Se não houver enfermarias, inicializa com dados mockados
        this.initializeMockData();
        await this.migrateMockDataToFirebase();
        await this.loadFromDatabase(); // Recarrega após migração
      }
      
      console.log(`✅ ${this.wards.length} enfermaria(s) carregada(s) do Firebase`);
    } catch (error) {
      console.error('Erro ao carregar do Firebase:', error);
      // Se houver erro, usa dados mockados
      this.initializeMockData();
    }
  }

  // Inicializa dados mockados
  initializeMockData() {
    this.wards = [
      {
        id: 1,
        name: 'Enfermaria A',
        service: 'Cardiologia',
        totalBeds: 20,
        occupiedBeds: 15,
        status: 'Ativa',
        beds: Array.from({ length: 20 }, (_, i) => ({
          number: (i + 1).toString(),
          occupied: i < 15,
          patientId: i < 15 ? `patient-${i + 1}` : null,
        })),
      },
      {
        id: 2,
        name: 'Enfermaria B',
        service: 'Neurologia',
        totalBeds: 30,
        occupiedBeds: 24,
        status: 'Ativa',
        beds: Array.from({ length: 30 }, (_, i) => ({
          number: (i + 1).toString(),
          occupied: i < 24,
          patientId: i < 24 ? `patient-${i + 24}` : null,
        })),
      },
      {
        id: 3,
        name: 'Enfermaria C',
        service: 'Pediatria',
        totalBeds: 15,
        occupiedBeds: 10,
        status: 'Ativa',
        beds: Array.from({ length: 15 }, (_, i) => ({
          number: (i + 1).toString(),
          occupied: i < 10,
          patientId: i < 10 ? `patient-${i + 30}` : null,
        })),
      },
      {
        id: 4,
        name: 'Enfermaria D',
        service: 'Ortopedia',
        totalBeds: 25,
        occupiedBeds: 20,
        status: 'Ativa',
        beds: Array.from({ length: 25 }, (_, i) => ({
          number: (i + 1).toString(),
          occupied: i < 20,
          patientId: i < 20 ? `patient-${i + 40}` : null,
        })),
      },
    ];
    this.nextId = 5;
  }

  // Garante que os dados estão carregados
  async ensureLoaded() {
    if (!this.initialized) {
      await this.init();
    }
    if (this.wards.length === 0) {
      await this.loadFromDatabase();
    }
  }

  // Retorna todas as enfermarias
  getAllWards() {
    return this.wards;
  }

  // Retorna uma enfermaria por ID
  getWardById(id) {
    return this.wards.find(w => w.id === id || w.id?.toString() === id?.toString()) || null;
  }

  // Retorna enfermarias por serviço
  getWardsByService(service) {
    return this.wards.filter(w => w.service === service);
  }

  // Retorna leitos disponíveis de uma enfermaria
  getAvailableBeds(wardName) {
    const ward = this.wards.find(w => w.name === wardName);
    if (!ward) return [];
    return ward.beds?.filter(bed => !bed.occupied).map(bed => bed.number) || [];
  }

  // Retorna enfermarias com leitos disponíveis
  getAvailableWards() {
    return this.wards
      .filter(ward => {
        const availableBeds = ward.beds?.filter(bed => !bed.occupied).length || 0;
        return availableBeds > 0 && ward.status === 'Ativa';
      })
      .map(ward => ({
        name: ward.name,
        totalBeds: ward.totalBeds,
        availableBeds: ward.beds?.filter(bed => !bed.occupied).length || 0,
        service: ward.service,
      }));
  }

  // Adiciona uma nova enfermaria
  async addWard(wardData) {
    try {
      await this.ensureLoaded();
      
      // Verifica se já existe enfermaria com o mesmo nome
      const existingWard = this.wards.find(w => w.name === wardData.wardName);
      if (existingWard) {
        throw new Error('Já existe uma enfermaria com este nome');
      }

      const totalBeds = parseInt(wardData.bedCount) || 0;
      const beds = Array.from({ length: totalBeds }, (_, i) => ({
        number: (i + 1).toString(),
        occupied: false,
        patientId: null,
      }));

      const newWardData = {
        name: wardData.wardName,
        service: wardData.service,
        totalBeds: totalBeds,
        occupiedBeds: 0,
        status: 'Ativa',
        beds: beds,
        createdAt: new Date().toISOString(),
      };

      // Adiciona ao Firebase
      const wardsRef = collection(db, this.collectionName);
      const docRef = await addDoc(wardsRef, newWardData);

      // Adiciona ao array local
      const newWard = {
        id: docRef.id,
        ...newWardData,
      };
      this.wards.push(newWard);

      console.log('✅ Enfermaria adicionada ao Firebase:', docRef.id);
      return newWard;
    } catch (error) {
      console.error('Erro ao adicionar enfermaria:', error);
      throw error;
    }
  }

  // Atualiza uma enfermaria existente
  async updateWard(id, wardData) {
    try {
      await this.ensureLoaded();
      const ward = this.wards.find(w => w.id === id || w.id?.toString() === id?.toString());
      
      if (!ward) {
        return null;
      }

      const updateData = {
        name: wardData.wardName || ward.name,
        service: wardData.service || ward.service,
        status: wardData.status || ward.status,
        updatedAt: new Date().toISOString(),
      };

      // Se o número de leitos mudou, atualiza
      if (wardData.bedCount) {
        const newTotalBeds = parseInt(wardData.bedCount);
        const currentBeds = ward.beds || [];
        const occupiedCount = currentBeds.filter(b => b.occupied).length;
        
        if (newTotalBeds > ward.totalBeds) {
          // Adiciona novos leitos
          const newBeds = Array.from({ length: newTotalBeds - ward.totalBeds }, (_, i) => ({
            number: (ward.totalBeds + i + 1).toString(),
            occupied: false,
            patientId: null,
          }));
          updateData.beds = [...currentBeds, ...newBeds];
          updateData.totalBeds = newTotalBeds;
        } else if (newTotalBeds < ward.totalBeds) {
          // Remove leitos não ocupados
          const unoccupiedBeds = currentBeds.filter(b => !b.occupied);
          const toRemove = ward.totalBeds - newTotalBeds;
          if (toRemove <= unoccupiedBeds.length) {
            const bedsToKeep = currentBeds.filter(b => b.occupied);
            const bedsToAdd = unoccupiedBeds.slice(0, newTotalBeds - occupiedCount);
            updateData.beds = [...bedsToKeep, ...bedsToAdd];
            updateData.totalBeds = newTotalBeds;
          } else {
            throw new Error('Não é possível remover leitos ocupados');
          }
        }
      }

      // Atualiza no Firebase
      const wardRef = doc(db, this.collectionName, ward.id.toString());
      await updateDoc(wardRef, updateData);

      // Atualiza no array local
      const index = this.wards.findIndex(w => w.id === id || w.id?.toString() === id?.toString());
      if (index !== -1) {
        this.wards[index] = {
          ...this.wards[index],
          ...updateData,
        };
      }

      console.log('✅ Enfermaria atualizada no Firebase:', id);
      return this.wards[index];
    } catch (error) {
      console.error('Erro ao atualizar enfermaria:', error);
      throw error;
    }
  }

  // Remove uma enfermaria
  async deleteWard(id) {
    try {
      await this.ensureLoaded();
      const ward = this.wards.find(w => w.id === id || w.id?.toString() === id?.toString());
      
      if (!ward) {
        return false;
      }

      // Verifica se há leitos ocupados
      const occupiedBeds = ward.beds?.filter(b => b.occupied).length || 0;
      if (occupiedBeds > 0) {
        throw new Error('Não é possível remover enfermaria com leitos ocupados');
      }

      // Remove do Firebase
      const wardRef = doc(db, this.collectionName, ward.id.toString());
      await deleteDoc(wardRef);

      // Remove do array local
      const index = this.wards.findIndex(w => w.id === id || w.id?.toString() === id?.toString());
      if (index !== -1) {
        this.wards.splice(index, 1);
      }

      console.log('✅ Enfermaria removida do Firebase:', id);
      return true;
    } catch (error) {
      console.error('Erro ao remover enfermaria:', error);
      throw error;
    }
  }

  // Ocupa um leito
  async occupyBed(wardName, bedNumber, patientId) {
    try {
      await this.ensureLoaded();
      const ward = this.wards.find(w => w.name === wardName);
      
      if (!ward) {
        throw new Error('Enfermaria não encontrada');
      }

      const bed = ward.beds?.find(b => b.number === bedNumber);
      if (!bed) {
        throw new Error('Leito não encontrado');
      }

      if (bed.occupied) {
        throw new Error('Leito já está ocupado');
      }

      bed.occupied = true;
      bed.patientId = patientId;
      ward.occupiedBeds = (ward.occupiedBeds || 0) + 1;

      // Atualiza no Firebase
      const wardRef = doc(db, this.collectionName, ward.id.toString());
      await updateDoc(wardRef, {
        beds: ward.beds,
        occupiedBeds: ward.occupiedBeds,
        updatedAt: new Date().toISOString(),
      });

      console.log('✅ Leito ocupado:', wardName, bedNumber);
      return true;
    } catch (error) {
      console.error('Erro ao ocupar leito:', error);
      throw error;
    }
  }

  // Libera um leito
  async freeBed(wardName, bedNumber) {
    try {
      await this.ensureLoaded();
      const ward = this.wards.find(w => w.name === wardName);
      
      if (!ward) {
        throw new Error('Enfermaria não encontrada');
      }

      const bed = ward.beds?.find(b => b.number === bedNumber);
      if (!bed) {
        throw new Error('Leito não encontrado');
      }

      bed.occupied = false;
      bed.patientId = null;
      ward.occupiedBeds = Math.max((ward.occupiedBeds || 0) - 1, 0);

      // Atualiza no Firebase
      const wardRef = doc(db, this.collectionName, ward.id.toString());
      await updateDoc(wardRef, {
        beds: ward.beds,
        occupiedBeds: ward.occupiedBeds,
        updatedAt: new Date().toISOString(),
      });

      console.log('✅ Leito liberado:', wardName, bedNumber);
      return true;
    } catch (error) {
      console.error('Erro ao liberar leito:', error);
      throw error;
    }
  }
}

export default ControladorEnfermaria;

