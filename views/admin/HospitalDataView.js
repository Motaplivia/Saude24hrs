// View: HospitalDataView
// Tela de Dados do Hospital com design moderno

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { db } from '../../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import SectionHeader from '../shared/SectionHeader';

const HospitalDataView = () => {
  const [formData, setFormData] = useState({
    hospitalName: '',
    responsible: '',
    phone: '',
    nif: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Carrega dados do hospital do Firebase
  useEffect(() => {
    const loadHospitalData = async () => {
      try {
        const hospitalRef = doc(db, 'hospital', 'data');
        const hospitalSnap = await getDoc(hospitalRef);
        
        if (hospitalSnap.exists()) {
          const data = hospitalSnap.data();
          setFormData({
            hospitalName: data.hospitalName || 'Hospital Nossa Senhora da Paz',
            responsible: data.responsible || 'Sr. Claudio Souza',
            phone: data.phone || '933257841',
            nif: data.nif || '123456789-10',
            address: data.address || 'Rua Linda das Flores, n 876',
          });
        } else {
          // Dados padrão se não existir no Firebase
          setFormData({
            hospitalName: 'Hospital Nossa Senhora da Paz',
            responsible: 'Sr. Claudio Souza',
            phone: '933257841',
            nif: '123456789-10',
            address: 'Rua Linda das Flores, n 876',
          });
        }
      } catch (error) {
        console.error('Erro ao carregar dados do hospital:', error);
        // Dados padrão em caso de erro
        setFormData({
          hospitalName: 'Hospital Nossa Senhora da Paz',
          responsible: 'Sr. Claudio Souza',
          phone: '933257841',
          nif: '123456789-10',
          address: 'Rua Linda das Flores, n 876',
        });
      }
    };
    
    loadHospitalData();
  }, []);

  const handleSave = async () => {
    if (!formData.hospitalName.trim()) {
      Alert.alert('Erro', 'O nome do hospital é obrigatório');
      return;
    }

    setLoading(true);
    setSaved(false);
    
    try {
      const hospitalRef = doc(db, 'hospital', 'data');
      await setDoc(hospitalRef, {
        ...formData,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      
      setSaved(true);
      Alert.alert('Sucesso', 'Dados do hospital salvos com sucesso!');
      
      // Remove a mensagem de sucesso após 3 segundos
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Erro ao salvar dados do hospital:', error);
      Alert.alert('Erro', 'Não foi possível salvar os dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <SectionHeader title="Dados do Hospital" />

        <View style={styles.card}>
          {/* Hospital Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.hospitalIcon}>
              <MaterialIcons name="local-hospital" size={48} color="#566246" />
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Nome do Hospital</Text>
              <TextInput
                style={styles.input}
                value={formData.hospitalName}
                onChangeText={(text) => setFormData({ ...formData, hospitalName: text })}
                placeholder="Nome do hospital"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Responsável</Text>
              <TextInput
                style={styles.input}
                value={formData.responsible}
                onChangeText={(text) => setFormData({ ...formData, responsible: text })}
                placeholder="Nome do responsável"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Telemóvel</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
                placeholder="Número de telefone"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>NIF</Text>
              <TextInput
                style={styles.input}
                value={formData.nif}
                onChangeText={(text) => setFormData({ ...formData, nif: text })}
                placeholder="Número de identificação fiscal"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Endereço</Text>
              <TextInput
                style={styles.input}
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                placeholder="Endereço completo"
                placeholderTextColor="#999"
                multiline
                numberOfLines={2}
              />
            </View>
          </View>

          {saved && (
            <View style={styles.successMessage}>
              <MaterialIcons name="check-circle" size={20} color="#4caf50" />
              <Text style={styles.successText}>Dados salvos com sucesso!</Text>
            </View>)}

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <Text style={styles.saveButtonText}>Salvando...</Text>
            ) : (
              <>
                <MaterialIcons name="save" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.saveButtonText}>Gravar Informações</Text>
              </>
            )}
          </TouchableOpacity>
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
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#D8DAD3',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  hospitalIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#A4C2A5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    marginBottom: 24,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A4A48',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F1F2EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#4A4A48',
    borderWidth: 1,
    borderColor: '#D8DAD3',
    minHeight: 48,
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  successText: {
    fontSize: 14,
    color: '#4caf50',
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#566246',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HospitalDataView;
