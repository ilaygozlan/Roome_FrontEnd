import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  I18nManager,
} from 'react-native';
import { FontAwesome5, Feather } from '@expo/vector-icons';
import BIDashboard from '../components/BIDashboard';

const Analytics = () => {
  const [showBIDashboard, setShowBIDashboard] = useState(false);

  const analyticsFeatures = [
    {
      id: 1,
      title: 'מחשבון שכירות',
      description: 'חשב הערכת שכירות לפי פרמטרים שונים',
      icon: 'calculator',
      color: '#7C83FD',
    },
    {
      id: 2,
      title: 'מגמות שוק',
      description: 'צפה במגמות מחירים ופעילות שוק',
      icon: 'chart-line',
      color: '#FF9F3D',
    },
    {
      id: 3,
      title: 'מפת מחירים',
      description: 'השווה מחירים בין אזורים שונים',
      icon: 'map-marked-alt',
      color: '#4ECDC4',
    },
    {
      id: 4,
      title: 'חיזוי מחירים',
      description: 'קבל חיזוי מחירים מבוסס בינה מלאכותית',
      icon: 'brain',
      color: '#45B7D1',
    },
    {
      id: 5,
      title: 'ניתוח השקעות',
      description: 'חשב תשואה על השקעה בנכסים',
      icon: 'chart-pie',
      color: '#FF6B6B',
    },
    {
      id: 6,
      title: 'השוואת עלויות',
      description: 'השווה עלויות מחיה בין אזורים',
      icon: 'balance-scale',
      color: '#96CEB4',
    },
  ];

  const rtl = I18nManager.isRTL;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ניתוח נתונים</Text>
        <Text style={styles.headerSubtitle}>כלים חכמים לקבלת החלטות</Text>
      </View>

      {/* Quick Access Button */}
      <TouchableOpacity
        style={styles.quickAccessButton}
        onPress={() => setShowBIDashboard(true)}
      >
        <View style={styles.quickAccessContent}>
          <FontAwesome5 name="chart-bar" size={24} color="#fff" />
          <View style={styles.quickAccessText}>
            <Text style={styles.quickAccessTitle}>לוח בקרה מלא</Text>
            <Text style={styles.quickAccessDescription}>
              גש לכל הכלים והניתוחים במקום אחד
            </Text>
          </View>
        </View>
        <Feather name="chevron-left" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Features Grid */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>כלים זמינים</Text>
        
        <View style={styles.featuresGrid}>
          {analyticsFeatures.map((feature) => (
            <TouchableOpacity
              key={feature.id}
              style={styles.featureCard}
              onPress={() => setShowBIDashboard(true)}
            >
              <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                <FontAwesome5 name={feature.icon} size={20} color="#fff" />
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats Preview */}
        <View style={styles.statsPreview}>
          <Text style={styles.sectionTitle}>סטטיסטיקות מהירות</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>₪5,200</Text>
              <Text style={styles.statLabel}>מחיר ממוצע</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>+12%</Text>
              <Text style={styles.statLabel}>עלייה במחירים</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>180</Text>
              <Text style={styles.statLabel}>דירות חדשות</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* BI Dashboard Modal */}
      <BIDashboard
        visible={showBIDashboard}
        onClose={() => setShowBIDashboard(false)}
        userId="current-user"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F8',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#222B45',
    textAlign: 'right',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#A1A7B3',
    textAlign: 'right',
  },
  quickAccessButton: {
    backgroundColor: '#7C83FD',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#7C83FD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  quickAccessContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  quickAccessText: {
    marginLeft: 16,
    flex: 1,
  },
  quickAccessTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'right',
  },
  quickAccessDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'right',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222B45',
    marginBottom: 16,
    textAlign: 'right',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222B45',
    textAlign: 'center',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#A1A7B3',
    textAlign: 'center',
    lineHeight: 20,
  },
  statsPreview: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#7C83FD',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#A1A7B3',
    textAlign: 'center',
  },
});

export default Analytics; 