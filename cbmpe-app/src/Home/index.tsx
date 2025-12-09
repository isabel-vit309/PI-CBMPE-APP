import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import MapView, { Marker } from "react-native-maps";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function Home() {
  const navigation = useNavigation<any>();

  const ocorrencias = [
    {
      id: 1,
      titulo: "Incêndio Residencial",
      latitude: -8.047562,
      longitude: -34.877002,
    },
    {
      id: 2,
      titulo: "Acidente de Trânsito",
      latitude: -8.0523,
      longitude: -34.8889,
    },
    {
      id: 3,
      titulo: "Resgate em Altura",
      latitude: -8.0402,
      longitude: -34.8721,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.helloText}>
          Olá, Henrique!
        </Text>
        <View style={styles.roleContainer}>
          <Text style={styles.roleText}>ADM CBMPE</Text>
        </View>
      </View>
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.optionOcurrence}
          onPress={() =>
            navigation.navigate("Ocorrência", {
              screen: "StepOne",
            })
          }
        >
          <MaterialIcons name="add-circle-outline" size={28} color="#333" />
          <Text style={styles.optionLabel}>Ocorrência</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionOcurrence}
          onPress={() =>
            navigation.navigate("Casos", {
              screen: "ListOcurrence",
            })
          }
        >
          <MaterialIcons name="assignment" size={28} color="#333" />
          <Text style={styles.optionLabel}>Casos</Text>
        </TouchableOpacity>
      </View>

      <Text variant="titleLarge" style={styles.ocurrenceTitle}>
        Locais das ocorrências
      </Text>
      <View style={styles.containerMap}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: -8.047562,
            longitude: -34.877002,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {ocorrencias.map((item) => (
            <Marker
              key={item.id}
              coordinate={{
                latitude: item.latitude,
                longitude: item.longitude,
              }}
              title={item.titulo}
              pinColor="#FF3259"
            />
          ))}
        </MapView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    flex: 1,
    padding: 20,
  },

  header: {
    marginBottom: 20,
  },

  helloText: {
    fontWeight: "bold",
    color: "#222",
  },

  roleContainer: {
    marginTop: 6,
    backgroundColor: "#FF3259",
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 50,
  },

  roleText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 25,
    gap: 10,
  },

  optionOcurrence: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    gap: 6,
  },

  optionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },

  ocurrenceTitle: {
    marginBottom: 12,
    fontWeight: "bold",
  },

  containerMap: {
    height: 360,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    backgroundColor: "#ccc",
  },

  map: {
    flex: 1,
  },
});
