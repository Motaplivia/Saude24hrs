// Controller: ControladorMensagem
// Gerencia a lógica das mensagens usando Firebase Firestore

import { db } from '../config/firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import Mensagem from '../models/Mensagem';

class ControladorMensagem {
  constructor() {
    this.messages = [];
    this.collectionName = 'mensagens';
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
      console.log('✅ Firebase inicializado e mensagens carregadas');
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
      const messagesRef = collection(db, this.collectionName);
      const q = query(messagesRef, orderBy('date', 'desc'));
      
      this.unsubscribe = onSnapshot(q, (snapshot) => {
        this.messages = [];
        snapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          this.messages.push(new Mensagem({
            id: docSnapshot.id,
            ...data,
          }));
        });
        console.log('📨 Mensagens atualizadas em tempo real:', this.messages.length);
      }, (error) => {
        console.error('Erro no listener de mensagens:', error);
      });
    } catch (error) {
      console.error('Erro ao configurar listener:', error);
    }
  }

  // Carrega mensagens do Firebase
  async loadFromDatabase() {
    try {
      const messagesRef = collection(db, this.collectionName);
      const q = query(messagesRef, orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      
      this.messages = [];
      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        this.messages.push(new Mensagem({
          id: docSnapshot.id,
          ...data,
        }));
      });
      
      console.log(`✅ ${this.messages.length} mensagem(ns) carregada(s) do Firebase`);
    } catch (error) {
      console.error('Erro ao carregar mensagens do Firebase:', error);
      throw error;
    }
  }

  // Migra dados mockados para o Firebase (apenas na primeira vez)
  async migrateMockDataToFirebase() {
    try {
      const messagesRef = collection(db, this.collectionName);
      const snapshot = await getDocs(messagesRef);
      
      // Se não houver mensagens no Firebase, migra as mockadas
      if (snapshot.empty && this.messages.length > 0) {
        console.log('🔄 Migrando mensagens mockadas para Firebase...');
        for (const message of this.messages) {
          const messageData = message.toJSON();
          delete messageData.id; // Remove o ID para o Firebase gerar um novo
          await addDoc(messagesRef, messageData);
        }
        console.log('✅ Mensagens mockadas migradas para Firebase');
        await this.loadFromDatabase();
      }
    } catch (error) {
      console.error('Erro ao migrar mensagens para Firebase:', error);
    }
  }

  // Inicializa dados mockados
  initializeMockData() {
    const mockMessages = [
      {
        id: 1,
        patientId: 1,
        patientName: 'Ana Costa',
        date: new Date().toISOString(),
        patientMessage: 'Sinto algumas dores no peito após as refeições.',
        doctorResponse: '',
        status: 'pendente',
      },
      {
        id: 2,
        patientId: 2,
        patientName: 'João Silva',
        date: new Date(Date.now() - 3600000).toISOString(),
        patientMessage: 'Tenho dificuldade para respirar durante a noite.',
        doctorResponse: '',
        status: 'pendente',
      },
      {
        id: 3,
        patientId: 3,
        patientName: 'Maria Santos',
        date: new Date(Date.now() - 7200000).toISOString(),
        patientMessage: 'A dor na perna está piorando.',
        doctorResponse: '',
        status: 'pendente',
      },
      {
        id: 4,
        patientId: 1,
        patientName: 'Ana Costa',
        date: new Date(Date.now() - 86400000).toISOString(),
        patientMessage: 'Sinto algumas dores no peito após as refeições.',
        doctorResponse: 'Vou ajustar a sua medicação. Continue a monitorizar os sintomas',
        status: 'respondida',
      },
    ];

    mockMessages.forEach(messageData => {
      this.messages.push(new Mensagem(messageData));
    });
  }

  // Garante que os dados estão carregados
  async ensureLoaded() {
    if (!this.initialized) {
      await this.init();
    }
  }

  // Retorna mensagens pendentes
  getPendingMessages() {
    return this.messages
      .filter(message => message.status === 'pendente')
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(message => message.toJSON());
  }

  // Retorna mensagens respondidas
  getAnsweredMessages() {
    return this.messages
      .filter(message => message.status === 'respondida')
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(message => message.toJSON());
  }

  // Retorna todas as mensagens
  getAllMessages() {
    return this.messages
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(message => message.toJSON());
  }

  // Responde uma mensagem
  async answerMessage(messageId, response) {
    try {
      await this.ensureLoaded();
      const message = this.messages.find(m => m.id === messageId || m.id?.toString() === messageId?.toString());
      
      if (!message) {
        throw new Error('Mensagem não encontrada');
      }

      // Atualiza no Firebase
      const messageRef = doc(db, this.collectionName, message.id.toString());
      await updateDoc(messageRef, {
        doctorResponse: response,
        status: 'respondida',
        answeredAt: new Date().toISOString(),
      });

      // Atualiza localmente
      message.markAsAnswered(response);
      
      console.log('✅ Mensagem respondida no Firebase:', messageId);
      return message.toJSON();
    } catch (error) {
      console.error('Erro ao responder mensagem:', error);
      // Fallback: atualiza apenas localmente
      const message = this.messages.find(m => m.id === messageId || m.id?.toString() === messageId?.toString());
      if (message) {
        message.markAsAnswered(response);
        return message.toJSON();
      }
      throw error;
    }
  }

  // Cria uma nova mensagem
  async createMessage(messageData) {
    try {
      await this.ensureLoaded();
      
      const newMessageData = {
        patientId: messageData.patientId || null,
        patientName: messageData.patientName || '',
        date: messageData.date || new Date().toISOString(),
        patientMessage: messageData.patientMessage || '',
        doctorResponse: messageData.doctorResponse || '',
        status: messageData.status || 'pendente',
      };

      // Adiciona ao Firebase
      const messagesRef = collection(db, this.collectionName);
      const docRef = await addDoc(messagesRef, newMessageData);

      // Adiciona localmente
      const message = new Mensagem({
        id: docRef.id,
        ...newMessageData,
      });
      this.messages.push(message);

      console.log('✅ Mensagem criada no Firebase:', docRef.id);
      return message.toJSON();
    } catch (error) {
      console.error('Erro ao criar mensagem:', error);
      // Fallback: cria apenas localmente
      const message = new Mensagem({
        ...messageData,
        id: this.messages.length + 1,
      });
      this.messages.push(message);
      return message.toJSON();
    }
  }

  // Busca mensagens por paciente
  getMessagesByPatientId(patientId) {
    return this.messages
      .filter(message => message.patientId === patientId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(message => message.toJSON());
  }

  // Limpa o listener quando não for mais necessário
  cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}

export default ControladorMensagem;

