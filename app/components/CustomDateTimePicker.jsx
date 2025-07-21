import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, Text, StyleSheet, Platform, ScrollView, I18nManager } from 'react-native';

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function pad(num) {
  return num.toString().padStart(2, '0');
}

const yearsRange = (start, end) => {
  const arr = [];
  for (let y = start; y <= end; y++) arr.push(y);
  return arr;
};

const HEBREW_LABELS = {
  year: 'שנה',
  month: 'חודש',
  day: 'יום',
  hour: 'שעה',
  minute: 'דקה',
};

const MONTHS_HE = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
];

const CustomDateTimePicker = ({
  mode = 'date',
  value = new Date(),
  onChange,
  minimumDate,
  maximumDate,
  style,
  ...props
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [tempDate, setTempDate] = useState(value || new Date());

  // Date picker state
  const currentYear = value.getFullYear();
  const currentMonth = value.getMonth();
  const currentDay = value.getDate();

  // Time picker state
  const currentHour = value.getHours();
  const currentMinute = value.getMinutes();

  // For year range, default 1900-2100
  const minYear = minimumDate ? minimumDate.getFullYear() : 1900;
  const maxYear = maximumDate ? maximumDate.getFullYear() : 2100;
  const years = yearsRange(minYear, maxYear);
  const months = Array.from({ length: 12 }, (_, i) => i);
  const days = Array.from({ length: getDaysInMonth(tempDate.getFullYear(), tempDate.getMonth()) }, (_, i) => i + 1);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const openModal = () => {
    setTempDate(value || new Date());
    setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);

  const handleConfirm = () => {
    setModalVisible(false);
    if (onChange) {
      // Mimic the native event signature
      onChange({ type: 'set' }, new Date(tempDate));
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    if (onChange) {
      onChange({ type: 'dismissed' }, value);
    }
  };

  // Renderers for pickers
  const renderDatePicker = () => (
    <View style={[styles.pickerRow, styles.hebrewDirection]}>
      {/* Year */}
      <View style={styles.pickerColWrap}>
        <Text style={styles.pickerColTitle}>{HEBREW_LABELS.year}</Text>
        <ScrollView style={styles.pickerCol} contentContainerStyle={styles.pickerColContent}>
          {years.map((y) => (
            <TouchableOpacity key={y} onPress={() => setTempDate(new Date(y, tempDate.getMonth(), tempDate.getDate(), tempDate.getHours(), tempDate.getMinutes()))}>
              <Text style={[styles.pickerItem, tempDate.getFullYear() === y && styles.selected]}>{y}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {/* Month */}
      <View style={styles.pickerColWrap}>
        <Text style={styles.pickerColTitle}>{HEBREW_LABELS.month}</Text>
        <ScrollView style={styles.pickerCol} contentContainerStyle={styles.pickerColContent}>
          {months.map((m) => (
            <TouchableOpacity key={m} onPress={() => setTempDate(new Date(tempDate.getFullYear(), m, tempDate.getDate(), tempDate.getHours(), tempDate.getMinutes()))}>
              <Text style={[styles.pickerItem, tempDate.getMonth() === m && styles.selected]}>{MONTHS_HE[m]}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {/* Day */}
      <View style={styles.pickerColWrap}>
        <Text style={styles.pickerColTitle}>{HEBREW_LABELS.day}</Text>
        <ScrollView style={styles.pickerCol} contentContainerStyle={styles.pickerColContent}>
          {days.map((d) => (
            <TouchableOpacity key={d} onPress={() => setTempDate(new Date(tempDate.getFullYear(), tempDate.getMonth(), d, tempDate.getHours(), tempDate.getMinutes()))}>
              <Text style={[styles.pickerItem, tempDate.getDate() === d && styles.selected]}>{pad(d)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  const renderTimePicker = () => (
    <View style={[styles.pickerRow, styles.hebrewDirection]}>
      {/* Hour */}
      <View style={styles.pickerColWrap}>
        <Text style={styles.pickerColTitle}>{HEBREW_LABELS.hour}</Text>
        <ScrollView style={styles.pickerCol} contentContainerStyle={styles.pickerColContent}>
          {hours.map((h) => (
            <TouchableOpacity key={h} onPress={() => setTempDate(new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate(), h, tempDate.getMinutes()))}>
              <Text style={[styles.pickerItem, tempDate.getHours() === h && styles.selected]}>{pad(h)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {/* Minute */}
      <View style={styles.pickerColWrap}>
        <Text style={styles.pickerColTitle}>{HEBREW_LABELS.minute}</Text>
        <ScrollView style={styles.pickerCol} contentContainerStyle={styles.pickerColContent}>
          {minutes.map((m) => (
            <TouchableOpacity key={m} onPress={() => setTempDate(new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate(), tempDate.getHours(), m))}>
              <Text style={[styles.pickerItem, tempDate.getMinutes() === m && styles.selected]}>{pad(m)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  // Display value
  let displayValue = '';
  if (mode === 'date') {
    displayValue = `${pad(currentDay)}/${pad(currentMonth + 1)}/${currentYear}`;
  } else {
    displayValue = `${pad(currentHour)}:${pad(currentMinute)}`;
  }

  return (
    <View style={style}>
      <TouchableOpacity onPress={openModal} style={styles.displayButton}>
        <Text style={styles.displayText}>{displayValue}</Text>
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{mode === 'date' ? 'בחר תאריך' : 'בחר שעה'}</Text>
            {mode === 'date' ? renderDatePicker() : renderTimePicker()}
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={handleCancel} style={styles.actionButton}>
                <Text style={styles.actionText}>ביטול</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirm} style={styles.actionButton}>
                <Text style={styles.actionText}>אישור</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  displayButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  displayText: {
    color: '#333',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: 320,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  pickerRow: {
    flexDirection: 'row-reverse', // Hebrew RTL
    justifyContent: 'center',
    marginBottom: 20,
  },
  hebrewDirection: {
    flexDirection: 'row-reverse',
  },
  pickerColWrap: {
    alignItems: 'center',
    marginHorizontal: 5,
  },
  pickerColTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#555',
    textAlign: 'center',
  },
  pickerCol: {
    width: 70,
    maxHeight: 150,
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
  },
  pickerColContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  pickerItem: {
    fontSize: 16,
    paddingVertical: 6,
    color: '#333',
  },
  selected: {
    color: '#E3965A',
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },
  actionText: {
    color: '#E3965A',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CustomDateTimePicker; 