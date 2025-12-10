// Componente: SearchBar
// Barra de pesquisa com botão de filtro reutilizável

import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const SearchBar = ({ 
  placeholder = 'Pesquisar...', 
  value, 
  onChangeText, 
  onFilterPress,
  showFilter = true 
}) => {
  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={20} color="#566246" style={{ marginRight: 10 }} />
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor="#999"
        />
      </View>
      {showFilter && (
        <TouchableOpacity
          style={styles.filterButton}
          onPress={onFilterPress}
        >
          <MaterialIcons name="filter-list" size={20} color="#566246" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#D8DAD3',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#4A4A48',
    height: '100%',
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: '#A4C2A5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SearchBar;


