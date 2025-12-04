import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Text, Button } from "react-native-paper";
import Signature from "react-native-signature-canvas";
import * as ImagePicker from "expo-image-picker";

export default function StepThree({ navigation }) {
  const [signature, setSignature] = useState(null);
  const [imageUri, setImageUri] = useState(null);

  // Função para upload de imagem com opção de câmera ou galeria
  const handleUpload = async () => {
    Alert.alert("Selecionar imagem", "Escolha uma opção", [
      {
        text: "Câmera",
        onPress: async () => {
          const permission = await ImagePicker.requestCameraPermissionsAsync();
          if (permission.status !== "granted") {
            alert("Permissão para acessar a câmera negada!");
            return;
          }
          let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
          });
          if (!result.canceled) {
            setImageUri(result.assets[0].uri);
          }
        },
      },
      {
        text: "Galeria",
        onPress: async () => {
          const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (permission.status !== "granted") {
            alert("Permissão para acessar a galeria negada!");
            return;
          }
          let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
          });
          if (!result.canceled) {
            setImageUri(result.assets[0].uri);
          }
        },
      },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  // Assinatura digital
  const handleSignature = (signature) => {
    setSignature(signature);
    alert("Assinatura salva!");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("../img/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View></View>
        <Text style={styles.title}>Registro de ocorrência</Text>
        <View style={styles.stepCard}>
          <View style={styles.stepRow}>
            <View style={styles.circle}>
              <View style={styles.circleInner} />
            </View>
            <Text style={styles.stepText}>3 / 5. Anexos e evidências</Text>
          </View>
          <View style={styles.redBar} />
        </View>
        <View style={styles.uploadCard}>
          <Text style={styles.uploadTitle}>Faça upload de imagens</Text>
          <Text style={styles.uploadSubtitle}>
            Formatos suportados: SVG, JPG, PNG (10MB)
          </Text>
          {imageUri ? (
            <TouchableOpacity onPress={handleUpload} style={{ marginTop: 10 }}>
              <Image
                source={{ uri: imageUri }}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#E6003A",
                }}
                resizeMode="cover"
              />
              <Text
                style={{
                  color: "#E6003A",
                  textAlign: "center",
                  marginTop: 4,
                  fontSize: 12,
                }}
              >
                Trocar imagem
              </Text>
            </TouchableOpacity>
          ) : (
            <Button
              mode="outlined"
              onPress={handleUpload}
              style={styles.uploadBtn}
              textColor="#E6003A"
            >
              Selecionar imagem
            </Button>
          )}
        </View>
        <Text style={styles.assinaturaLabel}>Assinatura digital</Text>
        <View style={styles.signatureBox}>
          <Signature
            onOK={handleSignature}
            descriptionText=""
            clearText="Limpar"
            confirmText="Salvar"
            webStyle={` .m-signature-pad--footer {display: none; margin: 0px;} `}
            autoClear={false}
            backgroundColor="#fff"
            penColor="black"
          />
        </View>
        <View style={{ alignItems: "flex-end", marginTop: 10, width: "100%" }}>
          <Button
            mode="contained"
            onPress={() => alert("Avançar")}
            style={styles.avancarBtn}
            labelStyle={{ color: "#fff", fontWeight: "bold" }}
          >
            Continuar
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7FA" },
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
  title: {
    fontWeight: "bold",
    fontSize: 22,
    marginBottom: 10,
    color: "#222",
    marginLeft: 4,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  stepCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 16,
    borderWidth: 0,
    elevation: 0,
    position: "relative",
    width: "100%",
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
    marginLeft: 2,
  },
  circle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#E6003A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  circleInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E6003A",
  },
  stepText: { fontWeight: "500", color: "#222", fontSize: 14 },
  redBar: {
    height: 3,
    backgroundColor: "#E6003A",
    width: "100%",
    marginTop: 6,
    borderRadius: 2,
  },
  uploadCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
    width: "100%",
  },
  uploadTitle: { fontWeight: "bold", color: "#E6003A", marginBottom: 2 },
  uploadSubtitle: { color: "#888", fontSize: 12 },
  uploadBtn: {
    marginTop: 10,
    borderColor: "#E6003A",
    borderWidth: 1,
    borderRadius: 6,
  },
  assinaturaLabel: {
    fontWeight: "500",
    color: "#222",
    marginBottom: 6,
    marginLeft: 2,
    alignSelf: "flex-start",
  },
  signatureBox: {
    backgroundColor: "#fff",
    borderRadius: 8,
    minHeight: 100,
    height: 170,
    marginBottom: 20,
    overflow: "hidden",
    width: "100%",
  },
  avancarBtn: {
    backgroundColor: "#E6003A",
    borderRadius: 7,
    width: "45%",
    alignSelf: "flex-end",
    marginTop: 35,
  },
});
