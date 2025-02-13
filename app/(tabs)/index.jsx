import { StyleSheet, ScrollView, View ,Button} from 'react-native'
import ShoppingList from '../components/shoppingList'
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
        <ShoppingList listName="my shopping list" mode="home"/>
        <Button onPress={() => navigateToScreen('ShoppingList')} title="See Shopping List"/>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({


})