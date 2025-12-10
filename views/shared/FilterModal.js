// Componente: FilterModal
// Modal de filtro reutilizável

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const FilterModal = ({ 
  visible, 
  onClose, 
  title = 'Filtros',
  filterSections = [],
  onClearFilters,
  showClearButton = true
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#566246" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalList}>
            {filterSections.map((section, sectionIndex) => (
              <View key={sectionIndex}>
                <Text style={styles.filterSectionTitle}>{section.title}</Text>
                {section.options.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.modalItem,
                      option.selected && styles.modalItemSelected,
                    ]}
                    onPress={() => section.onSelect(option.value)}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        option.selected && styles.modalItemTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {option.selected && (
                      <MaterialIcons name="check" size={18} color="#566246" />
                    )}
                  </TouchableOpacity>
                ))}
                {sectionIndex < filterSections.length - 1 && (
                  <View style={styles.sectionDivider} />
                )}
              </View>
            ))}
            
            {showClearButton && onClearFilters && (
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={onClearFilters}
              >
                <Text style={styles.clearFiltersText}>Limpar Filtros</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A4A48',
    marginBottom: 12,
    marginTop: 8,
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
  sectionDivider: {
    height: 1,
    backgroundColor: '#D8DAD3',
    marginVertical: 16,
  },
  clearFiltersButton: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#566246',
    borderRadius: 12,
    alignItems: 'center',
  },
  clearFiltersText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default FilterModal;


