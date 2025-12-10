// View: GestaoMedicosView
// Tela de Gestão de Médicos

import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import FormularioMedicoView from './FormularioMedicoView';
import SectionHeader from '../shared/SectionHeader';
import SearchBar from '../shared/SearchBar';
import FilterModal from '../shared/FilterModal';

const GestaoMedicosView = ({ onNavigate, doctorController }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState('Todas');
  const [doctors, setDoctors] = useState([]);

  // Carrega os médicos do controller
  useEffect(() => {
    const loadDoctors = async () => {
      if (doctorController) {
        // Garante que os dados estão carregados
        await doctorController.ensureLoaded();
        const allDoctors = doctorController.getAllDoctors();
        setDoctors(allDoctors);
      }
    };
    loadDoctors();
  }, [doctorController]);

  // Obter todas as especialidades únicas
  const specialties = useMemo(() => {
    const unique = Array.from(new Set(doctors.map(d => d.specialty).filter(Boolean)));
    return ['Todas', ...unique.sort()];
  }, [doctors]);

  // Filtrar médicos por pesquisa e especialidade
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doctor => {
      const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSpecialty = selectedSpecialty === 'Todas' || doctor.specialty === selectedSpecialty;
      return matchesSearch && matchesSpecialty;
    });
  }, [doctors, searchQuery, selectedSpecialty]);

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor);
    setShowForm(true);
  };

  const handleNewDoctor = () => {
    setEditingDoctor(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingDoctor(null);
  };

  if (showForm) {
    return (
      <FormularioMedicoView
        doctor={editingDoctor}
        onClose={handleCloseForm}
        onSave={async (doctorData) => {
          try {
            if (editingDoctor) {
              // Atualizar médico existente
              const updated = await doctorController.updateDoctor(editingDoctor.id, doctorData);
              if (updated) {
                const allDoctors = doctorController.getAllDoctors();
                setDoctors(allDoctors);
                console.log('Médico atualizado:', updated);
              }
            } else {
              // Adicionar novo médico
              const newDoctor = await doctorController.addDoctor(doctorData);
              
              // Atualiza a lista de médicos
              const allDoctors = doctorController.getAllDoctors();
              setDoctors(allDoctors);
              
              // Limpa o filtro de especialidade para mostrar o novo médico
              setSelectedSpecialty('Todas');
              
              // Exibe a senha no console
              console.log('═══════════════════════════════════════════════════');
              console.log('✅ MÉDICO ADICIONADO COM SUCESSO!');
              console.log('═══════════════════════════════════════════════════');
              console.log('Nome:', newDoctor.name);
              console.log('Email:', newDoctor.email);
              console.log('Especialidade:', newDoctor.specialty);
              console.log('───────────────────────────────────────────────────');
              console.log('🔑 SENHA DE ACESSO:', newDoctor.password);
              console.log('───────────────────────────────────────────────────');
              console.log('📧 Esta senha será enviada por email para o médico.');
              console.log('O médico pode acessar o sistema com:');
              console.log('  Email:', newDoctor.email);
              console.log('  Senha:', newDoctor.password);
              console.log('═══════════════════════════════════════════════════');
            }
            handleCloseForm();
          } catch (error) {
            console.error('Erro ao salvar médico:', error.message);
            alert(error.message);
          }
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <SectionHeader title="Médicos" />

        <SearchBar
          placeholder="Pesquisar médicos..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFilterPress={() => setShowFilterModal(true)}
        />

        {/* Lista de médicos */}
        <View style={styles.listContainer}>
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor) => (
              <TouchableOpacity
                key={doctor.id}
                style={styles.listItem}
                onPress={() => handleEdit(doctor)}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{doctor.initials}</Text>
                </View>
                <View style={styles.doctorInfo}>
                  <Text style={styles.doctorName}>{doctor.name}</Text>
                  <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                  <View style={styles.statusContainer}>
                    <View
                      style={[
                        styles.statusBadge,
                        doctor.status === 'Ativo' ? styles.statusActive : styles.statusInactive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.doctorStatus,
                          doctor.status === 'Ativo' ? styles.statusActiveText : styles.statusInactiveText,
                        ]}
                      >
                        {doctor.status}
                      </Text>
                    </View>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#566246" />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Nenhum médico encontrado</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Botão flutuante para adicionar médico */}
      <TouchableOpacity style={styles.fabButton} onPress={handleNewDoctor}>
        <MaterialIcons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="Filtrar por Especialidade"
        filterSections={[
          {
            title: 'Especialidade',
            options: specialties.map(specialty => ({
              label: specialty,
              value: specialty,
              selected: selectedSpecialty === specialty,
            })),
            onSelect: (value) => {
              setSelectedSpecialty(value);
              setShowFilterModal(false);
            },
          },
        ]}
        showClearButton={false}
      />

      {/* Formulário de médico */}
      {showForm && (
        <FormularioMedicoView
          doctor={editingDoctor}
          onClose={handleCloseForm}
          onSave={(doctorData) => {
            console.log('Médico salvo:', doctorData);
            handleCloseForm();
          }}
        />
      )}
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
  filterIcon: {
    fontSize: 20,
  },
  // Lista de médicos
  listContainer: {
    marginTop: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D8DAD3',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#A4C2A5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#566246',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A4A48',
    marginBottom: 4,
  },
  doctorSpecialty: {
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
  doctorStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusActiveText: {
    color: '#566246',
  },
  statusInactiveText: {
    color: '#4A4A48',
  },
  arrowIcon: {
    fontSize: 24,
    color: '#566246',
    fontWeight: '300',
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
  fabIcon: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
  },
});

export default GestaoMedicosView;

