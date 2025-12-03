import { default as React, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { COLORS, SPACING } from '../../../theme';
import { Body, Caption, Title } from '../../components/Typography';

export default function HomeScreen() {
  const [status, setStatus] = useState<string>('Checking...');

  useEffect(() => {
    const checkConnection = async () => {
      // Mēģinām paņemt 1 ierakstu no kādas tabulas, piemēram "profiles"
      const { data, error } = await supabase.from('users').select('*').limit(5);

      if (error) {
        setStatus(`Error: ${error.message}`);
      } else {
        setStatus(`Connected! Got ${data?.length ?? 0} rows`);
      }
    };

    checkConnection();
  }, []);

  return (
    <View style={styles.container}>
      <Text>{status}</Text>
      <Title>Prombūtne (entrypoint) screen</Title>
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
