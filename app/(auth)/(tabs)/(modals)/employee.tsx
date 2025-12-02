import React from 'react';
import { StyleSheet, View } from 'react-native';
import { COLORS, SPACING } from '../../../../theme';
import { Body, Caption, Title } from '../../../components/Typography';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Title>Employee modal screen</Title>
      <Body variant="primary">Šis ir pamatteksts</Body>
      <Body variant="secondary">Šis ir sekundārais teksts</Body>
      <Caption>Maza piezīme</Caption>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    justifyContent: 'center',
  },
});
