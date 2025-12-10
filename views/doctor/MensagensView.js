// View: MensagensView
// Tela de Mensagens

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const MensagensView = ({ messageController, patientController, onSendMessage }) => {
  const [pendingMessages, setPendingMessages] = useState([]);
  const [answeredMessages, setAnsweredMessages] = useState([]);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('pendente'); // 'pendente', 'respondida', 'todas'
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadMessages();
    // Configura atualização automática a cada 5 segundos
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadMessages = async () => {
    try {
      if (messageController) {
        await messageController.ensureLoaded();
        const pending = messageController.getPendingMessages();
        const answered = messageController.getAnsweredMessages();
        setPendingMessages(pending);
        setAnsweredMessages(answered);
        
        // Seleciona a primeira mensagem pendente se não houver seleção
        if (!selectedMessageId && pending.length > 0) {
          setSelectedMessageId(pending[0].id);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  const handleSendResponse = async () => {
    if (!selectedMessageId || !responseText.trim()) {
      Alert.alert('Erro', 'Por favor, preencha a resposta');
      return;
    }

    setIsLoading(true);
    try {
      if (onSendMessage) {
        onSendMessage(selectedMessageId, responseText);
      }
      await messageController.answerMessage(selectedMessageId, responseText);
      setResponseText('');
      await loadMessages();
      Alert.alert('Sucesso', 'Resposta enviada com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Erro ao enviar resposta. Tente novamente.');
      console.error('Erro ao enviar resposta:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Agora';
      if (diffMins < 60) return `${diffMins} min atrás`;
      if (diffHours < 24) return `${diffHours}h atrás`;
      if (diffDays === 1) return 'Ontem';
      if (diffDays < 7) return `${diffDays} dias atrás`;
      
      return date.toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const selectedMessage = pendingMessages.find((m) => m.id === selectedMessageId);
  
  // Filtra mensagens baseado na pesquisa
  const filteredPendingMessages = pendingMessages.filter(msg => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      msg.patientName.toLowerCase().includes(query) ||
      msg.patientMessage.toLowerCase().includes(query)
    );
  });

  const filteredAnsweredMessages = answeredMessages.filter(msg => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      msg.patientName.toLowerCase().includes(query) ||
      msg.patientMessage.toLowerCase().includes(query) ||
      msg.doctorResponse.toLowerCase().includes(query)
    );
  });

  return (
    <ScrollView style={styles.container}>
      {/* Barra de pesquisa e filtro */}
      <View style={styles.card}>
        <View style={styles.searchFilterContainer}>
          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color="#566246" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar mensagens..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <MaterialIcons name="filter-list" size={20} color="#566246" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Mensagens Pendentes */}
      {filterStatus === 'pendente' || filterStatus === 'todas' ? (
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <MaterialIcons name="pending-actions" size={20} color="#566246" />
              <Text style={styles.title}>Mensagens Pendentes</Text>
              {pendingMessages.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{pendingMessages.length}</Text>
                </View>
              )}
            </View>
          </View>

          {filteredPendingMessages.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="inbox" size={48} color="#D8DAD3" />
              <Text style={styles.emptyText}>
                {searchQuery ? 'Nenhuma mensagem encontrada' : 'Nenhuma mensagem pendente'}
              </Text>
            </View>
          ) : (
            <>
              {/* Lista de mensagens pendentes */}
              {filteredPendingMessages.length > 1 && (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.messagesList}
                  contentContainerStyle={styles.messagesListContent}
                >
                  {filteredPendingMessages.map((message) => (
                    <TouchableOpacity
                      key={message.id}
                      style={[
                        styles.messageListItem,
                        selectedMessageId === message.id && styles.messageListItemSelected,
                      ]}
                      onPress={() => setSelectedMessageId(message.id)}
                    >
                      <View style={styles.messageListItemHeader}>
                        <MaterialIcons name="person" size={16} color="#566246" />
                        <Text style={styles.messageListItemName} numberOfLines={1}>
                          {message.patientName}
                        </Text>
                      </View>
                      <Text style={styles.messageListItemText} numberOfLines={2}>
                        {message.patientMessage}
                      </Text>
                      <Text style={styles.messageListItemDate}>
                        {formatDate(message.date)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {/* Detalhes da mensagem selecionada */}
              {selectedMessage && (
                <View style={styles.messageCard}>
                  <View style={styles.messageHeader}>
                    <View style={styles.messageInfo}>
                      <MaterialIcons name="person" size={20} color="#566246" />
                      <Text style={styles.messageName}>{selectedMessage.patientName}</Text>
                    </View>
                    <View style={styles.messageInfo}>
                      <MaterialIcons name="access-time" size={16} color="#4A4A48" />
                      <Text style={styles.messageDate}>{formatDate(selectedMessage.date)}</Text>
                    </View>
                    <View style={styles.statusBadgePending}>
                      <Text style={styles.statusText}>Pendente</Text>
                    </View>
                  </View>

                  <View style={styles.patientMessageBubble}>
                    <Text style={styles.bubbleLabel}>Mensagem do Paciente</Text>
                    <Text style={styles.bubbleText}>{selectedMessage.patientMessage}</Text>
                  </View>

                  <View style={styles.responseSection}>
                    <TextInput
                      style={styles.responseInput}
                      placeholder="Escreva a sua resposta..."
                      value={responseText}
                      onChangeText={setResponseText}
                      multiline
                      numberOfLines={4}
                      placeholderTextColor="#999"
                    />
                    <TouchableOpacity 
                      style={[styles.sendButton, isLoading && styles.sendButtonDisabled]} 
                      onPress={handleSendResponse}
                      disabled={isLoading}
                    >
                      <MaterialIcons name="send" size={18} color="#ffffff" />
                      <Text style={styles.sendButtonText}>
                        {isLoading ? 'Enviando...' : 'Enviar Resposta'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      ) : null}

      {/* Mensagens Respondidas */}
      {filterStatus === 'respondida' || filterStatus === 'todas' ? (
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <MaterialIcons name="check-circle" size={20} color="#566246" />
              <Text style={styles.title}>Mensagens Respondidas</Text>
              {answeredMessages.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{answeredMessages.length}</Text>
                </View>
              )}
            </View>
          </View>

          {filteredAnsweredMessages.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="inbox" size={48} color="#D8DAD3" />
              <Text style={styles.emptyText}>
                {searchQuery ? 'Nenhuma mensagem encontrada' : 'Nenhuma mensagem respondida'}
              </Text>
            </View>
          ) : (
            filteredAnsweredMessages.map((message) => (
              <View key={message.id} style={styles.messageCard}>
                <View style={styles.messageHeader}>
                  <View style={styles.messageInfo}>
                    <MaterialIcons name="person" size={20} color="#566246" />
                    <Text style={styles.messageName}>{message.patientName}</Text>
                  </View>
                  <View style={styles.messageInfo}>
                    <MaterialIcons name="access-time" size={16} color="#4A4A48" />
                    <Text style={styles.messageDate}>{formatDate(message.date)}</Text>
                  </View>
                  <View style={styles.statusBadgeAnswered}>
                    <Text style={styles.statusText}>Respondida</Text>
                  </View>
                </View>

                <View style={styles.patientMessageBubble}>
                  <Text style={styles.bubbleLabel}>Mensagem do Paciente</Text>
                  <Text style={styles.bubbleText}>{message.patientMessage}</Text>
                </View>

                <View style={styles.doctorMessageBubble}>
                  <View style={styles.doctorResponseHeader}>
                    <MaterialIcons name="medical-services" size={16} color="#566246" />
                    <Text style={styles.bubbleLabel}>Sua Resposta</Text>
                    {message.answeredAt && (
                      <Text style={styles.answeredAtText}>
                        {formatDate(message.answeredAt)}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.bubbleText}>{message.doctorResponse}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      ) : null}

      {/* Modal de Filtros */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <MaterialIcons name="close" size={24} color="#566246" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {['pendente', 'respondida', 'todas'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.modalItem,
                    filterStatus === status && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    setFilterStatus(status);
                    setShowFilterModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      filterStatus === status && styles.modalItemTextSelected,
                    ]}
                  >
                    {status === 'pendente' ? 'Pendentes' : 
                     status === 'respondida' ? 'Respondidas' : 'Todas'}
                  </Text>
                  {filterStatus === status && (
                    <MaterialIcons name="check" size={18} color="#566246" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F2EB',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 0,
    padding: 16,
    margin: 0,
    marginBottom: 0,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  searchFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F2EB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D8DAD3',
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#4A4A48',
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: '#F1F2EB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D8DAD3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#566246',
  },
  badge: {
    backgroundColor: '#566246',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  messageCard: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#F1F2EB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D8DAD3',
  },
  messagesList: {
    marginBottom: 16,
  },
  messagesListContent: {
    gap: 10,
    paddingRight: 16,
  },
  messageListItem: {
    width: 200,
    backgroundColor: '#F1F2EB',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D8DAD3',
  },
  messageListItemSelected: {
    backgroundColor: '#A4C2A5',
    borderColor: '#566246',
  },
  messageListItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  messageListItemName: {
    fontSize: 14,
    color: '#566246',
    fontWeight: '600',
    flex: 1,
  },
  messageListItemText: {
    fontSize: 13,
    color: '#4A4A48',
    marginBottom: 8,
    lineHeight: 18,
  },
  messageListItemDate: {
    fontSize: 11,
    color: '#4A4A48',
    opacity: 0.7,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    flexWrap: 'wrap',
    gap: 8,
  },
  messageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  messageName: {
    fontSize: 15,
    color: '#566246',
    fontWeight: '600',
  },
  messageDate: {
    fontSize: 13,
    color: '#4A4A48',
  },
  statusBadgePending: {
    backgroundColor: '#A4C2A5',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  statusBadgeAnswered: {
    backgroundColor: '#D8DAD3',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  statusText: {
    color: '#566246',
    fontSize: 12,
    fontWeight: '600',
  },
  patientMessageBubble: {
    backgroundColor: '#A4C2A5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  doctorMessageBubble: {
    backgroundColor: '#D8DAD3',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
  },
  bubbleLabel: {
    fontSize: 12,
    color: '#4A4A48',
    marginBottom: 5,
    fontWeight: '600',
  },
  bubbleText: {
    fontSize: 14,
    color: '#566246',
  },
  responseSection: {
    marginTop: 10,
  },
  responseInput: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#4A4A48',
    borderWidth: 1,
    borderColor: '#D8DAD3',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  sendButton: {
    backgroundColor: '#566246',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  doctorResponseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 5,
  },
  answeredAtText: {
    fontSize: 11,
    color: '#4A4A48',
    opacity: 0.7,
    marginLeft: 'auto',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#4A4A48',
    marginTop: 12,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#D8DAD3',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#566246',
  },
  modalList: {
    padding: 16,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#F1F2EB',
    borderWidth: 1,
    borderColor: '#D8DAD3',
  },
  modalItemSelected: {
    backgroundColor: '#A4C2A5',
    borderColor: '#566246',
  },
  modalItemText: {
    fontSize: 16,
    color: '#4A4A48',
    fontWeight: '600',
  },
  modalItemTextSelected: {
    color: '#566246',
    fontWeight: '700',
  },
});

export default MensagensView;

