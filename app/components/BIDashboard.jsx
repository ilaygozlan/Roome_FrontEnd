import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  I18nManager,
  Dimensions,
} from 'react-native';
import { FontAwesome5, Feather, MaterialIcons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import API from '../config';

const { width: screenWidth } = Dimensions.get('window');

const BIDashboard = ({ visible, onClose, userId }) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [rentCalculatorVisible, setRentCalculatorVisible] = useState(false);
  const [calculatorData, setCalculatorData] = useState({
    location: '',
    size: '',
    rooms: '',
    floor: '',
    buildingAge: '',
  });

  // Mock data for charts
  const marketTrendsData = {
    labels: ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני'],
    datasets: [
      {
        data: [4500, 4700, 4800, 4900, 5100, 5200],
        color: (opacity = 1) => `rgba(124, 131, 253, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  const listingsData = {
    labels: ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני'],
    datasets: [
      {
        data: [120, 135, 142, 158, 165, 180],
        color: (opacity = 1) => `rgba(255, 159, 61, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  const popularAreasData = [
    {
      name: 'תל אביב מרכז',
      searches: 1250,
      favorites: 890,
      avgPrice: 5800,
      color: '#7C83FD',
    },
    {
      name: 'רמת גן',
      searches: 980,
      favorites: 650,
      avgPrice: 4800,
      color: '#FF9F3D',
    },
    {
      name: 'גבעתיים',
      searches: 850,
      favorites: 520,
      avgPrice: 5200,
      color: '#4ECDC4',
    },
    {
      name: 'פתח תקווה',
      searches: 720,
      favorites: 480,
      avgPrice: 4200,
      color: '#45B7D1',
    },
  ];

  const heatMapData = [
    { area: 'תל אביב מרכז', price: 5800, color: '#FF6B6B' },
    { area: 'רמת גן', price: 4800, color: '#FF9F3D' },
    { area: 'גבעתיים', price: 5200, color: '#4ECDC4' },
    { area: 'פתח תקווה', price: 4200, color: '#45B7D1' },
    { area: 'חולון', price: 3800, color: '#96CEB4' },
    { area: 'בת ים', price: 3500, color: '#FFEAA7' },
  ];

  useEffect(() => {
    if (visible) {
      // Simulate loading
      setTimeout(() => setLoading(false), 1500);
    }
  }, [visible]);

  const calculateRent = () => {
    const { location, size, rooms, floor, buildingAge } = calculatorData;
    
    if (!location || !size || !rooms) {
      Alert.alert('שגיאה', 'יש למלא את כל השדות הנדרשים');
      return;
    }

    // Mock calculation logic
    const basePrice = 3000;
    const sizeMultiplier = parseFloat(size) * 50;
    const roomsMultiplier = parseInt(rooms) * 200;
    const floorMultiplier = parseInt(floor) * 50;
    const ageMultiplier = Math.max(0, (2024 - parseInt(buildingAge)) * -20);

    const estimatedRent = basePrice + sizeMultiplier + roomsMultiplier + floorMultiplier + ageMultiplier;
    const minRent = estimatedRent * 0.85;
    const maxRent = estimatedRent * 1.15;

    Alert.alert(
      'הערכת שכירות',
      `מיקום: ${location}\nגודל: ${size} מ"ר\nחדרים: ${rooms}\nקומה: ${floor}\nגיל בניין: ${buildingAge}\n\nהערכת שכירות: ₪${estimatedRent.toLocaleString()}\nטווח מחירים: ₪${minRent.toLocaleString()} - ₪${maxRent.toLocaleString()}`,
      [{ text: 'אישור', style: 'default' }]
    );
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(124, 131, 253, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(34, 43, 69, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#7C83FD',
    },
  };

  const rtl = I18nManager.isRTL;

  if (loading) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Feather name="x" size={24} color="#222B45" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>לוח בקרה חכם</Text>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7C83FD" />
            <Text style={styles.loadingText}>טוען נתונים...</Text>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Feather name="x" size={24} color="#222B45" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>לוח בקרה חכם</Text>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
              סקירה כללית
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
            onPress={() => setActiveTab('analytics')}
          >
            <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>
              ניתוח נתונים
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'tools' && styles.activeTab]}
            onPress={() => setActiveTab('tools')}
          >
            <Text style={[styles.tabText, activeTab === 'tools' && styles.activeTabText]}>
              כלים
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'overview' && (
            <>
              {/* Quick Stats */}
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <FontAwesome5 name="chart-line" size={24} color="#7C83FD" />
                  <Text style={styles.statNumber}>₪5,200</Text>
                  <Text style={styles.statLabel}>מחיר ממוצע</Text>
                </View>
                <View style={styles.statCard}>
                  <FontAwesome5 name="home" size={24} color="#FF9F3D" />
                  <Text style={styles.statNumber}>180</Text>
                  <Text style={styles.statLabel}>דירות חדשות</Text>
                </View>
                <View style={styles.statCard}>
                  <FontAwesome5 name="trending-up" size={24} color="#4ECDC4" />
                  <Text style={styles.statNumber}>+12%</Text>
                  <Text style={styles.statLabel}>עלייה במחירים</Text>
                </View>
                <View style={styles.statCard}>
                  <FontAwesome5 name="users" size={24} color="#45B7D1" />
                  <Text style={styles.statNumber}>2,450</Text>
                  <Text style={styles.statLabel}>משתמשים פעילים</Text>
                </View>
              </View>

              {/* Market Trends Chart */}
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>מגמות שוק - מחירים ממוצעים</Text>
                <LineChart
                  data={marketTrendsData}
                  width={screenWidth - 40}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                />
              </View>

              {/* Popular Areas */}
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>אזורים פופולריים</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {popularAreasData.map((area, index) => (
                    <View key={index} style={styles.areaCard}>
                      <View style={[styles.areaColor, { backgroundColor: area.color }]} />
                      <Text style={styles.areaName}>{area.name}</Text>
                      <Text style={styles.areaPrice}>₪{area.avgPrice.toLocaleString()}</Text>
                      <Text style={styles.areaSearches}>{area.searches} חיפושים</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </>
          )}

          {activeTab === 'analytics' && (
            <>
              {/* New Listings Chart */}
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>דירות חדשות - חודשי</Text>
                <BarChart
                  data={listingsData}
                  width={screenWidth - 40}
                  height={220}
                  chartConfig={chartConfig}
                  style={styles.chart}
                  verticalLabelRotation={0}
                />
              </View>

              {/* Heat Map */}
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>מפת מחירים - אזורים</Text>
                <View style={styles.heatMapContainer}>
                  {heatMapData.map((item, index) => (
                    <View key={index} style={styles.heatMapItem}>
                      <View style={[styles.heatMapColor, { backgroundColor: item.color }]} />
                      <Text style={styles.heatMapArea}>{item.area}</Text>
                      <Text style={styles.heatMapPrice}>₪{item.price.toLocaleString()}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Demand vs Supply */}
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>ביקוש לעומת היצע</Text>
                <View style={styles.demandSupplyContainer}>
                  <View style={styles.demandSupplyItem}>
                    <Text style={styles.demandSupplyLabel}>ביקוש</Text>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: '75%', backgroundColor: '#7C83FD' }]} />
                    </View>
                    <Text style={styles.demandSupplyValue}>75%</Text>
                  </View>
                  <View style={styles.demandSupplyItem}>
                    <Text style={styles.demandSupplyLabel}>היצע</Text>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: '60%', backgroundColor: '#FF9F3D' }]} />
                    </View>
                    <Text style={styles.demandSupplyValue}>60%</Text>
                  </View>
                </View>
              </View>
            </>
          )}

          {activeTab === 'tools' && (
            <>
              {/* Rent Calculator */}
              <TouchableOpacity
                style={styles.toolCard}
                onPress={() => setRentCalculatorVisible(true)}
              >
                <View style={styles.toolIcon}>
                  <FontAwesome5 name="calculator" size={24} color="#7C83FD" />
                </View>
                <View style={styles.toolContent}>
                  <Text style={styles.toolTitle}>מחשבון שכירות</Text>
                  <Text style={styles.toolDescription}>
                    חשב הערכת שכירות לפי מיקום, גודל ופרמטרים נוספים
                  </Text>
                </View>
                <Feather name="chevron-left" size={20} color="#A1A7B3" />
              </TouchableOpacity>

              {/* ROI Calculator */}
              <TouchableOpacity style={styles.toolCard}>
                <View style={styles.toolIcon}>
                  <FontAwesome5 name="chart-pie" size={24} color="#FF9F3D" />
                </View>
                <View style={styles.toolContent}>
                  <Text style={styles.toolTitle}>מחשבון ROI</Text>
                  <Text style={styles.toolDescription}>
                    חשב תשואה על השקעה עבור נכסים להשקעה
                  </Text>
                </View>
                <Feather name="chevron-left" size={20} color="#A1A7B3" />
              </TouchableOpacity>

              {/* Price Prediction */}
              <TouchableOpacity style={styles.toolCard}>
                <View style={styles.toolIcon}>
                  <FontAwesome5 name="brain" size={24} color="#4ECDC4" />
                </View>
                <View style={styles.toolContent}>
                  <Text style={styles.toolTitle}>חיזוי מחירים</Text>
                  <Text style={styles.toolDescription}>
                    קבל חיזוי מחירים מבוסס בינה מלאכותית
                  </Text>
                </View>
                <Feather name="chevron-left" size={20} color="#A1A7B3" />
              </TouchableOpacity>

              {/* Cost Comparison */}
              <TouchableOpacity style={styles.toolCard}>
                <View style={styles.toolIcon}>
                  <FontAwesome5 name="balance-scale" size={24} color="#45B7D1" />
                </View>
                <View style={styles.toolContent}>
                  <Text style={styles.toolTitle}>השוואת עלויות</Text>
                  <Text style={styles.toolDescription}>
                    השווה עלויות מחיה בין אזורים שונים
                  </Text>
                </View>
                <Feather name="chevron-left" size={20} color="#A1A7B3" />
              </TouchableOpacity>
            </>
          )}
        </ScrollView>

        {/* Rent Calculator Modal */}
        <Modal
          visible={rentCalculatorVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setRentCalculatorVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>מחשבון שכירות</Text>
                <TouchableOpacity onPress={() => setRentCalculatorVisible(false)}>
                  <Feather name="x" size={24} color="#222B45" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.calculatorForm}>
                <TextInput
                  style={styles.input}
                  placeholder="מיקום (עיר/שכונה)"
                  value={calculatorData.location}
                  onChangeText={(text) => setCalculatorData({ ...calculatorData, location: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="גודל במ'ר"
                  value={calculatorData.size}
                  onChangeText={(text) => setCalculatorData({ ...calculatorData, size: text })}
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.input}
                  placeholder="מספר חדרים"
                  value={calculatorData.rooms}
                  onChangeText={(text) => setCalculatorData({ ...calculatorData, rooms: text })}
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.input}
                  placeholder="קומה"
                  value={calculatorData.floor}
                  onChangeText={(text) => setCalculatorData({ ...calculatorData, floor: text })}
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.input}
                  placeholder="גיל בניין"
                  value={calculatorData.buildingAge}
                  onChangeText={(text) => setCalculatorData({ ...calculatorData, buildingAge: text })}
                  keyboardType="numeric"
                />

                <TouchableOpacity style={styles.calculateButton} onPress={calculateRent}>
                  <Text style={styles.calculateButtonText}>חשב הערכה</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F8',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    left: 20,
    top: 60,
    padding: 8,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222B45',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F8',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#7C83FD',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A1A7B3',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#A1A7B3',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222B45',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#A1A7B3',
    marginTop: 4,
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222B45',
    marginBottom: 16,
    textAlign: 'right',
  },
  chart: {
    borderRadius: 16,
  },
  areaCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 120,
  },
  areaColor: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
  },
  areaName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222B45',
    textAlign: 'center',
    marginBottom: 4,
  },
  areaPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7C83FD',
    marginBottom: 4,
  },
  areaSearches: {
    fontSize: 12,
    color: '#A1A7B3',
  },
  heatMapContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  heatMapItem: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  heatMapColor: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginBottom: 8,
  },
  heatMapArea: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222B45',
    textAlign: 'center',
    marginBottom: 4,
  },
  heatMapPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7C83FD',
  },
  demandSupplyContainer: {
    marginTop: 16,
  },
  demandSupplyItem: {
    marginBottom: 16,
  },
  demandSupplyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222B45',
    marginBottom: 8,
    textAlign: 'right',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F3F4F8',
    borderRadius: 4,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  demandSupplyValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C83FD',
    textAlign: 'right',
  },
  toolCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  toolIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  toolContent: {
    flex: 1,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222B45',
    marginBottom: 4,
    textAlign: 'right',
  },
  toolDescription: {
    fontSize: 14,
    color: '#A1A7B3',
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F8',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222B45',
  },
  calculatorForm: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E1E5E9',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'right',
    backgroundColor: '#F8F9FA',
  },
  calculateButton: {
    backgroundColor: '#7C83FD',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  calculateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BIDashboard; 