import React, { useRef, useState, useEffect, useMemo,useContext } from "react";
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, Image, Alert } from "react-native";
import { userInfoContext } from "../contex/userInfoContext";
import API from "../../config";
import Swiper from 'react-native-deck-swiper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = SCREEN_WIDTH * 0.9;
const CARD_HEIGHT = 500;

const colors = {
  orange: '#FF8C00',
  blue: '#0066CC',
  white: '#ffffff',
  gray: '#424242',
  lightGray: '#86888A'
};

export default function ForYou() {
  const { loginUserId } = useContext(userInfoContext);
  const userId = loginUserId;
  const swiperRef = useRef(null);

  const [apartments, setApartments] = useState([]);
  const [interactedIds, setInteractedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API}User/GetRecommendedApartments/${userId}`);
        const data = res.ok ? await res.json() : [];
        console.log("Fetched:", data);
        setApartments(data);
      } catch {
        Alert.alert("שגיאה", "בעיה בטעינת ההמלצות");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  const swipeableApartments = useMemo(() => {
    return apartments.filter(apt =>
      apt?.id && !interactedIds.includes(apt.id)
    );
  }, [apartments, interactedIds]);

  const handleSwipe = async (cardIndex, direction) => {
    const apartment = swipeableApartments[cardIndex];
    if (!apartment?.id) return;

    setInteractedIds(prev => [...prev, apartment.id]);

    if (direction === 'right') {
      await fetch(`${API}User/LikeApartment/${userId}/${apartment.id}`, { method: "POST" });
    }
  };

  const renderCard = (card) => {
    if (!card || !card.id) return null;

    // Parse location correctly:
    let locationAddress = 'מיקום לא ידוע';
    try {
      const loc = JSON.parse(card.location);
      locationAddress = loc.address || 'מיקום לא ידוע';
    } catch {
      locationAddress = card.location || 'מיקום לא ידוע';
    }

    // Try to get image:
    let imageUrl = null;
    if (card.images) {
      imageUrl = card.images;  // במידה בעתיד יהיה לך שדה תמונה מהשרת
    } else {
      imageUrl = "https://via.placeholder.com/500x300?text=No+Image";
    }

    return (
      <View style={styles.card}>
        <View style={styles.image}>
          {!imageErrors[card.id] ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: '100%', height: '100%' }}
              onError={() => setImageErrors(prev => ({ ...prev, [card.id]: true }))}
            />
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <MaterialCommunityIcons name="image-off" size={48} color={colors.gray} />
              <Text style={{ color: colors.gray }}>אין תמונה</Text>
            </View>
          )}
        </View>
        <View style={styles.overlay}>
          <Text style={styles.title}>{locationAddress}</Text>
          <Text style={styles.price}>{card.price ? `${card.price} ₪` : 'מחיר לא ידוע'}</Text>
          <Text style={styles.description}>{card.description || 'אין תיאור'}</Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return <ActivityIndicator size="large" color="#999" style={{ marginTop: 100 }} />;
  }

  return (
    <View style={styles.container}>
      {swipeableApartments.length > 0 ? (
        <Swiper
          ref={swiperRef}
          cards={swipeableApartments}
          renderCard={renderCard}
          onSwipedLeft={(index) => handleSwipe(index, 'left')}
          onSwipedRight={(index) => handleSwipe(index, 'right')}
          cardVerticalMargin={50}
          stackSize={3}
          stackSeparation={14}
          disableTopSwipe
          disableBottomSwipe
          infinite={false}
          verticalSwipe={false}
          cardStyle={styles.card}
          containerStyle={{ flex: 1 }}
          swipeAnimationDuration={350}
        />
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <MaterialCommunityIcons name="home-search" size={64} color={colors.gray} />
          <Text style={{ fontSize: 24, marginTop: 20 }}>אין דירות להצגה כרגע</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  card: { width: CARD_WIDTH, height: CARD_HEIGHT, borderRadius: 20, overflow: "hidden" },
  image: { width: "100%", height: "100%", backgroundColor: colors.lightGray },
  overlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 15, backgroundColor: 'rgba(0,0,0,0.5)' },
  title: { fontSize: 24, color: colors.white, fontWeight: "bold" },
  price: { fontSize: 20, color: colors.white, marginVertical: 5 },
  description: { fontSize: 16, color: colors.white }
});
