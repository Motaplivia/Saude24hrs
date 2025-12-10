// Componente: SectionHeader
// Cabeçalho de seção reutilizável (título e subtítulo)

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SectionHeader = ({ title, subtitle }) => {
  return (
    <View style={styles.headerSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  headerSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A4A48',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#566246',
  },
});

export default SectionHeader;


