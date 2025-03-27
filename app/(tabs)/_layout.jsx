import { Tabs } from "expo-router";
import React from "react";
import TabBar from "../components/tabBar";
import { GestureHandlerRootView } from "react-native-gesture-handler"; 
import { ActiveApartmentProvider  } from "../contex/ActiveApartmentContext";

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ActiveApartmentProvider> 
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
  </ActiveApartmentProvider> 
  </GestureHandlerRootView>
  );
}
