import { View, ScrollView } from 'react-native'
import ShoppingList from '../components/shoppingList'
import React from 'react'

const Edit = () => {
  return (
    <View>
       <ScrollView>
       <ShoppingList listName="my shopping list" mode="detail"/>
       </ScrollView>
    </View>
  )
}

export default Edit