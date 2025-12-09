import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function Profile() {
  return (
    <View style={styles.bigPage}>
      <View style={styles.topBox}>
        <View style={styles.littleBadge}>
          <Text style={styles.littleBadgeText}>ADM CBMPE</Text>
        </View>

        <TouchableOpacity style={styles.btnEdit}>
          <MaterialIcons name="edit" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.textName}>Henrique Juliano</Text>
        <Text style={styles.textEmail}>Henriqueju.BI@hotmail.com</Text>

        <View style={styles.rowBox}>
          <View style={styles.boxInputSmall}>
            <Text style={styles.labelSmall}>Nome</Text>
            <TextInput style={styles.inputSmall} placeholder="Placeholder" />
          </View>

          <View style={styles.boxInputSmall}>
            <Text style={styles.labelSmall}>Tipo de acesso</Text>
            <TextInput style={styles.inputSmall} placeholder="Placeholder" />
          </View>
        </View>

        <View style={styles.boxInputBig}>
          <Text style={styles.labelSmall}>E-mail</Text>
          <TextInput style={styles.inputBig} placeholder="Placeholder" />
        </View>

        <View style={styles.boxInputBig}>
          <Text style={styles.labelSmall}>Número</Text>
          <TextInput style={styles.inputBig} placeholder="Placeholder" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bigPage: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  topBox: {
    backgroundColor: "#E4003B",
    height: 200,
    paddingHorizontal: 20,
    paddingTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  littleBadge: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    marginTop: 70,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },

  littleBadgeText: {
    color: "#E4003B",
    fontWeight: "700",
  },

  btnEdit: {
    backgroundColor: "#c40030",
    width: 38,
    height: 38,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  infoCard: {
    backgroundColor: "#fff",
    marginTop: -20,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 8,
    elevation: 4,
    height: 450,
  },

  textName: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 2,
    color: "#111",
  },

  textEmail: {
    color: "#555",
    marginBottom: 20,
  },

  rowBox: {
    flexDirection: "row",
    gap: 10,
  },

  boxInputSmall: {
    flex: 1,
  },

  labelSmall: {
    marginBottom: 4,
    fontSize: 14,
    color: "#444",
  },

  inputSmall: {
    backgroundColor: "#f0f1f5",
    padding: 12,
    borderRadius: 5,
  },

  boxInputBig: {
    marginTop: 12,
  },

  inputBig: {
    backgroundColor: "#f0f1f5",
    padding: 12,
    borderRadius: 5,
  },
  textBold: {
    fontWeight: "bold",
  },
});
