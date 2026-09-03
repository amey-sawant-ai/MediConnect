import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from '@/context/AuthContext';
import { getDashboardRoute } from '@/utils/roleRedirect';
import { HealthcareColors } from '@/constants/theme';

export default function EntryIndexScreen() {
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Hide native splash once React component renders
    SplashScreen.hideAsync().catch(() => {});

    // Small delay to allow session resolution
    const timer = setTimeout(() => {
      if (isAuthenticated && user) {
        router.replace(getDashboardRoute(user.role) as any);
      } else {
        router.replace('/(auth)/login' as any);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user]);

  return (
    <View style={styles.container}>
      <View style={styles.brandContainer}>
        <Image
          source={require('../../assets/images/app_logo.png')}
          style={styles.logoBadge}
          resizeMode="contain"
        />
        <Text style={styles.brandTitle}>MediConnect</Text>
        <Text style={styles.brandSubtitle}>Healthcare & Emergency Response</Text>
      </View>
      <ActivityIndicator size="large" color={HealthcareColors.emergencyRed} style={{ marginTop: 24 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandContainer: {
    alignItems: 'center',
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: HealthcareColors.emergencyRed,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#DC2626',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
});
