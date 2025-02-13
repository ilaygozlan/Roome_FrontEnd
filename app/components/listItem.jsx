import { View, Text , TouchableOpacity, StyleSheet} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Alert } from 'react-native';
import { useRouter } from "expo-router";
import {React} from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';


const ListItem = (props) => {

  const router = useRouter(); // Hook to access the router object

  // Function to navigate to a different screen
  const navigateToScreen = (screenName, itemName) => {
    router.push({ pathname: `/${screenName}`, params: {itemName} }); // This will navigate to the specified screen
  };

const DeleteItemFromList = (itemId, itemName) => {
  // Show confirmation alert
  Alert.alert(
    "Confirm Deletion", // Title
    `Are you sure you want to remove "${itemName}" from the shopping list?`, // Message
    [
      {
        text: "No", // Button text for No
        onPress: () => console.log("Delete action canceled"), // Action for No
        style: "cancel", // Optional: style for the No button (e.g., cancel)
      },
      {
        text: "Yes", // Button text for Yes
        onPress: () => props.deleteItem(itemId), // Action for Yes
      },
    ],
    { cancelable: false } // Optional: prevents closing by tapping outside
  );
};
 // Function to show an input for changing the amount
 const showAmountInput = () => {

  Alert.prompt(
    `Enter New ${props.name} Amount`, 
    `Current amount: ${props.amount}`, 
    [
      {
        text: "Cancel", 
        onPress: () => console.log("Amount change canceled"),
        style: "cancel",
      },
      {
        text: "OK", 
        onPress: (inputAmount) => {
         const parsedAmount = parseInt(inputAmount, 10);
         if (!isNaN(parsedAmount) && parsedAmount > 0) {
           props.editItem(props.itemId, parsedAmount); // Update the item amount
         } else {
           Alert.alert("Invalid input", "Please enter a valid amount.");
         }
        },
      },
    ],
    "plain-text", 
    props.amount.toString() // Default amount value in the input field
  );
};

  return (
    <View style={styles.container}>
      <TouchableOpacity 
      style={styles.checkbox}
      disabled={props.mode === "home"}
      onPress={props.mode === "ShoppingList" ? props.onToggle : showAmountInput}
      >
      <Feather name={props.active ? "check-circle" : "circle"} size={24} color={props.active ? "#145a32":"#64748b"} style={{ display: props.mode === "detail" ? "none" : "flex" }}/>   
      <Text style={props.active ? styles.activeText : styles.text}>{props.amount}   {props.name }</Text>
      <Feather name="edit-2" size={20} color="#64748b" 
      style={{marginLeft: 'auto',display: props.mode === "detail"? "flex" : "none" }}
      />
      </TouchableOpacity>
      <TouchableOpacity 
      style={[styles.deleteIconContainer,{ display: props.mode === "ShoppingList" ? "flex" : "none" }]}
      onPress={()=>{DeleteItemFromList(props.itemId, props.name)}} 
      >
      <MaterialCommunityIcons name="delete-outline" size={24} color="#cd6155" />
      </TouchableOpacity>
      <TouchableOpacity 
      style={[styles.deleteIconContainer,{ display: props.mode === "ShoppingList" ? "flex" : "none" }]}
      onPress={()=>{navigateToScreen("Items",props.name)}} 
      >
      <AntDesign name="infocirlceo" size={24} color="#64748b" />
       </TouchableOpacity>
     
    </View>
  )
}

const styles = StyleSheet.create({
    container : {
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      width: '100%', 
      marginBottom: 10,
    },
    checkbox : {
        height: 60,
        width: "100%",
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        backgroundColor: '#d4efdf',
        paddingHorizontal: 15,
        borderRadius: 15,
        flex: 1,
    },
    deleteIconContainer: {
      paddingHorizontal: 5,
      paddingVertical: 10,
      marginBottom: 8,
    },
    activeCheckBox : {
        backgroundColor : "#a9dfbf"
    },
    text: {
        fontSize: 16,
        marginLeft: 15,
        color: "#6b7280"
    },
    activeText : {
        fontSize: 16,
        marginLeft: 15,
        color: "#145a32"
    }
})

export default ListItem