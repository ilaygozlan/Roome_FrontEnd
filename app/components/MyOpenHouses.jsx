import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
  I18nManager,
} from 'react-native';
import { FontAwesome5, Feather } from '@expo/vector-icons';
import * as Calendar from 'expo-calendar';

const MyOpenHouses = ({ visible, onClose, userId }) => {
  const [openHouses, setOpenHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [addingToCalendar, setAddingToCalendar] = useState(null);

  // Mock data - replace with actual API call
  const mockOpenHouses = [
    {
      id: 1,
      apartmentId: 101,
      location: 'דירה ברחוב הרצל 15, תל אביב',
      date: '2024-01-15',
      startTime: '14:00',
      endTime: '16:00',
      amountOfPeoples: 20,
      totalRegistrations: 12,
    },
    {
      id: 2,
      apartmentId: 102,
      location: 'דירה ברחוב דיזנגוף 8, תל אביב',
      date: '2024-01-18',
      startTime: '10:00',
      endTime: '12:00',
      amountOfPeoples: 15,
      totalRegistrations: 8,
    },
    {
      id: 3,
      apartmentId: 103,
      location: 'דירה ברחוב אלנבי 25, תל אביב',
      date: '2024-01-20',
      startTime: '16:00',
      endTime: '18:00',
      amountOfPeoples: 25,
      totalRegistrations: 18,
    },
  ];

  useEffect(() => {
    if (visible) {
      fetchOpenHouses();
    }
  }, [visible, userId]);

  const fetchOpenHouses = async () => {
    setLoading(true);
    setError(false);
    
    try {
      // Replace with actual API call
      // const response = await fetch(`https://roomebackend20250414140006.azurewebsites.net/OpenHouse/GetUserOpenHouses/${userId}`);
      // const data = await response.json();
      
      // For now, using mock data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      setOpenHouses(mockOpenHouses);
    } catch (err) {
      setError(true);
      console.error('Error fetching open houses:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCalendar = async (openHouse) => {
    setAddingToCalendar(openHouse.id);
    
    try {
      // Request calendar permissions
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('הרשאה נדרשת', 'יש לאשר גישה ליומן כדי להוסיף את האירוע');
        return;
      }

      // Get default calendar
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find(cal => cal.isPrimary) || calendars[0];
      
      if (!defaultCalendar) {
        Alert.alert('שגיאה', 'לא נמצא יומן ברירת מחדל');
        return;
      }

      // Create event details
      const startDate = new Date(`${openHouse.date}T${openHouse.startTime}:00`);
      const endDate = new Date(`${openHouse.date}T${openHouse.endTime}:00`);
      
      const eventDetails = {
        title: `בית פתוח - ${openHouse.location}`,
        startDate: startDate,
        endDate: endDate,
        timeZone: 'Asia/Jerusalem',
        location: openHouse.location,
        notes: `בית פתוח שנרשמת אליו. מספר משתתפים: ${openHouse.totalRegistrations}/${openHouse.amountOfPeoples}`,
        alarms: [{ relativeOffset: -60 }], // 1 hour before
      };

      // Create the event
      const eventId = await Calendar.createEventAsync(defaultCalendar.id, eventDetails);
      
      if (eventId) {
        Alert.alert('הצלחה', 'האירוע נוסף ליומן בהצלחה!');
      }
    } catch (err) {
      console.error('Error adding to calendar:', err);
      Alert.alert('שגיאה', 'שגיאה בהוספת האירוע ליומן');
    } finally {
      setAddingToCalendar(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    return timeString;
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
            <Text style={styles.headerTitle}>הבתים הפתוחים שלי</Text>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7C83FD" />
            <Text style={styles.loadingText}>טוען...</Text>
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
          <Text style={styles.headerTitle}>הבתים הפתוחים שלי</Text>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {error ? (
            <View style={styles.errorContainer}>
              <Feather name="alert-circle" size={48} color="#FF6B6B" />
              <Text style={styles.errorText}>שגיאה בטעינת הבתים הפתוחים</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchOpenHouses}>
                <Text style={styles.retryButtonText}>נסה שוב</Text>
              </TouchableOpacity>
            </View>
          ) : openHouses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <FontAwesome5 name="calendar-times" size={64} color="#A1A7B3" />
              <Text style={styles.emptyTitle}>אין בתים פתוחים</Text>
              <Text style={styles.emptySubtitle}>לא נרשמת עדיין לאף בית פתוח</Text>
            </View>
          ) : (
            openHouses.map((openHouse) => (
              <View key={openHouse.id} style={styles.card}>
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.locationContainer}>
                    <FontAwesome5 name="home" size={16} color="#7C83FD" />
                    <Text style={styles.locationText} numberOfLines={2}>
                      {openHouse.location}
                    </Text>
                  </View>
                  <View style={styles.dateContainer}>
                    <FontAwesome5 name="calendar-alt" size={16} color="#FF9F3D" />
                    <Text style={styles.dateText}>{formatDate(openHouse.date)}</Text>
                  </View>
                </View>

                {/* Time and Participants */}
                <View style={styles.cardDetails}>
                  <View style={styles.timeContainer}>
                    <FontAwesome5 name="clock" size={14} color="#A1A7B3" />
                    <Text style={styles.timeText}>
                      {formatTime(openHouse.startTime)} - {formatTime(openHouse.endTime)}
                    </Text>
                  </View>
                  
                  <View style={styles.participantsContainer}>
                    <FontAwesome5 name="users" size={14} color="#A1A7B3" />
                    <Text style={styles.participantsText}>
                      {openHouse.totalRegistrations}/{openHouse.amountOfPeoples} משתתפים
                    </Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${(openHouse.totalRegistrations / openHouse.amountOfPeoples) * 100}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {Math.round((openHouse.totalRegistrations / openHouse.amountOfPeoples) * 100)}% מלא
                  </Text>
                </View>

                {/* Add to Calendar Button */}
                <TouchableOpacity
                  style={[
                    styles.calendarButton,
                    addingToCalendar === openHouse.id && styles.calendarButtonLoading
                  ]}
                  onPress={() => addToCalendar(openHouse)}
                  disabled={addingToCalendar === openHouse.id}
                >
                  {addingToCalendar === openHouse.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <FontAwesome5 name="calendar-plus" size={16} color="#fff" />
                      <Text style={styles.calendarButtonText}>הוסף ליומן</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#7C83FD',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '700',
    color: '#222B45',
    textAlign: 'center',
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 16,
    color: '#A1A7B3',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222B45',
    marginLeft: 8,
    flex: 1,
    textAlign: 'right',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#FF9F3D',
    fontWeight: '600',
    marginLeft: 8,
    textAlign: 'right',
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: '#A1A7B3',
    marginLeft: 6,
    textAlign: 'right',
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsText: {
    fontSize: 14,
    color: '#A1A7B3',
    marginLeft: 6,
    textAlign: 'right',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F3F4F8',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7C83FD',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#A1A7B3',
    textAlign: 'right',
  },
  calendarButton: {
    backgroundColor: '#FF9F3D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#FF9F3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  calendarButtonLoading: {
    opacity: 0.7,
  },
  calendarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default MyOpenHouses; 