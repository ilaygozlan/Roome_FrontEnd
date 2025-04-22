import React from 'react';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { View, StyleSheet } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

export default function GooglePlacesInput({ onLocationSelected }) {
  return (
    <View style={{ zIndex: 10 }}> 
      <GooglePlacesAutocomplete
        placeholder="הקלד מיקום..."
        onPress={(data, details = null) => {
            if (details) {
                const location = details.formatted_address;
                const lat = details.geometry.location.lat;
                const lng = details.geometry.location.lng;
              
                console.log("📍 Address:", location);
                console.log("🌍 Latitude:", lat);
                console.log("🌍 Longitude:", lng);
                
                const fullAdress = JSON.stringify({
                    address: location,
                    latitude: lat,
                    longitude: lng
                });

                onLocationSelected(fullAdress);
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
});
