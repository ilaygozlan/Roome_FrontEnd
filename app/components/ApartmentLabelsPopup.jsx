import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const labelToIcon = {
  "couch": <FontAwesome5 name="couch" size={30} />,
  "sofa": <FontAwesome5 name="couch" size={30} />,
  "armchair": <MaterialCommunityIcons name="seat" size={30} />,
  "chair": <MaterialIcons name="chair" size={30} />,
  "bench": <MaterialCommunityIcons name="bench-back" size={30} />,
  "table": <MaterialIcons name="table-restaurant" size={30} />,
  "coffee table": <MaterialCommunityIcons name="coffee" size={30} />,
  "dining table": <MaterialIcons name="table-restaurant" size={30} />,
  "desk": <MaterialCommunityIcons name="desk" size={30} />,
  "nightstand": <MaterialCommunityIcons name="bedside-table" size={30} />,
  "bed": <FontAwesome5 name="bed" size={30} />,
  "bunk bed": <MaterialCommunityIcons name="bunk-bed" size={30} />,
  "mattress": <MaterialCommunityIcons name="bed-king" size={30} />,
  "dresser": <MaterialCommunityIcons name="dresser" size={30} />,
  "wardrobe": <MaterialCommunityIcons name="wardrobe" size={30} />,
  "closet": <MaterialCommunityIcons name="wardrobe-outline" size={30} />,
  "tv": <MaterialIcons name="tv" size={30} />,
  "television": <MaterialIcons name="tv" size={30} />,
  "tv stand": <MaterialCommunityIcons name="tv-box" size={30} />,
  "entertainment unit": <MaterialCommunityIcons name="tv-box" size={30} />,
  "lamp": <MaterialIcons name="emoji-objects" size={30} />,
  "chandelier": <MaterialCommunityIcons name="chandelier" size={30} />,
  "light fixture": <MaterialCommunityIcons name="ceiling-light" size={30} />,
  "bookshelf": <MaterialCommunityIcons name="bookshelf" size={30} />,
  "bookcase": <MaterialCommunityIcons name="bookshelf" size={30} />,
  "shelf": <MaterialCommunityIcons name="shelf" size={30} />,
  "cabinet": <MaterialCommunityIcons name="cabinet" size={30} />,
  "drawer": <MaterialCommunityIcons name="drawer" size={30} />,
  "mirror": <MaterialCommunityIcons name="mirror" size={30} />,
  "rug": <MaterialCommunityIcons name="rug" size={30} />,
  "carpet": <MaterialCommunityIcons name="rug" size={30} />,
  "curtain": <MaterialCommunityIcons name="curtains" size={30} />,
  "blinds": <MaterialCommunityIcons name="blinds" size={30} />,
  "balcony": <MaterialCommunityIcons name="balcony" size={30} />,
  "patio furniture": <MaterialCommunityIcons name="table-chair" size={30} />,
  "outdoor chair": <MaterialIcons name="chair-alt" size={30} />,
  "outdoor table": <MaterialIcons name="table-restaurant" size={30} />,
  "bar stool": <MaterialCommunityIcons name="stool" size={30} />,
  "vanity": <MaterialCommunityIcons name="vanity-light" size={30} />,
  "ottoman": <MaterialCommunityIcons name="stool-outline" size={30} />,
  "bean bag": <MaterialCommunityIcons name="stool" size={30} />,
  "recliner": <MaterialCommunityIcons name="sofa-single" size={30} />,
  "sideboard": <MaterialCommunityIcons name="sofa-outline" size={30} />,
  "console table": <MaterialCommunityIcons name="table-furniture" size={30} />,
  "shoe rack": <MaterialCommunityIcons name="shoe-formal" size={30} />,
  "air conditioner": <MaterialCommunityIcons name="air-conditioner" size={30} />,
  "ac": <MaterialCommunityIcons name="air-conditioner" size={30} />,
  "shower": <MaterialIcons name="shower" size={30} />,
  "washing machine": <MaterialCommunityIcons name="washing-machine" size={30} />,
  "dryer": <MaterialCommunityIcons name="tumble-dryer" size={30} />,
  "swimming pool": <MaterialCommunityIcons name="pool" size={30} />,
  "pool": <MaterialCommunityIcons name="pool" size={30} />,
  "garden": <MaterialCommunityIcons name="flower" size={30} />,
  "yard": <MaterialCommunityIcons name="grass" size={30} />,
  "terrace": <MaterialCommunityIcons name="terrace" size={30} />,
  "elevator": <MaterialCommunityIcons name="elevator" size={30} />,
  "parking": <MaterialIcons name="local-parking" size={30} />,
  "garage": <MaterialCommunityIcons name="garage" size={30} />,
  "dishwasher": <MaterialCommunityIcons name="dishwasher" size={30} />,
  "microwave": <MaterialCommunityIcons name="microwave" size={30} />,
  "oven": <MaterialCommunityIcons name="oven" size={30} />,
  "fridge": <MaterialCommunityIcons name="fridge-outline" size={30} />,
  "refrigerator": <MaterialCommunityIcons name="fridge-outline" size={30} />,
  "stove": <MaterialCommunityIcons name="stove" size={30} />,
  "security camera": <MaterialCommunityIcons name="security" size={30} />,
  "intercom": <MaterialCommunityIcons name="home-account" size={30} />,
  "jacuzzi": <MaterialCommunityIcons name="hot-tub" size={30} />
};

const ApartmentLabelsPopup = ({ apartmentId }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLabels = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://roomebackend20250414140006.azurewebsites.net/api/ApartmentLabel/detect/${apartmentId}`,
        { method: 'POST' }
      );
      const data = await res.json();
      setLabels(Array.from(data.labels));
    } catch (err) {
      console.error('Error fetching labels:', err);
    }
    setLoading(false);
  };

  const openModal = () => {
    setModalVisible(true);
    fetchLabels();
  };

  return (
    <>
      <TouchableOpacity onPress={openModal} style={styles.openButton}>
        <Text style={styles.buttonText}>גלה אילו רהיטים יש</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.popup}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.title}>רהיטים שזוהו:</Text>
            {loading ? (
              <ActivityIndicator size="large" color="#333" />
            ) : (
              <ScrollView contentContainerStyle={styles.iconGrid}>
                {labels.length === 0 ? (
                  <Text>לא זוהו פריטים</Text>
                ) : (
                  labels.map((label, i) => (
                    <View key={i} style={styles.iconItem}>
                      {labelToIcon[label.toLowerCase()] || <MaterialIcons name="category" size={30} />}
                      <Text style={styles.labelText}>{label}</Text>
                    </View>
                  ))
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  openButton: {
    padding: 12,
    backgroundColor: '#333',
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    width: '85%',
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    elevation: 5,
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  closeText: {
    fontSize: 22,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    alignSelf: 'center',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  iconItem: {
    alignItems: 'center',
    margin: 10,
    width: 70,
  },
  labelText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
});

export default ApartmentLabelsPopup;
