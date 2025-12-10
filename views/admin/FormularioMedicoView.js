// View: FormularioMedicoView
// Formulário para adicionar/editar médico

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const FormularioMedicoView = ({ doctor, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialty: '',
    orderNumber: '',
    status: 'Ativo',
  });
  const [showSpecialtyModal, setShowSpecialtyModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Lista de especialidades disponíveis
  const specialties = [
    'Cardiologia',
    'Radiologia',
    'Pediatria',
    'Ortopedia',
    'Neurologia',
    'Pneumologia',
    'Endocrinologia',
    'Ginecologia',
    'Oftalmologia',
    'Dermatologia',
    'Psiquiatria',
    'Urologia',
    'Oncologia',
    'Anestesiologia',
    'Medicina Geral',
  ];

  // Lista de estados
  const statusOptions = ['Ativo', 'Inativo'];

  useEffect(() => {
    if (doctor) {
      setFormData({
        fullName: doctor.name || '',
        email: doctor.email || '',
        phone: doctor.phone || '',
        specialty: doctor.specialty || '',
        orderNumber: doctor.orderNumber || '',
        status: doctor.status || 'Ativo',
      });
    } else {
      // Formulário vazio para novo médico
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        specialty: '',
        orderNumber: '',
        status: 'Ativo',
      });
    }
  }, [doctor]);

  const getInitials = (name) => {
    if (!name) return 'CJ';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleSave = () => {
    // Validação básica
    if (!formData.fullName.trim()) {
      alert('Por favor, preencha o nome completo');
      return;
    }
    if (!formData.email.trim()) {
      alert('Por favor, preencha o email');
      return;
    }
    if (!formData.specialty.trim()) {
      alert('Por favor, preencha a especialidade');
      return;
    }

    if (onSave) {
      onSave(formData);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{doctor ? 'Editar Médico' : 'Novo Médico'}</Text>
          <Text style={styles.cardSubtitle}>
            {doctor ? 'Edite os dados do médico' : 'Adicione os dados do novo médico'}
          </Text>

          {/* Profile Picture Section */}
          <View style={styles.iconContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(formData.fullName)}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.addPhotoButton}>
            <Text style={styles.addPhotoText}>Adicionar Foto</Text>
          </TouchableOpacity>

          {/* Personal Information */}
          <View style={styles.section}>
            <View style={styles.field}>
              <Text style={styles.label}>Nome Completo</Text>
              <TextInput
                style={styles.input}
                value={formData.fullName}
                onChangeText={(text) => setFormData({ ...formData, fullName: text })}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Telemóvel</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Professional Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informação Profissional</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Especialidade</Text>
              <TouchableOpacity
                style={styles.selectInput}
                onPress={() => setShowSpecialtyModal(true)}
              >
                <Text style={[styles.selectText, !formData.specialty && styles.selectPlaceholder]}>
                  {formData.specialty || 'Selecione a especialidade'}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color="#566246" />
              </TouchableOpacity>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Numero de Ordem</Text>
              <TextInput
                style={styles.input}
                value={formData.orderNumber}
                onChangeText={(text) => setFormData({ ...formData, orderNumber: text })}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Estado</Text>
              <TouchableOpacity
                style={styles.selectInput}
                onPress={() => setShowStatusModal(true)}
              >
                <Text style={styles.selectText}>{formData.status}</Text>
                <MaterialIcons name="arrow-drop-down" size={24} color="#566246" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Gravar Informações</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal de seleção de especialidade */}
      <Modal
        visible={showSpecialtyModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSpecialtyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Especialidade</Text>
              <TouchableOpacity onPress={() => setShowSpecialtyModal(false)}>
                <MaterialIcons name="close" size={24} color="#566246" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {specialties.map((specialty) => (
                <TouchableOpacity
                  key={specialty}
                  style={[
                    styles.modalItem,
                    formData.specialty === specialty && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    setFormData({ ...formData, specialty });
                    setShowSpecialtyModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      formData.specialty === specialty && styles.modalItemTextSelected,
                    ]}
                  >
                    {specialty}
                  </Text>
                  {formData.specialty === specialty && (
                    <MaterialIcons name="check" size={18} color="#566246" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de seleção de estado */}
      <Modal
        visible={showStatusModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Estado</Text>
              <TouchableOpacity onPress={() => setShowStatusModal(false)}>
                <MaterialIcons name="close" size={24} color="#566246" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {statusOptions.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.modalItem,
                    formData.status === status && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    setFormData({ ...formData, status });
                    setShowStatusModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      formData.status === status && styles.modalItemTextSelected,
                    ]}
                  >
                    {status}
                  </Text>
                  {formData.status === status && (
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
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#D8DAD3',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A4A48',
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#566246',
    marginBottom: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#A4C2A5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#566246',
  },
  addPhotoButton: {
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#566246',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  addPhotoText: {
    fontSize: 14,
    color: '#566246',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A4A48',
    marginBottom: 15,
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
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#4A4A48',
    borderWidth: 1,
    borderColor: '#D8DAD3',
  },
  selectInput: {
    backgroundColor: '#F1F2EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#D8DAD3',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    fontSize: 16,
    color: '#4A4A48',
  },
  selectPlaceholder: {
    color: '#999',
  },
  // Estilos do modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
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
    fontWeight: '600',
    color: '#4A4A48',
  },
  modalList: {
    padding: 16,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F1F2EB',
  },
  modalItemSelected: {
    backgroundColor: '#A4C2A5',
  },
  modalItemText: {
    fontSize: 16,
    color: '#4A4A48',
  },
  modalItemTextSelected: {
    color: '#566246',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#566246',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FormularioMedicoView;

