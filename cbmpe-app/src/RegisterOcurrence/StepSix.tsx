import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { Text, Button, Appbar } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";

export default function StepSix({ navigation }) {
  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Image
          source={require("../img/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Appbar.Header>

      <View style={styles.block}>
        <MaterialIcons name="check" size={80} color="green" />

        <Text style={styles.title}>Ocorrência registrada</Text>

        <Text style={styles.description}>
          Sua ocorrência foi registrada com sucesso!{"\n"}
          Você pode administrá-la na página{" "}
          <Text style={styles.bold}>lista de ocorrências.</Text>
        </Text>

        <Button
          mode="outlined"
          textColor="#e40046"
          style={styles.button}
          labelStyle={styles.buttonLabel}
          onPress={() => navigation.navigate("Início", { screen: "Home" })}
        >
          Início
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#fff",
    paddingTop: 18,
    paddingBottom: 8,
    paddingLeft: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  logo: { width: 60, height: 28 },
  content: {
    padding: 12,
    alignItems: "center",
    marginTop: 25,
  },
  block: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 15,
    marginBottom: 15,
    textAlign: "center",
  },

  description: {
    fontSize: 15,
    color: "#444",
    textAlign: "center",
    marginBottom: 40,
  },

  bold: {
    fontWeight: "bold",
  },

  button: {
    borderColor: "#e40046",
    borderWidth: 2,
    width: 150,
    borderRadius: 10,
  },

  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
});
