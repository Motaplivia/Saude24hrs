// View: FamilyAccessView
// Tela de Acesso para Familiares

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const FamilyAccessView = ({ onLogin, onBack, patientController }) => {
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!accessCode.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o código de acesso');
      return;
    }

    if (accessCode.length !== 6) {
      Alert.alert('Erro', 'O código de acesso deve ter 6 dígitos');
      return;
    }

    setIsLoading(true);
    try {
      if (patientController) {
        const patients = patientController.getAllPatients();
        const patient = patients.find(p => p.accessCode === accessCode);

        if (patient) {
          if (onLogin) {
            onLogin({
              id: `family-${patient.id}`,
              name: `Familiar de ${patient.name}`,
              email: patient.email,
              role: 'Familiar',
              patientId: patient.id,
              isFamily: true,
            });
          }
        } else {
          Alert.alert('Erro', 'Código de acesso inválido');
        }
      } else {
        Alert.alert('Erro', 'Sistema não disponível');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      Alert.alert('Erro', 'Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.card, { margin: 0 }]}>
        {onBack && (
          <TouchableOpacity style={styles.backIcon} onPress={onBack}>
            <MaterialIcons name="arrow-back" size={24} color="#566246" />
          </TouchableOpacity>
        )}

        <View style={styles.header}>
          <MaterialIcons name="people" size={64} color="#566246" />
          <Text style={styles.title}>Acesso para Familiares</Text>
          <Text style={styles.subtitle}>
            Digite o código de acesso de 6 dígitos{'\n'}
            fornecido pelo paciente
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Código de Acesso</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="vpn-key" size={24} color="#566246" style={styles.inputIcon} />
              <TextInput
                style={styles.codeInput}
                placeholder="000000"
                value={accessCode}
                onChangeText={(text) => {
                  // Permite apenas números e limita a 6 dígitos
                  const numericText = text.replace(/[^0-9]/g, '').slice(0, 6);
                  setAccessCode(numericText);
                }}
                keyboardType="numeric"
                maxLength={6}
                editable={!isLoading}
                textAlign="center"
              />
            </View>
            <Text style={styles.hint}>
              O código de acesso é fornecido pelo paciente durante a admissão
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.loginButton, (isLoading || accessCode.length !== 6) && styles.loginButtonDisabled]} 
          onPress={handleLogin}
          disabled={isLoading || accessCode.length !== 6}
        >
          <MaterialIcons name="login" size={20} color="#ffffff" />
          <Text style={styles.loginButtonText}>
            {isLoading ? 'Verificando...' : 'Acessar'}
          </Text>
        </TouchableOpacity>

        {onBack && (
          <TouchableOpacity style={styles.backLink} onPress={onBack}>
            <Text style={styles.backLinkText}>Voltar</Text>
          </TouchableOpacity>
        )}
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
    lineHeight: 20,
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
  codeInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 24,
    color: '#566246',
    fontWeight: '700',
    letterSpacing: 8,
  },
  hint: {
    fontSize: 12,
    color: '#4A4A48',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loginButton: {
    backgroundColor: '#566246',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
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
});

export default FamilyAccessView;

