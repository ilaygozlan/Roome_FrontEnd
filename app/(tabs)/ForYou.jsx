import React, { useState, useContext, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Alert,
  Platform
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActiveApartmentContext } from "../contex/ActiveApartmentContext";
import API from "../../config";
import { userInfoContext } from "../contex/userInfoContext";
import LikeButton from "../components/LikeButton";
import Swiper from 'react-native-deck-swiper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const CARD_WIDTH = SCREEN_WIDTH * 0.9;
const CARD_HEIGHT = 500;
const NAVBAR_HEIGHT = 80;
const EXTRA_OFFSET = 25;

const DISLIKED_KEY = "disliked_apartments";
const colors = {
  orange: '#FF8C00',
  blue: '#0066CC',
  white: '#ffffff',
  black: '#000000',
  gray: '#424242',
  lightGray: '#86888A'
};

/**
 * @module ForYou
 * @description A Tinder-like swipeable interface for apartment recommendations
 * 
 * Features:
 * - Card-based swipeable interface for apartment browsing
 * - Like/Dislike functionality with persistence
 * - Image validation and error handling
 * - Async storage for offline data
 * - Real-time interaction tracking
 * 
 * @requires react-native-deck-swiper
 * @requires @react-native-async-storage/async-storage
 * 
 * State Management:
 * @state {Array} interactedApartmentIds - IDs of apartments user has interacted with
 * @state {Array} likedApartments - List of apartments user has liked
 * @state {Array} dislikedApartments - List of apartments user has disliked
 * @state {number} currentIndex - Current card index
 * @state {boolean} isLoading - Loading state indicator
 * @state {boolean} storageReady - AsyncStorage initialization status
 * @state {boolean} isProcessingSwipe - Swipe action processing status
 * @state {Object} imageErrors - Tracking of image loading errors
 * 
 * Key Functions:
 * @function handleSwipe - Processes swipe actions (left/right)
 * @function resetAllInteractions - Clears all user interactions
 * @function loadInteracted - Loads previously interacted apartments
 * @function likeApartment - Handles apartment like action
 * @function dislikeApartment - Handles apartment dislike action
 * 
 * Context Usage:
 * - ActiveApartmentContext for apartment data
 * - userInfoContext for user authentication
 * 
 * Storage:
 * - Uses AsyncStorage for persisting disliked apartments
 * - Maintains interaction history
 */

export default function ForYou() {
  const { loginUserId } = useContext(userInfoContext);
  const userId = loginUserId;
  const { allApartments, setAllApartments, triggerFavoritesRefresh } = useContext(ActiveApartmentContext);

  const [interactedApartmentIds, setInteractedApartmentIds] = useState([]);
  const [likedApartments, setLikedApartments] = useState([]);
  const [dislikedApartments, setDislikedApartments] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [storageReady, setStorageReady] = useState(false);
  const [isProcessingSwipe, setIsProcessingSwipe] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const swiperRef = useRef(null);

  // Add useEffect for initial loading
  useEffect(() => {
    const initializeComponent = async () => {
      setIsLoading(true);
      try {
        await loadInteracted();
        setStorageReady(true);
      } catch (error) {
        console.error('Error initializing component:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeComponent();
  }, []);

  // Reset function to clear all states
  const resetStates = useCallback(() => {
    setCurrentIndex(0);
    setIsProcessingSwipe(false);
    setImageErrors({});
  }, []);

  // Handle swipe action
  const handleSwipe = useCallback(async (cardIndex, direction) => {
    const apartment = swipeableApartments[cardIndex];
    if (!apartment || !apartment.ApartmentID) return;

    try {
      setCurrentIndex(cardIndex + 1);
      if (direction === 'right') {
        await likeApartment(apartment.ApartmentID);
      } else {
        await dislikeApartment(apartment.ApartmentID);
      }
    } catch (error) {
      console.error('Error in handleSwipe:', error);
    }
  }, [swipeableApartments, likeApartment, dislikeApartment]);

  // Reset all interactions
  const resetAllInteractions = useCallback(async () => {
    try {
      console.log('=== Resetting All Interactions ===');
      setIsLoading(true);
      setStorageReady(false);
      
      // Clear storage and states
      await AsyncStorage.removeItem('dislikedApartments');
      setDislikedApartments([]);
      setLikedApartments([]);
      setInteractedApartmentIds([]);
      
      console.log('Cleared disliked apartments from storage');
      console.log('Reset all state variables');
      
      // Reset UI states
      resetStates();
      
      // Reload interactions from server
      await loadInteracted();
      setStorageReady(true);
      
      console.log('=== Reset Complete ===');
    } catch (error) {
      console.error('Error resetting interactions:', error);
      Alert.alert('Error', 'Failed to clear history. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [loadInteracted, resetStates]);

  // Save disliked apartment IDs to AsyncStorage
  const saveDislikedToStorage = async (ids) => {
    try {
      await AsyncStorage.setItem(DISLIKED_KEY, JSON.stringify([...new Set(ids)]));
    } catch (e) {
      console.error("❌ Failed to save to AsyncStorage:", e);
    }
  };

  // Load disliked apartment IDs from AsyncStorage
  const loadDislikedFromStorage = async () => {
    try {
      const stored = await AsyncStorage.getItem(DISLIKED_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("❌ Failed to load from AsyncStorage:", e);
      return [];
    }
  };

  // Helper function to validate image URL
  const isValidImageUrl = (url) => {
    if (!url) return false;
    
    // מפצל את כל התמונות לרשימה
    const urls = url.split(',').map(u => u.trim()).filter(u => u !== '');
    
    // אם אין תמונות בכלל
    if (urls.length === 0) return false;
    
    // מחפש לפחות תמונה אחת תקינה
    return urls.some(singleUrl => {
      if (!singleUrl) return false;
      if (singleUrl.includes('undefined') || singleUrl.includes('null')) return false;
      if (singleUrl.includes('encrypted-tbn0.gstatic.com')) return false;
      
      try {
        // if it's a relative path
        if (singleUrl.startsWith('/')) return true;
        
        // check if it's a valid URL
        new URL(singleUrl);
        
        // check if it's an image extension
        const validExtensions = /\.(jpeg|jpg|gif|png|webp|bmp)$/i;
        return validExtensions.test(singleUrl);
      } catch (e) {
        return false;
      }
    });
  };

  // Helper function to get valid image URL
  const getValidImageUrl = (urls) => {
    if (!urls) {
      console.log('No images provided');
      return null;
    }
    
    try {
      console.log('Processing image URLs:', urls);
      
      // Split all images into an array
      const urlArray = urls.split(',')
        .map(u => u.trim())
        .filter(u => u !== '' && 
                    !u.includes('undefined') && 
                    !u.includes('null') && 
                    !u.includes('encrypted-tbn0.gstatic.com'));
      
      console.log('Filtered URLs:', urlArray);
      
      // Find a valid image
      for (const url of urlArray) {
        try {
          // If it's a relative path
          if (url.startsWith('/')) {
            const fullUrl = `${API}${url}`;
            console.log('Created full URL for relative path:', fullUrl);
            return fullUrl;
          }
          
          // Check if it's a valid URL
          new URL(url);
          
          // Check image extension
          const validExtensions = /\.(jpeg|jpg|gif|png|webp|bmp)$/i;
          if (validExtensions.test(url)) {
            console.log('Found valid image URL:', url);
            return url;
          }
        } catch (e) {
          console.log('Error processing URL:', url, e);
          continue;
        }
      }
    } catch (e) {
      console.error('Error parsing image URLs:', e);
    }
    
    console.log('No valid image URL found');
    return null;
  };

  // Filter apartments that were not seen yet and have images
  const swipeableApartments = React.useMemo(() => {
    if (!storageReady || !allApartments) {
      console.log('Not ready to filter apartments:', { storageReady, allApartments: !!allApartments });
      return [];
    }
    
    console.log('=== Filtering Apartments ===');
    console.log('All apartments:', allApartments.length);
    console.log('Interacted apartments:', interactedApartmentIds.length);
    console.log('Liked apartments:', likedApartments.length);
    console.log('Disliked apartments:', dislikedApartments.length);

    // Filter out invalid apartments first
    const validApartments = allApartments.filter(apt => {
      if (!apt || !apt.ApartmentID) {
        console.log('Found invalid apartment:', apt);
        return false;
      }
      return true;
    });

    if (validApartments.length !== allApartments.length) {
      console.log(`Found ${allApartments.length - validApartments.length} invalid apartments`);
    }

    // Filter apartments that haven't been interacted with and have valid images
    const filtered = validApartments.filter((apt) => {
      // Skip if already interacted with
      if (interactedApartmentIds.includes(apt.ApartmentID)) {
        console.log('Apartment already interacted:', apt.ApartmentID);
        return false;
      }

      // Skip if no valid image
      const hasValidImage = isValidImageUrl(apt.Images);
      if (!hasValidImage) {
        console.log('Invalid image URL for apartment:', apt.ApartmentID, apt.Images);
        return false;
      }

      return true;
    });
    
    console.log('Filtered apartments:', filtered.length);
    console.log('=== End Filtering ===');
    return filtered;
  }, [allApartments, interactedApartmentIds, storageReady]);

  // Load liked and disliked apartments
  const loadInteracted = async () => {
    try {
      console.log('=== Loading Interacted ===');
      const [likedRes, localDisliked] = await Promise.all([
        fetch(`${API}User/GetUserLikedApartments/${userId}`),
        loadDislikedFromStorage(),
      ]);

      const liked = likedRes.ok ? await likedRes.json() : [];
      const likedIds = [...new Set(liked.map((apt) => apt.ApartmentID))];
      
      console.log('\n=== User Interaction Summary ===');
      console.log('👍 Liked Apartments:', likedIds.length ? likedIds.join(', ') : 'None');
      console.log('👎 Disliked Apartments:', localDisliked.length ? localDisliked.join(', ') : 'None');
      
      const allInteracted = [...new Set([...likedIds, ...localDisliked])];
      console.log('🔄 Total Interacted:', allInteracted.length ? allInteracted.join(', ') : 'None');
      console.log('=== End Summary ===\n');

      setLikedApartments(likedIds);
      setDislikedApartments(localDisliked);
      setInteractedApartmentIds(allInteracted);
    } catch (err) {
      console.error("Error loading interacted apartments:", err);
      throw err;
    }
  };

  // Handle liking an apartment
  const likeApartment = async (apartmentId) => {
    try {
      const res = await fetch(`${API}User/LikeApartment/${userId}/${apartmentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!res.ok) {
        console.error("Failed to like apartment:", apartmentId);
        Alert.alert("שגיאה", "לא הצלחנו לשמור את הדירה");
        return false;
      }

      // Update the apartment's IsLikedByUser property in the context
      const updatedApartments = allApartments.map(apt => {
        if (apt.ApartmentID === apartmentId) {
          return { ...apt, IsLikedByUser: true };
        }
        return apt;
      });
      setAllApartments(updatedApartments);
      
      // Trigger a refresh of the favorites list
      triggerFavoritesRefresh();

      setLikedApartments((prev) => [...new Set([...prev, apartmentId])]);
      setInteractedApartmentIds((prev) => [...new Set([...prev, apartmentId])]);
      return true;
    } catch (err) {
      console.error("Error liking apartment:", err);
      Alert.alert("שגיאה", "לא הצלחנו לשמור את הדירה במועדפים");
      return false;
    }
  };

  // Handle disliking an apartment
  const dislikeApartment = async (apartmentId) => {
    try {
      if (likedApartments.includes(apartmentId)) {
        const res = await fetch(`${API}User/RemoveLikeApartment/${userId}/${apartmentId}`, {
          method: "DELETE",
        });
        if (!res.ok && res.status !== 404) throw new Error("Failed to remove like");
        
        // Update the apartment's IsLikedByUser property in the context
        const updatedApartments = allApartments.map(apt => {
          if (apt.ApartmentID === apartmentId) {
            return { ...apt, IsLikedByUser: false };
          }
          return apt;
        });
        setAllApartments(updatedApartments);
        
        // Trigger a refresh of the favorites list
        triggerFavoritesRefresh();
        
        setLikedApartments((prev) => prev.filter((id) => id !== apartmentId));
      }

      const updated = [...dislikedApartments, apartmentId];
      setDislikedApartments(updated);
      setInteractedApartmentIds((prev) => [...new Set([...prev, apartmentId])]);
      await saveDislikedToStorage(updated);
    } catch (err) {
      console.error("Error disliking apartment:", err);
    }
  };

  const renderCard = (card) => {
    if (!card || !card.ApartmentID) {
      console.log('Invalid card data:', card);
      return null;
    }

    const imageUrl = getValidImageUrl(card.Images);
    const hasImageError = imageErrors[card.ApartmentID];
    
    // Safely parse location
    let locationAddress = 'מיקום לא ידוע';
    try {
      if (card.Location) {
        const locationData = JSON.parse(card.Location);
        locationAddress = locationData.address || 'מיקום לא ידוע';
      }
    } catch (error) {
      console.log('Error parsing location:', error);
      locationAddress = card.Location || 'מיקום לא ידוע';
    }
    
    return (
      <View style={styles.card}>
        <View style={[styles.image, { backgroundColor: colors.lightGray }]}>
          {imageUrl && !hasImageError ? (
            <Image 
              source={{ uri: imageUrl }} 
              resizeMode="cover"
              style={{ width: '100%', height: '100%' }}
              onError={(error) => {
                console.log('Image loading error for apartment:', card.ApartmentID, error?.nativeEvent?.error || 'Unknown error');
                setImageErrors(prev => ({
                  ...prev,
                  [card.ApartmentID]: true
                }));
              }}
            />
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
              <MaterialCommunityIcons name="image-off" size={48} color={colors.gray} />
              <Text style={{ color: colors.gray, marginTop: 10, textAlign: 'center', fontSize: 16 }}>אין תמונה זמינה</Text>
            </View>
          )}
        </View>
        <View style={[styles.overlay, { backgroundColor: imageUrl && !hasImageError ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.7)' }]}>
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {locationAddress}
            </Text>
            <Text style={styles.price}>
              {card.Price ? `${card.Price} ₪` : 'מחיר לא ידוע'}
            </Text>
            <Text style={styles.description} numberOfLines={2}>
              {card.Description || 'אין תיאור'}
            </Text>
          </View>
          <LikeButton
            apartmentId={card.ApartmentID}
            isLikedByUser={likedApartments.includes(card.ApartmentID)}
            numOfLikes={card.LikeCount || 0}
          />
        </View>
      </View>
    );
  };

  if (isLoading || !storageReady) {
    return <ActivityIndicator size="large" color="#999" style={{ marginTop: 100 }} />;
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.white
    },
    swiperContainer: {
      flex: 0.8
    },
    buttonContainer: {
      flex: 0.2,
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'center',
      paddingBottom: 20
    },
    button: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.white,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    nopeButton: {
      borderWidth: 2,
      borderColor: colors.orange,
    },
    likeButton: {
      borderWidth: 2,
      borderColor: colors.blue,
    },
    card: {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      borderRadius: 20,
      overflow: "hidden",
      backgroundColor: colors.white,
      shadowColor: colors.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    image: {
      width: "100%",
      height: "100%",
      resizeMode: "cover"
    },
    overlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: 15,
    },
    textContainer: {
      flex: 1,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.white,
      marginBottom: 5,
    },
    price: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.white,
      marginBottom: 10,
    },
    description: {
      fontSize: 16,
      color: colors.white,
      lineHeight: 20,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.white,
      padding: 20
    },
    emptyIcon: {
      marginBottom: 20
    },
    emptyText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.gray,
      textAlign: 'center',
      marginBottom: 20
    },
    resetButton: {
      backgroundColor: colors.blue,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 25,
      marginTop: 10
    },
    resetButtonText: {
      color: colors.white,
      fontSize: 18,
      fontWeight: 'bold'
    }
  });

  return (
    <View style={styles.container}>
      <View style={styles.swiperContainer}>
        {swipeableApartments.length > 0 && !isLoading ? (
          <>
            <Swiper
              ref={swiperRef}
              cards={swipeableApartments}
              renderCard={renderCard}
              onSwipedLeft={(cardIndex) => {
                handleSwipe(cardIndex, 'left');
              }}
              onSwipedRight={(cardIndex) => {
                handleSwipe(cardIndex, 'right');
              }}
              backgroundColor={'transparent'}
              cardVerticalMargin={50}
              stackSize={3}
              stackScale={10}
              stackSeparation={14}
              animateOverlayLabelsOpacity
              animateCardOpacity
              disableTopSwipe
              disableBottomSwipe
              infinite={false}
              showSecondCard
              verticalSwipe={false}
              horizontalSwipe={true}
              outputRotationRange={["-10deg", "0deg", "10deg"]}
              useViewOverflow={Platform.OS === 'ios'}
              keyExtractor={(card) => String(card?.ApartmentID || `temp-${Math.random()}`)}
              cardStyle={styles.card}
              containerStyle={{ flex: 1 }}
              swipeAnimationDuration={350}
              onSwipedAll={() => {
                console.log("No more apartments to show");
                setCurrentIndex(swipeableApartments.length);
                Alert.alert(
                  "אין דירות נוספות",
                  "אין דירות חדשות להצגה כרגע. נסה שוב מאוחר יותר.",
                  [{ text: "אישור", style: "default" }]
                );
              }}
            />
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons 
              name="home-search" 
              size={64} 
              color={colors.gray} 
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyText}>
              {isLoading ? "טוען דירות..." :
               allApartments.length > 0 
                ? "אין דירות חדשות להצגה כרגע. נסה שוב מאוחר יותר."
                : "אין דירות זמינות כרגע. נסה שוב מאוחר יותר."}
            </Text>
          </View>
        )}
      </View>
      {swipeableApartments.length > 0 && !isLoading && currentIndex < swipeableApartments.length && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.nopeButton]}
            onPress={() => swiperRef.current?.swipeLeft()}
          >
            <MaterialCommunityIcons name="close" size={40} color={colors.blue} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.likeButton]}
            onPress={() => swiperRef.current?.swipeRight()}
          >
            <MaterialCommunityIcons name="heart" size={40} color={colors.orange} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
