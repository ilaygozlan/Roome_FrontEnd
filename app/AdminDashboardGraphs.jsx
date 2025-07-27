import React from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
/*import { VictoryBar, VictoryPie, VictoryLine, VictoryChart, VictoryTheme, VictoryAxis } from "victory-native";*/

const screenWidth = Dimensions.get("window").width;

const mockRegistrations = [
  { month: "Jan", users: 20 },
  { month: "Feb", users: 35 },
  { month: "Mar", users: 50 },
  { month: "Apr", users: 70 },
  { month: "May", users: 90 },
  { month: "Jun", users: 100 },
];

const pieData = [
  { x: "Active Users", y: 300 },
  { x: "Inactive Users", y: 100 },
];

const areaData = [
  { x: "Jan", y: 30 },
  { x: "Feb", y: 45 },
  { x: "Mar", y: 60 },
  { x: "Apr", y: 90 },
  { x: "May", y: 120 },
  { x: "Jun", y: 150 },
];

export default function AdminDashboardGraphs() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>The page is beening build...</Text>
     {/* <VictoryChart
        width={screenWidth - 32}
        height={220}
        theme={VictoryTheme.material}
        domainPadding={20}
      >
        <VictoryAxis tickValues={mockRegistrations.map(item => item.month)} tickFormat={mockRegistrations.map(item => item.month)} />
        <VictoryAxis dependentAxis />
        <VictoryBar
          data={mockRegistrations}
          x="month"
          y="users"
          style={{ data: { fill: "#8884d8", borderRadius: 8 } }}
        />
      </VictoryChart>

      <Text style={styles.title}>User Status Distribution</Text>
      <VictoryPie
        data={pieData}
        colorScale={["#0088FE", "#FF8042"]}
        width={screenWidth - 32}
        height={220}
        labels={({ datum }) => `${datum.x}\n${datum.y}`}
        style={{ labels: { fill: "#000", fontSize: 14 } }}
      />

      <Text style={styles.title}>User Interactions Over Time</Text>
      <VictoryChart
        width={screenWidth - 32}
        height={220}
        theme={VictoryTheme.material}
      >
        <VictoryAxis tickValues={areaData.map(item => item.x)} tickFormat={areaData.map(item => item.x)} />
        <VictoryAxis dependentAxis />
        <VictoryLine
          data={areaData}
          style={{ data: { stroke: "#8884d8", strokeWidth: 2 } }}
        />
      </VictoryChart>
      */} 
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});