import 'react-native-get-random-values';
import React from 'react';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { View, StyleSheet } from 'react-native';

/**
 * @component GooglePlacesInput
 * @description Google Places Autocomplete integration component for location selection.
 * Provides address search and autocomplete functionality specifically for Israel locations.
 * 
 * Features:
 * - Address autocomplete
 * - Geocoding (converts address to coordinates)
 * - Hebrew language support
 * - Israel-specific results
 * - Custom styling for RTL support
 * 
 * @param {Object} props
 * @param {Function} props.onLocationSelected - Callback function that receives the selected location data
 * 
 * @example
 * // Selected location data format:
 * {
 *   address: string,
 *   latitude: number,
 *   longitude: number
 * }
 * 
 * @security_note
 * TODO: The Google Places API key should be moved to environment variables
 * or a secure configuration management system.
 */
//hey

export default function GooglePlacesInput({ onLocationSelected }) {
  return (
<View style={{ zIndex: 1000, flex: 0 }}>
      <GooglePlacesAutocomplete
        placeholder="הקלד מיקום..."
        onPress={(data, details = null) => {
          // Always call onLocationSelected when a suggestion is selected
          if (details) {
            const location = details.formatted_address;
            const lat = details.geometry.location.lat;
            const lng = details.geometry.location.lng;
            // Pass full address object
            onLocationSelected({
              address: location,
              latitude: lat,
              longitude: lng
            });
          } else if (data && data.description) {
            // Fallback: use only the address from data
            onLocationSelected({
              address: data.description,
              latitude: null,
              longitude: null
            });
          }
        }}
        fetchDetails={true}
        query={{
          key: 'AIzaSyCy4JnaYp3wvOAUH7-lOA4IFB_tBK9-5BE',
          language: 'he',
          components: 'country:il', 
        }}
        enablePoweredByContainer={false}
        styles={autocompleteStyles}
      />
    </View>
  );
}

/**
 * Styles for the autocomplete component
 * Includes RTL support and custom styling for the input field
 */
const autocompleteStyles = StyleSheet.create({
  textInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'right',
    backgroundColor: 'white',
  },
  listView: {
    position: 'absolute',
    top: 50,
    zIndex: 1000,
    elevation: 5, // for Android
    backgroundColor: 'white',
    width: '100%',
  },
});
