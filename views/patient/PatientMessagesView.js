// View: PatientMessagesView
// Tela de Mensagens do Paciente

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';

const PatientMessagesView = ({ patient }) => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const recentMessages = [
    {
      id: 1,
      doctorName: 'Doutora Susana',
      message: 'Tudo bem ?',
      avatar: '👩‍⚕️',
    },
    {
      id: 2,
      doctorName: 'Doutor João',
      message: 'Na próximo vamos fazer outro exame.',
      avatar: '👨‍⚕️',
    },
    {
      id: 3,
      doctorName: 'Doutor Anabela',
      message: 'Temos que marcar um consulta.',
      avatar: '👩‍⚕️',
    },
  ];

  const activeChat = selectedDoctor || {
    id: 3,
    doctorName: 'Doutor Anabela',
    avatar: '👩‍⚕️',
    messages: [
      { id: 1, text: 'Temos que marcar uma consulta', isIncoming: true },
      { id: 2, text: 'Sim', isIncoming: false },
    ],
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Recent Messages Section */}
        <View style={styles.recentSection}>
          {recentMessages.map((msg) => (
            <TouchableOpacity
              key={msg.id}
              style={styles.recentMessageItem}
              onPress={() => setSelectedDoctor(msg)}
            >
              <View style={styles.avatarContainer}>
                <Text style={styles.avatar}>{msg.avatar}</Text>
              </View>
              <View style={styles.messageBubble}>
                <Text style={styles.doctorName}>{msg.doctorName}</Text>
                <Text style={styles.messageText}>{msg.message}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Active Chat Section */}
        <View style={styles.chatCard}>
          <View style={styles.chatHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatar}>{activeChat.avatar}</Text>
            </View>
            <Text style={styles.chatDoctorName}>{activeChat.doctorName}</Text>
          </View>

          <View style={styles.messagesContainer}>
            {activeChat.messages?.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageBubbleChat,
                  msg.isIncoming ? styles.incomingMessage : styles.outgoingMessage,
                ]}
              >
                <Text
                  style={[
                    styles.messageTextChat,
                    msg.isIncoming ? styles.incomingText : styles.outgoingText,
                  ]}
                >
                  {msg.text}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachmentButton}>
          <Text style={styles.attachmentIcon}>📎</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Digite sua mensagem..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.sendButton}>
          <Text style={styles.sendIcon}>✈</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  recentSection: {
    padding: 20,
  },
  recentMessageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatar: {
    fontSize: 30,
  },
  messageBubble: {
    flex: 1,
    backgroundColor: '#4caf50',
    borderRadius: 20,
    padding: 15,
    maxWidth: '80%',
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 5,
  },
  messageText: {
    fontSize: 14,
    color: '#000',
  },
  chatCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  chatDoctorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginLeft: 10,
  },
  messagesContainer: {
    marginBottom: 20,
  },
  messageBubbleChat: {
    borderRadius: 20,
    padding: 12,
    marginBottom: 10,
    maxWidth: '80%',
  },
  incomingMessage: {
    backgroundColor: '#e0e0e0',
    alignSelf: 'flex-start',
  },
  outgoingMessage: {
    backgroundColor: '#4caf50',
    alignSelf: 'flex-end',
  },
  messageTextChat: {
    fontSize: 14,
  },
  incomingText: {
    color: '#000',
  },
  outgoingText: {
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#424242',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  attachmentButton: {
    marginRight: 10,
  },
  attachmentIcon: {
    fontSize: 24,
    color: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#424242',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 10,
  },
  sendIcon: {
    fontSize: 24,
    color: '#fff',
  },
});

export default PatientMessagesView;

