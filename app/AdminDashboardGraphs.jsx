import React from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { BarChart, PieChart, LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(136, 132, 216, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: { borderRadius: 16 },
  propsForDots: { r: "6", strokeWidth: "2", stroke: "#8884d8" }
};

const mockRegistrations = [
  { month: "Jan", users: 20 },
  { month: "Feb", users: 35 },
  { month: "Mar", users: 50 },
  { month: "Apr", users: 70 },
  { month: "May", users: 90 },
  { month: "Jun", users: 100 },
];

const pieData = [
  { name: "Active Users", population: 300, color: "#0088FE", legendFontColor: "#000", legendFontSize: 14 },
  { name: "Inactive Users", population: 100, color: "#FF8042", legendFontColor: "#000", legendFontSize: 14 },
];

const areaData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      data: [30, 45, 60, 90, 120, 150],
      color: (opacity = 1) => `rgba(136, 132, 216, ${opacity})`,
      strokeWidth: 2,
    },
  ],
};

export default function AdminDashboardGraphs() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Monthly Registrations</Text>
      <BarChart
        data={{
          labels: mockRegistrations.map(item => item.month),
          datasets: [{ data: mockRegistrations.map(item => item.users) }]
        }}
        width={screenWidth - 32}
        height={220}
        chartConfig={chartConfig}
        style={styles.chart}
      />

      <Text style={styles.title}>User Status Distribution</Text>
      <PieChart
        data={pieData}
        width={screenWidth - 32}
        height={220}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />

      <Text style={styles.title}>User Interactions Over Time</Text>
      <LineChart
        data={areaData}
        width={screenWidth - 32}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />
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