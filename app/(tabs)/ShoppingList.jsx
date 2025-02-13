import { View, ScrollView } from 'react-native'
import React from 'react'
import ShoppingList from '../components/shoppingList'

const ShoppingListPage = () => {
  return (
    <View>
        <ScrollView>
              <ShoppingList listName="my shopping list" mode="ShoppingList"/>
        </ScrollView>
    </View>
  )
}

export default ShoppingListPage