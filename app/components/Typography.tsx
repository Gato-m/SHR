// components/Typography.tsx
import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../../theme';

type TypographyProps = TextProps & {
  children: React.ReactNode;
  style?: object;
  variant?: 'primary' | 'secondary';
};

export const Title = ({ children, style, ...props }: TypographyProps) => (
  <Text style={[styles.title, style]} {...props}>
    {children}
  </Text>
);

export const Body = ({ children, style, variant = 'primary', ...props }: TypographyProps) => (
  <Text style={[styles.body, styles[variant], style]} {...props}>
    {children}
  </Text>
);

export const Caption = ({ children, style, ...props }: TypographyProps) => (
  <Text style={[styles.caption, style]} {...props}>
    {children}
  </Text>
);

const styles = StyleSheet.create({
  title: {
    fontSize: TYPOGRAPHY.sizes.title,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
  },
  body: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.regular,
  },
  primary: {
    color: COLORS.text,
  },
  secondary: {
    color: COLORS.textSecondary,
  },
  caption: {
    fontSize: TYPOGRAPHY.sizes.small,
    color: COLORS.textSecondary,
  },
});
