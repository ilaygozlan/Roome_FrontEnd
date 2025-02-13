import React, { useState , useContext} from "react";
import { Text, TouchableOpacity, View ,Button, StyleSheet, Modal, TextInput} from "react-native";
import { ShoppingListContext } from "../contex/shoppingListContex";
import ListItem from "./listItem";

export default function ShoppingList(props) {
  const { shoppingList, setShoppingList } = useContext(ShoppingListContext);

  const itemsList = [
    'Apple', 'Banana', 'Carrot', 'Tomato', 'Potato', 'Spinach', 
    'Cucumber', 'Onion', 'Lettuce', 'Mango'
  ];

   // States for managing the modal visibility and input values
   const [modalVisible, setModalVisible] = useState(false);
   const [newItemName, setNewItemName] = useState('');
   const [newItemAmount, setNewItemAmount] = useState('');
   const [selectedItem, setSelectedItem] = useState(null);

  // change the active state of a check box [checked/un-checked]
  const toggleActive = (id) => {
    setShoppingList(prevList =>
      prevList.map(item =>
        item.id === id ? { ...item, active: !item.active } : item
      )
    );
  };

    // Function to handle adding a new item to the list
    const addItemToList = () => {
      if (!newItemName || !newItemAmount) {
        alert("Please provide both name and amount");
        return;
      }
      
      const newItem = {
        id: shoppingList.length + 1, // You might want to use a more reliable ID generation method
        name: newItemName,
        amount: parseInt(newItemAmount),
        active: false,
      };
  
      setShoppingList([...shoppingList, newItem]);
      setModalVisible(false); // Close the modal after adding the item
      setNewItemName('');
      setNewItemAmount('');
    };

  const DeleteItem = (itemId) =>{
    setShoppingList(prevList => prevList.filter(item => item.id !== itemId));
  }
  const editItem = (itemId, newAmount) => {
    setShoppingList(prevList =>
      prevList.map(item =>
        item.id === itemId ? { ...item, amount: newAmount } : item // Create a new object with updated amount
      )
    );
  };
  const selectItem = (item) => {
    setSelectedItem(item); // Set the selected item
    setNewItemName(item); // Optionally set the item name in the input field
  };

  
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
    <View style={{width: "90%", alignItems:'center', backgroundColor: "white", padding: 15, borderRadius: 15, margin: 15}}>
     <Text style={{fontSize: 26, fontWeight: 'bold', marginBottom: 20, marginTop: 15}}>{props.listName}</Text>
   
     {props.mode === "home" ? <Text>There are {shoppingList.length} items in the list</Text> : shoppingList.map(item => (
        <ListItem
          key={item.id}
          itemId={item.id}
          item={item}
          name={item.name}
          amount={item.amount}
          active={item.active}
          onToggle={() => toggleActive(item.id)}
          editItem ={editItem}
          deleteItem={DeleteItem}
          mode={props.mode}
        />
      ))}
      <TouchableOpacity 
        style={[styles.addButton,{display: props.mode === "ShoppingList" ? "flex" : "none" }]} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>Add New Item</Text>
      </TouchableOpacity>
      </View>
      {/* Modal to Add New Item */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Item</Text>

                 {/* Item Picker (Button List) */}
                 <View style={styles.itemListContainer}>
              {itemsList.map((item, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.itemButton, selectedItem === item && styles.selectedItem]} 
                  onPress={() => selectItem(item)}
                >
                  <Text style={styles.itemButtonText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.input}
              placeholder="Amount"
              keyboardType="numeric"
              value={newItemAmount}
              onChangeText={setNewItemAmount}
            />

            <View style={styles.buttonContainer}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
              <Button title="Add Item" onPress={addItemToList} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#27ae60',
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  }, itemListContainer: {
    width: '100%',
    marginBottom: 20,
  },
  itemButton: {
    padding: 10,
    backgroundColor: '#f1f1f1',
    marginBottom: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  itemButtonText: {
    fontSize: 16,
  },
  selectedItem: {
    backgroundColor: '#4CAF50', 
    color: 'white', 
  },
});
