// View: RegisterView
// Tela de Registro

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const RegisterView = ({ onRegister, onNavigateToLogin }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    userNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = () => {
    // Validações
    if (!formData.fullName.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o nome completo');
      return;
    }

    if (!formData.userNumber.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o número de utente');
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o email');
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Erro', 'Por favor, insira um email válido');
      return;
    }

    if (!formData.password.trim()) {
      Alert.alert('Erro', 'Por favor, preencha a senha');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    setIsLoading(true);
    try {
      if (onRegister) {
        onRegister(formData);
        Alert.alert('Sucesso', 'Registro realizado com sucesso! Faça login para continuar.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao realizar registro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { margin: 0 }]}>
          <TouchableOpacity style={styles.backIcon} onPress={onNavigateToLogin}>
            <MaterialIcons name="arrow-back" size={24} color="#566246" />
          </TouchableOpacity>

          <View style={styles.header}>
            <MaterialIcons name="person-add" size={48} color="#566246" />
            <Text style={styles.title}>Registre-se</Text>
            <Text style={styles.subtitle}>Crie sua conta de paciente</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Nome Completo *</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="person" size={20} color="#566246" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Digite seu nome completo"
                  value={formData.fullName}
                  onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                  editable={!isLoading}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Número de Utente *</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="badge" size={20} color="#566246" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Digite o número de utente"
                  value={formData.userNumber}
                  onChangeText={(text) => setFormData({ ...formData, userNumber: text.replace(/[^0-9]/g, '') })}
                  keyboardType="numeric"
                  editable={!isLoading}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>E-mail *</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="email" size={20} color="#566246" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Digite seu email"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Senha *</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="lock" size={20} color="#566246" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Digite a senha (mín. 6 caracteres)"
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <MaterialIcons 
                    name={showPassword ? 'visibility' : 'visibility-off'} 
                    size={20} 
                    color="#566246" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Confirmar Senha *</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="lock" size={20} color="#566246" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirme a senha"
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                  secureTextEntry={!showConfirmPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <MaterialIcons 
                    name={showConfirmPassword ? 'visibility' : 'visibility-off'} 
                    size={20} 
                    color="#566246" 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.registerButton, isLoading && styles.registerButtonDisabled]} 
            onPress={handleRegister}
            disabled={isLoading}
          >
            <MaterialIcons name="person-add" size={20} color="#ffffff" />
            <Text style={styles.registerButtonText}>
              {isLoading ? 'Registrando...' : 'Registrar-se'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginLink} onPress={onNavigateToLogin}>
            <Text style={styles.loginLinkText}>
              Já tem uma conta? <Text style={styles.loginLinkBold}>Faça login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F2EB',
  },
  scrollContent: {
    flexGrow: 1,
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
    marginBottom: 30,
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
  eyeIcon: {
    padding: 4,
  },
  registerButton: {
    backgroundColor: '#566246',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  loginLink: {
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 14,
    color: '#4A4A48',
  },
  loginLinkBold: {
    color: '#566246',
    fontWeight: '700',
  },
});

export default RegisterView;


