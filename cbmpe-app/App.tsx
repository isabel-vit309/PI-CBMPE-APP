import React from "react";
import { StatusBar, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { Provider as PaperProvider } from "react-native-paper";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

import StepOne from "./src/RegisterOcurrence/StepOne";
import StepTwo from "./src/RegisterOcurrence/StepTwo";
import StepThree from "./src/RegisterOcurrence/StepThree";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function InicioStack() {
  return (
    <Stack.Navigator id="root" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StepOne" component={StepOne} />
      <Stack.Screen name="StepTwo" component={StepTwo} />
      <Stack.Screen name="StepThree" component={StepThree} />

    </Stack.Navigator>
  );
}

function CasosStack() {
  return (
    <Stack.Navigator id="root" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StepOne" component={StepOne} />
      <Stack.Screen name="StepTwo" component={StepTwo} />
    </Stack.Navigator>
  );
}

function MyTabs() {
  const insets = useSafeAreaInsets();
  return (
    <PaperProvider>
      <Tab.Navigator
        id="root"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#E00047",
          tabBarInactiveTintColor: "#000",
          tabBarStyle: [
            styles.tabBarBase,
            { height: 60 + insets.bottom, paddingBottom: insets.bottom },
          ],
          tabBarLabelStyle: styles.tabBarLabel,
        }}
      >
        <Tab.Screen
          name="Início"
          component={InicioStack}
          options={{
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="home" size={28} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Casos"
          component={CasosStack}
          options={{
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="assignment" size={26} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Ocorrência"
          component={InicioStack}
          options={{
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="add-box" size={30} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Usuário"
          component={InicioStack}
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="person-add-outline" size={28} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Perfil"
          component={InicioStack}
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="people-outline" size={26} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <MyTabs />
        <StatusBar />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBarBase: {
    paddingTop: 10,
    backgroundColor: "#fff",
  },
  tabBarLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
});