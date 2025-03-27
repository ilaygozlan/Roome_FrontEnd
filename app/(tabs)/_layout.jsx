import { Tabs } from "expo-router";
import React from "react";
import TabBar from "../components/tabBar";
import { GestureHandlerRootView } from "react-native-gesture-handler"; 


export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
   <Tabs tabBar = {props => <TabBar {...props}/>}>
    
      <Tabs.Screen name="index" 
      options={{
        title : "Home"
      }}/>
      <Tabs.Screen name="ProfilePage" 
      options={{
        title : "ProfilePage"
      }}/>
      <Tabs.Screen name="ForYou" 
      options={{
        title : "ForYou"
      }}/>
      <Tabs.Screen name="Edit" 
      options={{
        title : "Edit"
      }}/>
       <Tabs.Screen name="maps" 
      options={{
        title : "maps"
      }}/>
      
  </Tabs>
  </GestureHandlerRootView>
  );
}
