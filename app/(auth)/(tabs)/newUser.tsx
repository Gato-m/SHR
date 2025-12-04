import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../theme';
import { Title } from '../../components/Typography';

type NewUser = {
  name: string;
  position?: string;
  email: string;
  phone?: string;
  avatar?: string; // storage path or url
};

export default function NewUserScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [imageUri, setImageUri] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Placeholder admin check (to be refined later)
  const [isAdmin, setIsAdmin] = useState(true);
  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.auth.getUser();
      // Simple placeholder: allow all; customize to restrict later
      setIsAdmin(true);
    };
    void checkAdmin();
  }, []);

  const previewSource = useMemo(() => (imageUri ? { uri: imageUri } : undefined), [imageUri]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Nepieciešama atļauja', 'Lūdzu, piešķiriet piekļuvi galerijai');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Nepieciešama atļauja', 'Lūdzu, piešķiriet piekļuvi kamerai');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadAvatarFromDevice = async (): Promise<string | undefined> => {
    if (!imageUri) return undefined;
    try {
      setUploading(true);
      const fileName = `user-${Date.now()}.jpg`;
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const { error } = await supabase.storage.from('avatars').upload(fileName, blob, {
        upsert: true,
        contentType: 'image/jpeg',
      });
      if (error) {
        Alert.alert('Kļūda', error.message);
        return undefined;
      }
      return fileName;
    } catch (e: any) {
      Alert.alert('Kļūda', e?.message || 'Neizdevās augšupielādēt attēlu');
      return undefined;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!isAdmin) {
      Alert.alert('Piekļuve liegta', 'Šī sadaļa pieejama tikai administratoriem');
      return;
    }
    if (!name.trim() || !email.trim()) {
      Alert.alert('Kļūda', 'Vārds un e‑pasts ir obligāti');
      return;
    }
    setSubmitting(true);
    try {
      let avatarPath: string | undefined;
      if (imageUri) {
        avatarPath = await uploadAvatarFromDevice();
      }

      const payload: NewUser & { role?: string } = {
        name: name.trim(),
        position: position.trim() || undefined,
        email: email.trim(),
        phone: phone.trim() || undefined,
        avatar: avatarPath || undefined,
        role: 'user',
      };

      let { error } = await supabase.from('users').insert(payload).select('id').single();
      if (error && (error as any)?.code === '42703') {
        const { error: retryError } = await supabase
          .from('users')
          .insert({
            name: payload.name,
            position: payload.position,
            email: payload.email,
            phone: payload.phone,
            avatar: payload.avatar,
          })
          .select('id')
          .single();
        error = retryError as any;
      }

      if (error) {
        Alert.alert('Kļūda', error.message);
        return;
      }

      Alert.alert('OK', 'Darbinieks izveidots');
      router.replace('/(auth)/(tabs)/staff');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      {previewSource ? (
        <Image source={previewSource} style={styles.topAvatar} />
      ) : (
        <Ionicons name="person-add" size={60} color={COLORS.primary} style={styles.topIcon} />
      )}
      <Title style={styles.title}>Jauns darbinieks</Title>
      <View style={styles.form}>
        <View style={styles.inputBlock}>
          <Text style={styles.label}>Vārds</Text>
          <View style={styles.inputInner}>
            <TextInput style={styles.textInput} value={name} onChangeText={setName} />
          </View>
        </View>
        <View style={styles.inputBlock}>
          <Text style={styles.label}>Amats</Text>
          <View style={styles.inputInner}>
            <TextInput style={styles.textInput} value={position} onChangeText={setPosition} />
          </View>
        </View>
        <View style={styles.inputBlock}>
          <Text style={styles.label}>E‑pasts</Text>
          <View style={styles.inputInner}>
            <TextInput
              style={styles.textInput}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        </View>
        <View style={styles.inputBlock}>
          <Text style={styles.label}>Tālrunis</Text>
          <View style={styles.inputInner}>
            <TextInput
              style={styles.textInput}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
        </View>
        <View style={styles.imageButtonsRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={pickImage}>
            <Ionicons name="image" size={20} color="#fff" />
            <Text style={styles.buttonText}>No galerijas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={takePhoto}>
            <Ionicons name="camera" size={20} color="#fff" />
            <Text style={styles.buttonText}>Uzņemt foto</Text>
          </TouchableOpacity>
        </View>
        {previewSource ? <Image source={previewSource} style={styles.preview} /> : null}

        <TouchableOpacity
          style={[styles.primaryButton, (uploading || submitting) && styles.buttonDisabled]}
          disabled={uploading || submitting}
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>{uploading ? 'Augšupielāde...' : 'Izveidot'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 30,
    paddingHorizontal: SPACING.md,
  },
  topIcon: {
    marginBottom: SPACING.sm,
  },
  topAvatar: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginBottom: SPACING.sm,
  },
  title: {
    marginBottom: SPACING.md,
  },
  form: {
    width: '90%',
    maxWidth: 520,
    gap: 8,
  },
  inputContainer: {
    width: '100%',
  },
  inputBlock: {
    width: '100%',
  },
  label: {
    marginBottom: SPACING.xs,
    color: COLORS.text,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: '500',
  },
  inputInner: {
    backgroundColor: COLORS.surface,
    borderRadius: SPACING.sm,
    borderBottomWidth: 0,
    paddingHorizontal: SPACING.sm,
  },
  textInput: {
    paddingVertical: SPACING.sm,
    color: COLORS.text,
    fontSize: TYPOGRAPHY.sizes.body,
  },
  preview: {
    width: 160,
    height: 160,
    borderRadius: SPACING.md,
    alignSelf: 'center',
    marginVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: COLORS.primaryDark,
    paddingVertical: SPACING.md,
    borderRadius: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  imageButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: '500',
  },
});
