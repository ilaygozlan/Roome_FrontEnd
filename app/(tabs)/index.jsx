import { StyleSheet, ScrollView, View ,Button} from 'react-native'
import Apartment from '../components/apartment'
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter(); // Hook to access the router object

  // Function to navigate to a different screen
  const navigateToScreen = (screenName) => {
    router.push(screenName); // This will navigate to the specified screen
  };
  return (
    <View>
       <ScrollView>
        <Apartment/>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({


})