import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  TouchableOpacity,
  Text as RNText,
} from "react-native";
import { Text, Button, Appbar } from "react-native-paper";
import Signature from "react-native-signature-canvas";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useForm } from "react-hook-form";
import { Video } from "expo-av";

export default function StepThree({ navigation }) {
  const signatureRef = useRef(null);
  const [mediaUri, setMediaUri] = useState(null);
  const [mediaType, setMediaType] = useState(null); // "image" ou "video"
  const [signature, setSignature] = useState(null);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const {
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    try {
      const savedData = await AsyncStorage.getItem("stepThreeData");
      if (savedData) {
        const data = JSON.parse(savedData);
        if (data.mediaUri) setMediaUri(data.mediaUri);
        if (data.mediaType) setMediaType(data.mediaType);
        if (data.signature) setSignature(data.signature);
      }
    } catch (error) {
      console.log("Erro ao carregar dados:", error);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem(
        "stepThreeData",
        JSON.stringify({ mediaUri, mediaType, signature })
      );
      console.log("StepThree salvo!");
    } catch (error) {
      console.log("Erro ao salvar dados:", error);
    }
  };

  useEffect(() => {
    if (mediaUri || signature) saveData();
  }, [mediaUri, signature]);

  async function handleUpload() {
    Alert.alert("Selecionar mídia", "Escolha uma opção", [
      {
        text: "Tirar Foto",
        onPress: async () => {
          const permission = await ImagePicker.requestCameraPermissionsAsync();
          if (permission.status !== "granted") {
            alert("Permissão negada!");
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
          });
          if (!result.canceled) {
            setMediaUri(result.assets[0].uri);
            setMediaType("image");
            clearErrors("media");
          }
        },
      },
      {
        text: "Gravar Vídeo",
        onPress: async () => {
          const permission = await ImagePicker.requestCameraPermissionsAsync();
          if (permission.status !== "granted") {
            alert("Permissão negada!");
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            videoMaxDuration: 15, // segundos
            quality: 0.8,
          });
          if (!result.canceled) {
            setMediaUri(result.assets[0].uri);
            setMediaType("video");
            clearErrors("media");
          }
        },
      },
      {
        text: "Galeria",
        onPress: async () => {
          const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (permission.status !== "granted") {
            alert("Permissão negada!");
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            quality: 0.8,
          });
          if (!result.canceled) {
            setMediaUri(result.assets[0].uri);
            setMediaType(result.assets[0].type); // "image" ou "video"
            clearErrors("media");
          }
        },
      },
      { text: "Cancelar", style: "cancel" },
    ]);
  }

  function handleSignature(sig) {
    setSignature(sig);
    clearErrors("signature");
  }

  function handleBegin() {
    setScrollEnabled(false);
  }

  function handleEnd() {
    setScrollEnabled(true);
    if (signatureRef.current) {
      signatureRef.current.readSignature();
    }
  }

  async function onSubmit() {
    let hasErrors = false;
    if (!mediaUri) {
      setError("media", { message: "Você deve enviar uma imagem ou vídeo." });
      hasErrors = true;
    }
    if (!signature) {
      setError("signature", { message: "A assinatura é obrigatória." });
      hasErrors = true;
    }
    if (hasErrors) return;
    await saveData();
    navigation.navigate("StepFour", { mediaUri, mediaType, signature });
  }

  function handleBack() {
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Image
          source={require("../img/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Appbar.Header>
      <ScrollView
        contentContainerStyle={{ ...styles.content, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
      >
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
          <Text style={styles.uploadTitle}>
            Faça upload de imagens ou vídeos
          </Text>
          <Text style={styles.uploadSubtitle}>
            Formatos suportados: SVG, JPG, PNG, MP4 (10MB)
          </Text>
          {mediaUri ? (
            <TouchableOpacity onPress={handleUpload} style={{ marginTop: 10 }}>
              {mediaType === "image" ? (
                <Image
                  source={{ uri: mediaUri }}
                  style={styles.previewImg}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.videoPreviewContainer}>
                  <Video
                    source={{ uri: mediaUri }}
                    rate={1.0}
                    volume={1.0}
                    isMuted={false}
                    shouldPlay={false}
                    isLooping
                    style={styles.previewImg}
                    useNativeControls
                  />
                </View>
              )}
              <Text style={styles.changeImgText}>Trocar mídia</Text>
            </TouchableOpacity>
          ) : (
            <Button
              mode="outlined"
              onPress={handleUpload}
              style={styles.uploadBtn}
              textColor="#E6003A"
            >
              Selecionar mídia
            </Button>
          )}
          {errors.media?.message && (
            <RNText style={styles.errorText}>
              {String(errors.media.message)}
            </RNText>
          )}
        </View>

        <Text style={styles.assinaturaLabel}>Assinatura digital</Text>
        <View style={styles.signatureBox}>
          <Signature
            ref={signatureRef}
            onOK={handleSignature}
            onBegin={handleBegin}
            onEnd={handleEnd}
            descriptionText=""
            clearText="Limpar"
            confirmText="Salvar"
            autoClear={false}
            backgroundColor="#fff"
            penColor="black"
            webStyle={`
              .m-signature-pad { box-shadow: none; border: none; }
              .m-signature-pad--footer { display: flex; justify-content: space-between; padding: 8px 10px; }
              .m-signature-pad--footer button { background-color: #E6003A; color: #fff; padding: 6px 12px; border-radius: 6px; border: none; font-weight: 600; }
              .m-signature-pad--footer .button-clear { background-color: #ccc; color: #222; }
            `}
            style={{ flex: 1 }}
          />
        </View>
        {errors.signature?.message && (
          <RNText style={styles.errorText}>
            {String(errors.signature.message)}
          </RNText>
        )}

        <View style={styles.btnsRow}>
          <Button
            mode="text"
            style={styles.button}
            textColor="#000"
            onPress={handleBack}
          >
            Voltar
          </Button>

          <Button
            mode="contained"
            style={[styles.button, { backgroundColor: "#E6003A" }]}
            onPress={handleSubmit(onSubmit)}
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
  logo: { width: 60, height: 28 },
  content: { padding: 12, alignItems: "center", marginTop: 25 },
  title: {
    fontWeight: "bold",
    fontSize: 22,
    marginBottom: 10,
    color: "#222",
    alignSelf: "flex-start",
  },
  stepCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 16,
    width: "100%",
  },
  stepRow: { flexDirection: "row", alignItems: "center" },
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
  stepText: { fontSize: 14, color: "#222" },
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
  uploadTitle: { fontWeight: "bold", color: "#E6003A" },
  uploadSubtitle: { color: "#888", fontSize: 12 },
  uploadBtn: {
    marginTop: 10,
    borderColor: "#E6003A",
    borderWidth: 1,
    borderRadius: 6,
  },
  previewImg: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E6003A",
  },
  videoPreviewContainer: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E6003A",
    overflow: "hidden",
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  changeImgText: {
    color: "#E6003A",
    textAlign: "center",
    marginTop: 4,
    fontSize: 12,
  },
  assinaturaLabel: {
    fontWeight: "500",
    color: "#222",
    marginBottom: 6,
    alignSelf: "flex-start",
  },
  signatureBox: {
    backgroundColor: "#fff",
    borderRadius: 8,
    height: 200,
    marginBottom: 20,
    overflow: "visible",
    width: "100%",
  },
  errorText: {
    color: "#E6003A",
    alignSelf: "flex-start",
    marginTop: 10,
    fontSize: 12,
  },
  buttonContainer: { width: "100%", alignItems: "flex-end", marginTop: 10 },
  button: {
    width: "48%",
    alignSelf: "center",
  },
  btnsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    alignSelf: "center",
    marginTop: 20,
  },
});
