import { Tabs } from "expo-router";
import React, { useState } from "react";
import TabBar from "../components/tabBar";
import {Button} from "react-native";
import { ShoppingListProvider } from "../contex/shoppingListContex";

export default function layout() {

  return (
    <ShoppingListProvider>
   <Tabs tabBar = {props => <TabBar {...props}/>}>
    
      <Tabs.Screen name="index" 
      options={{
        title : "Home"
      }}/>
      <Tabs.Screen name="ProfilePage" 
      options={{
        title : "ProfilePage"
      }}/>
      <Tabs.Screen name="Items" 
      options={{
        title : "Items"
      }}/>
      <Tabs.Screen name="Edit" 
      options={{
        title : "Edit"
      }}/>
  </Tabs>
  </ShoppingListProvider>
  );
}
