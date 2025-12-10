// View: WardManagementView
// Tela de Gestão de Enfermarias e Leitos com lista, pesquisa e filtro

import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import SectionHeader from '../shared/SectionHeader';
import SearchBar from '../shared/SearchBar';
import FilterModal from '../shared/FilterModal';

const WardManagementView = ({ wardController }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingWard, setEditingWard] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedService, setSelectedService] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [wards, setWards] = useState([]);
  const [formData, setFormData] = useState({
    wardName: '',
    service: '',
    bedCount: '',
  });

  // Carrega as enfermarias do controller
  useEffect(() => {
    const loadWards = async () => {
      if (wardController) {
        await wardController.ensureLoaded();
        const allWards = wardController.getAllWards();
        setWards(allWards);
      }
    };
    loadWards();
    
    // Recarrega a cada 5 segundos para manter dados atualizados
    const interval = setInterval(loadWards, 5000);
    return () => clearInterval(interval);
  }, [wardController]);

  // Obter todos os serviços únicos
  const services = useMemo(() => {
    const unique = Array.from(new Set(wards.map(w => w.service).filter(Boolean)));
    return ['Todos', ...unique.sort()];
  }, [wards]);

  // Filtrar enfermarias por pesquisa, serviço e status
  const filteredWards = useMemo(() => {
    return wards.filter(ward => {
      const matchesSearch = ward.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           ward.service?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesService = selectedService === 'Todos' || ward.service === selectedService;
      const matchesStatus = selectedStatus === 'Todos' || ward.status === selectedStatus;
      return matchesSearch && matchesService && matchesStatus;
    });
  }, [wards, searchQuery, selectedService, selectedStatus]);

  const handleEdit = (ward) => {
    setEditingWard(ward);
    setFormData({
      wardName: ward.name,
      service: ward.service,
      bedCount: ward.totalBeds.toString(),
    });
    setShowForm(true);
  };

  const handleNewWard = () => {
    setEditingWard(null);
    setFormData({
      wardName: '',
      service: '',
      bedCount: '',
    });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingWard(null);
    setFormData({
      wardName: '',
      service: '',
      bedCount: '',
    });
  };

  const handleSave = async () => {
    try {
      if (editingWard) {
        // Atualizar enfermaria existente
        await wardController.updateWard(editingWard.id, formData);
        const allWards = wardController.getAllWards();
        setWards(allWards);
        console.log('Enfermaria atualizada');
      } else {
        // Adicionar nova enfermaria
        await wardController.addWard(formData);
        const allWards = wardController.getAllWards();
        setWards(allWards);
        console.log('Enfermaria adicionada');
      }
      handleCloseForm();
    } catch (error) {
      console.error('Erro ao salvar enfermaria:', error);
      alert(error.message);
    }
  };

  const handleDelete = async (wardId) => {
    Alert.alert(
      'Confirmar Remoção',
      'Tem certeza que deseja remover esta enfermaria?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await wardController.deleteWard(wardId);
              const allWards = wardController.getAllWards();
              setWards(allWards);
              console.log('Enfermaria removida');
            } catch (error) {
              console.error('Erro ao remover enfermaria:', error);
              Alert.alert('Erro', error.message);
            }
          },
        },
      ]
    );
  };

  if (showForm) {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <SectionHeader
          title={editingWard ? 'Editar Enfermaria' : 'Nova Enfermaria'}
        />

          <View style={styles.formCard}>
            <View style={styles.field}>
              <Text style={styles.label}>Nome da Enfermaria</Text>
              <TextInput
                style={styles.input}
                value={formData.wardName}
                onChangeText={(text) => setFormData({ ...formData, wardName: text })}
                placeholder="Ex: Enfermaria A"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Serviço</Text>
              <TextInput
                style={styles.input}
                value={formData.service}
                onChangeText={(text) => setFormData({ ...formData, service: text })}
                placeholder="Ex: Cardiologia"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Número de Camas</Text>
              <TextInput
                style={styles.input}
                value={formData.bedCount}
                onChangeText={(text) => setFormData({ ...formData, bedCount: text })}
                keyboardType="numeric"
                placeholder="Ex: 20"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCloseForm}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <SectionHeader title="Enfermarias" />

        <SearchBar
          placeholder="Pesquisar enfermarias..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFilterPress={() => setShowFilterModal(true)}
        />

        {/* Lista de enfermarias */}
        <View style={styles.listContainer}>
          {filteredWards.length > 0 ? (
            filteredWards.map((ward) => (
              <View key={ward.id} style={styles.listItem}>
                <View style={styles.wardHeader}>
                  <View style={styles.wardInfo}>
                    <Text style={styles.wardName}>{ward.name}</Text>
                    <Text style={styles.wardService}>{ward.service}</Text>
                    <View style={styles.statusContainer}>
                      <View
                        style={[
                          styles.statusBadge,
                          ward.status === 'Ativa' ? styles.statusActive : styles.statusInactive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.wardStatus,
                            ward.status === 'Ativa' ? styles.statusActiveText : styles.statusInactiveText,
                          ]}
                        >
                          {ward.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.bedInfo}>
                    <MaterialIcons name="hotel" size={24} color="#566246" />
                    <Text style={styles.bedCountText}>
                      {ward.occupiedBeds || 0}/{ward.totalBeds || 0}
                    </Text>
                    <Text style={styles.bedLabel}>ocupadas</Text>
                  </View>
                </View>
                <View style={styles.wardActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEdit(ward)}
                  >
                    <MaterialIcons name="edit" size={18} color="#fff" />
                    <Text style={styles.editButtonText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(ward.id)}
                  >
                    <MaterialIcons name="delete" size={18} color="#fff" />
                    <Text style={styles.deleteButtonText}>Remover</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Nenhuma enfermaria encontrada</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Botão flutuante para adicionar enfermaria */}
      <TouchableOpacity style={styles.fabButton} onPress={handleNewWard}>
        <MaterialIcons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="Filtros"
        filterSections={[
          {
            title: 'Serviço',
            options: services.map(service => ({
              label: service,
              value: service,
              selected: selectedService === service,
            })),
            onSelect: (value) => setSelectedService(value),
          },
          {
            title: 'Status',
            options: [
              { label: 'Todos', value: 'Todos', selected: selectedStatus === 'Todos' },
              { label: 'Ativa', value: 'Ativa', selected: selectedStatus === 'Ativa' },
              { label: 'Inativa', value: 'Inativa', selected: selectedStatus === 'Inativa' },
            ],
            onSelect: (value) => setSelectedStatus(value),
          },
        ]}
        onClearFilters={() => {
          setSelectedService('Todos');
          setSelectedStatus('Todos');
          setShowFilterModal(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F2EB',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  // Formulário
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#D8DAD3',
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
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#D8DAD3',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A4A48',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#566246',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Lista de enfermarias
  listContainer: {
    marginTop: 8,
  },
  listItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D8DAD3',
  },
  wardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  wardInfo: {
    flex: 1,
  },
  wardName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A4A48',
    marginBottom: 4,
  },
  wardService: {
    fontSize: 14,
    color: '#566246',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#A4C2A5',
  },
  statusInactive: {
    backgroundColor: '#D8DAD3',
  },
  wardStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusActiveText: {
    color: '#566246',
  },
  statusInactiveText: {
    color: '#4A4A48',
  },
  bedInfo: {
    alignItems: 'center',
  },
  bedCountText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4A4A48',
    marginTop: 4,
  },
  bedLabel: {
    fontSize: 12,
    color: '#566246',
  },
  wardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#566246',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d32f2f',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#566246',
  },
  // Botão flutuante
  fabButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#566246',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

export default WardManagementView;
