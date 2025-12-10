// View: FichaPessoalView
// Tela de Ficha Pessoal

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';

const FichaPessoalView = ({ user, doctorController, onUpdateUser }) => {
  const [doctorData, setDoctorData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Busca dados do médico no banco de dados
  useEffect(() => {
    const loadDoctorData = async () => {
      if (doctorController && user?.email) {
        await doctorController.ensureLoaded();
        const doctor = doctorController.getDoctorByEmail(user.email);
        if (doctor) {
          setDoctorData(doctor);
          setFormData({
            name: doctor.name || '',
            email: doctor.email || '',
            phone: doctor.phone || '',
          });
        } else {
          // Se não encontrar no banco, usa dados do user
          setFormData({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
          });
        }
      }
    };
    loadDoctorData();
  }, [doctorController, user?.email]);

  const handleSave = async () => {
    try {
      // Validações
      if (!formData.name.trim()) {
        Alert.alert('Erro', 'Por favor, preencha o nome completo');
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

      if (doctorController && doctorData) {
        // Atualiza no banco de dados Firebase
        const updated = await doctorController.updateDoctor(doctorData.id, {
          fullName: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim() || '',
          specialty: doctorData.specialty,
          orderNumber: doctorData.orderNumber,
          status: doctorData.status,
        });
        
        if (updated) {
          // Atualiza os dados locais
          setDoctorData(updated);
          setFormData({
            name: updated.name || formData.name,
            email: updated.email || formData.email,
            phone: updated.phone || formData.phone,
          });
          
          Alert.alert('Sucesso', 'Dados atualizados com sucesso!');
        } else {
          Alert.alert('Erro', 'Não foi possível atualizar os dados');
        }
      } else if (onUpdateUser) {
        onUpdateUser(formData);
        Alert.alert('Sucesso', 'Dados atualizados com sucesso!');
      } else {
        Alert.alert('Erro', 'Sistema de atualização não disponível');
      }
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      Alert.alert('Erro', error.message || 'Erro ao atualizar dados. Tente novamente.');
    }
  };

  const initials = doctorData?.initials || user?.initials || user?.getInitials?.() || 'DM';

  return (
    <ScrollView style={styles.container}>
      {/* Ficha Pessoal Section */}
      <View style={styles.card}>
        <Text style={styles.title}>Ficha Pessoal</Text>
        <Text style={styles.subtitle}>Visualize e edite os seus dados pessoais</Text>

        {/* Profile Picture */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <TouchableOpacity style={styles.changePhotoButton}>
            <Text style={styles.changePhotoText}>Alterar Foto</Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Nome Completo</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Nome Completo"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="Email"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Telemóvel</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder="Telemóvel"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Gravar Informações</Text>
        </TouchableOpacity>
      </View>

      {/* Informação Profissional Section */}
      <View style={styles.card}>
        <Text style={styles.title}>Informação Profissional</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Numero de Ordem</Text>
          <Text style={styles.infoValue}>{doctorData?.orderNumber || 'N/A'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Especialidade</Text>
          <Text style={styles.infoValue}>{doctorData?.specialty || 'N/A'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Estado</Text>
          <Text style={[styles.infoValue, doctorData?.status === 'Ativo' && styles.infoValueActive]}>
            {doctorData?.status || 'N/A'}
          </Text>
        </View>
      </View>
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
    padding: 20,
    margin: 0,
    marginBottom: 0,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#566246',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#4A4A48',
    marginBottom: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#A4C2A5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#566246',
  },
  changePhotoButton: {
    borderWidth: 1,
    borderColor: '#A4C2A5',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#A4C2A5',
  },
  changePhotoText: {
    fontSize: 14,
    color: '#566246',
    fontWeight: '600',
  },
  form: {
    marginBottom: 20,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    color: '#4A4A48',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#F1F2EB',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#4A4A48',
    borderWidth: 1,
    borderColor: '#D8DAD3',
  },
  saveButton: {
    backgroundColor: '#566246',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D8DAD3',
  },
  infoLabel: {
    fontSize: 14,
    color: '#4A4A48',
  },
  infoValue: {
    fontSize: 14,
    color: '#566246',
    fontWeight: '600',
  },
  infoValueActive: {
    fontSize: 14,
    color: '#A4C2A5',
    fontWeight: '700',
  },
});

export default FichaPessoalView;

