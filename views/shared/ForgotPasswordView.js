// View: ForgotPasswordView
// Tela de Recuperar Senha

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const ForgotPasswordView = ({ onBack, doctorController, patientController }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSendResetLink = async () => {
    if (!email.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o email');
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Erro', 'Por favor, insira um email válido');
      return;
    }

    setIsLoading(true);
    try {
      // Simula envio de email (em produção, isso seria feito via backend)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Verifica se o email existe no sistema (detecção automática)
      let userExists = false;
      const emailLower = email.toLowerCase();
      
      // 1. Verifica se é admin
      if (emailLower.includes('admin') || emailLower.includes('claudio')) {
        userExists = true;
      }
      
      // 2. Verifica se é médico
      if (!userExists && doctorController) {
        await doctorController.ensureLoaded();
        const doctor = doctorController.getDoctorByEmail(emailLower);
        userExists = !!doctor;
      }
      
      // 3. Verifica se é paciente
      if (!userExists && patientController) {
        const patients = patientController.getAllPatients();
        userExists = patients.some(p => p.email?.toLowerCase() === emailLower);
      }

      if (userExists) {
        setEmailSent(true);
        // Em produção, aqui seria enviado um email com link de recuperação
        console.log(`Email de recuperação enviado para: ${email}`);
      } else {
        Alert.alert('Erro', 'Email não encontrado no sistema');
      }
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      Alert.alert('Erro', 'Erro ao enviar email de recuperação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.card}>
          <View style={styles.successContainer}>
            <MaterialIcons name="check-circle" size={64} color="#A4C2A5" />
            <Text style={styles.successTitle}>Email Enviado!</Text>
            <Text style={styles.successText}>
              Enviamos um link de recuperação de senha para{'\n'}
              <Text style={styles.emailText}>{email}</Text>
            </Text>
            <Text style={styles.successSubtext}>
              Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
            </Text>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Text style={styles.backButtonText}>Voltar ao Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.card}>
        <TouchableOpacity style={styles.backIcon} onPress={onBack}>
          <MaterialIcons name="arrow-back" size={24} color="#566246" />
        </TouchableOpacity>

        <View style={styles.header}>
          <MaterialIcons name="lock-reset" size={48} color="#566246" />
          <Text style={styles.title}>Recuperar Senha</Text>
          <Text style={styles.subtitle}>
            Digite seu email para receber um link de recuperação
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>E-mail</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="email" size={20} color="#566246" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Digite seu email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.sendButton, isLoading && styles.sendButtonDisabled]} 
          onPress={handleSendResetLink}
          disabled={isLoading}
        >
          <MaterialIcons name="send" size={20} color="#ffffff" />
          <Text style={styles.sendButtonText}>
            {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backLink} onPress={onBack}>
          <Text style={styles.backLinkText}>Voltar ao Login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F2EB',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    marginHorizontal: 20,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  backIcon: {
    marginBottom: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#566246',
    textAlign: 'center',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#4A4A48',
    textAlign: 'center',
    marginTop: 8,
  },
  form: {
    marginBottom: 25,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#566246',
    marginBottom: 8,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F2EB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D8DAD3',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#4A4A48',
  },
  sendButton: {
    backgroundColor: '#566246',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  backLink: {
    alignItems: 'center',
  },
  backLinkText: {
    fontSize: 14,
    color: '#566246',
    fontWeight: '600',
  },
  successContainer: {
    alignItems: 'center',
    padding: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#566246',
    marginTop: 20,
    marginBottom: 12,
  },
  successText: {
    fontSize: 16,
    color: '#4A4A48',
    textAlign: 'center',
    marginBottom: 8,
  },
  emailText: {
    fontWeight: '700',
    color: '#566246',
  },
  successSubtext: {
    fontSize: 14,
    color: '#4A4A48',
    textAlign: 'center',
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: '#566246',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ForgotPasswordView;

