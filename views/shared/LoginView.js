// View: LoginView
// Tela de Login

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const LoginView = ({ onLogin, onForgotPassword, doctorController, patientController }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    // Validações básicas
    if (!formData.password.trim()) {
      Alert.alert('Erro', 'Por favor, preencha a senha ou código de acesso');
      return;
    }

    setIsLoading(true);
    try {
      let userFound = false;

      // 1. Verifica se é admin (email contém "admin" ou "claudio")
      if (formData.email.trim() && formData.password.trim()) {
        const emailLower = formData.email.toLowerCase();
        if (emailLower.includes('admin') || emailLower.includes('claudio')) {
          // Admin usa email e senha (validação simples por enquanto)
          // Em produção, isso seria verificado em um AdminController
          userFound = true;
          if (onLogin) {
            onLogin({
              id: 1,
              name: 'Sr. Claudio Sousa',
              email: formData.email,
              role: 'Administrador Geral',
              initials: 'CS',
            });
            return;
          }
        }
      }

      // 2. Se não é admin, tenta login como médico (email + senha)
      if (!userFound && formData.email.trim() && formData.password.trim() && doctorController) {
        await doctorController.ensureLoaded();
        const doctor = doctorController.validateCredentials(formData.email.toLowerCase(), formData.password);
        if (doctor) {
          userFound = true;
          if (onLogin) {
            onLogin({
              id: doctor.id,
              name: doctor.name,
              email: doctor.email,
              role: doctor.specialty || 'Médico',
              doctorId: doctor.id,
            });
            return;
          }
        }
      }

      // 3. Se não encontrou médico, tenta login como paciente (email + senha)
      if (!userFound && formData.email.trim() && formData.password.trim() && patientController) {
        const patients = patientController.getAllPatients();
        const patient = patients.find(
          p => p.email?.toLowerCase() === formData.email.toLowerCase() && 
               p.password === formData.password
        );
        if (patient) {
          userFound = true;
          if (onLogin) {
            onLogin({
              id: patient.id,
              name: patient.name,
              email: patient.email,
              role: 'Paciente',
              patientId: patient.id,
            });
            return;
          }
        }
      }

      // 4. Se não encontrou paciente e a senha tem 6 dígitos (sem email ou email vazio), tenta como familiar
      if (!userFound && formData.password.trim().length === 6 && patientController) {
        const patients = patientController.getAllPatients();
        const patient = patients.find(p => p.accessCode === formData.password);
        if (patient) {
          userFound = true;
          if (onLogin) {
            onLogin({
              id: `family-${patient.id}`,
              name: `Familiar de ${patient.name}`,
              email: patient.email,
              role: 'Familiar',
              patientId: patient.id,
              isFamily: true,
            });
            return;
          }
        }
      }

      // 5. Se não encontrou nenhum tipo de usuário
      if (!userFound) {
        Alert.alert('Erro', 'Credenciais inválidas. Verifique seus dados e tente novamente.');
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
        <View style={styles.header}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Sistema Médico</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>E-mail ou Código de Acesso</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="email" size={20} color="#566246" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Digite seu e-mail"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>
            <Text style={styles.hint}>
              Para familiares: deixe o e-mail vazio e use apenas o código de acesso
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Senha ou Código de Acesso</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock" size={20} color="#566246" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Digite a senha ou código de acesso (6 dígitos)"
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                secureTextEntry={!showPassword && formData.password.length !== 6}
                keyboardType={!formData.email.trim() ? 'numeric' : 'default'}
                maxLength={!formData.email.trim() ? 6 : undefined}
                editable={!isLoading}
              />
              {formData.password.length !== 6 && (
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
              )}
            </View>
            <Text style={styles.hint}>
              Médicos e Pacientes: e-mail + senha{'\n'}
              Familiares: apenas código de acesso (6 dígitos)
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          <MaterialIcons name="login" size={20} color="#ffffff" />
          <Text style={styles.loginButtonText}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.forgotLink} onPress={onForgotPassword}>
          <Text style={styles.forgotLinkText}>Esqueceu a senha?</Text>
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
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#566246',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#4A4A48',
    textAlign: 'center',
    marginTop: 8,
  },
  hint: {
    fontSize: 12,
    color: '#4A4A48',
    marginTop: 6,
    fontStyle: 'italic',
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
  eyeIcon: {
    padding: 4,
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
  forgotLink: {
    alignItems: 'center',
    marginTop: 10,
  },
  forgotLinkText: {
    fontSize: 14,
    color: '#566246',
    fontWeight: '600',
  },
});

export default LoginView;


