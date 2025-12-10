// View: PatientManagementView
// Tela de Gestão de Pacientes (Admin) com lista, pesquisa e filtro

import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import SectionHeader from '../shared/SectionHeader';
import SearchBar from '../shared/SearchBar';
import FilterModal from '../shared/FilterModal';

const PatientManagementView = ({ patientController }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [selectedService, setSelectedService] = useState('Todos');
  const [patients, setPatients] = useState([]);

  // Carrega os pacientes do controller
  useEffect(() => {
    const loadPatients = async () => {
      if (patientController) {
        if (patientController.ensureLoaded) {
          await patientController.ensureLoaded();
        }
        const allPatients = patientController.getAllPatients();
        setPatients(allPatients);
      }
    };
    loadPatients();
    
    // Recarrega a cada 5 segundos para manter dados atualizados
    const interval = setInterval(loadPatients, 5000);
    return () => clearInterval(interval);
  }, [patientController]);

  // Obter todos os status únicos
  const statuses = useMemo(() => {
    const unique = Array.from(new Set(patients.map(p => p.status).filter(Boolean)));
    return ['Todos', ...unique.sort()];
  }, [patients]);

  // Obter todos os serviços únicos
  const services = useMemo(() => {
    const unique = Array.from(new Set(patients.map(p => p.service).filter(Boolean)));
    return ['Todos', ...unique.sort()];
  }, [patients]);

  // Extrai iniciais do nome
  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Filtrar pacientes por pesquisa, status e serviço
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      const matchesSearch = patient.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           patient.userNumber?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus === 'Todos' || patient.status === selectedStatus;
      const matchesService = selectedService === 'Todos' || patient.service === selectedService;
      return matchesSearch && matchesStatus && matchesService;
    });
  }, [patients, searchQuery, selectedStatus, selectedService]);

  // Obtém a cor do status
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'ativo':
      case 'internado':
        return '#4caf50';
      case 'em alta':
        return '#d32f2f';
      case 'alta':
        return '#d32f2f';
      default:
        return '#666';
    }
  };

  // Formata o status para exibição
  const formatStatus = (status) => {
    if (!status) return 'N/A';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <SectionHeader title="Pacientes" />

        <SearchBar
          placeholder="Pesquisar pacientes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFilterPress={() => setShowFilterModal(true)}
        />

        {/* Lista de pacientes */}
        <View style={styles.listContainer}>
          {filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => (
              <TouchableOpacity
                key={patient.id}
                style={styles.listItem}
                onPress={() => {
                  // Aqui pode adicionar navegação para detalhes do paciente
                  console.log('Paciente selecionado:', patient);
                }}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{getInitials(patient.name)}</Text>
                </View>
                <View style={styles.patientInfo}>
                  <Text style={styles.patientName}>{patient.name}</Text>
                  <Text style={styles.patientNumber}>{patient.userNumber || 'N/A'}</Text>
                  <Text style={styles.patientService}>{patient.service || 'N/A'}</Text>
                  <View style={styles.statusContainer}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(patient.status) + '20' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.patientStatus,
                          { color: getStatusColor(patient.status) },
                        ]}
                      >
                        {formatStatus(patient.status)}
                      </Text>
                    </View>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#566246" />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Nenhum paciente encontrado</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="Filtros"
        filterSections={[
          {
            title: 'Status',
            options: statuses.map(status => ({
              label: status,
              value: status,
              selected: selectedStatus === status,
            })),
            onSelect: (value) => setSelectedStatus(value),
          },
          {
            title: 'Serviço',
            options: services.map(service => ({
              label: service,
              value: service,
              selected: selectedService === service,
            })),
            onSelect: (value) => setSelectedService(value),
          },
        ]}
        onClearFilters={() => {
          setSelectedStatus('Todos');
          setSelectedService('Todos');
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
  // Lista de pacientes
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
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A4A48',
    marginBottom: 4,
  },
  patientNumber: {
    fontSize: 14,
    color: '#566246',
    marginBottom: 4,
  },
  patientService: {
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
  patientStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#566246',
  },
});

export default PatientManagementView;
