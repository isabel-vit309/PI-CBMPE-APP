import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Image,
} from "react-native";
import { Text, TextInput, Button, Appbar, Menu } from "react-native-paper";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRoute, RouteProp } from "@react-navigation/native";

const situacoes = [
  { label: "Pendente", value: "Pendente" },
  { label: "Em andamento", value: "Em andamento" },
  { label: "Finalizada", value: "Finalizada" },
];

interface StepTwoFormData {
  recursosUtilizados: string;
  enderecoOcorrencia: string;
  descricaoCaso: string;
  numeroVitimas: string;
  situacaoFinal: string;
  latitude?: number;
  longitude?: number;
}

interface Ocorrencia {
  id?: number;
  recursosUtilizados?: string;
  enderecoOcorrencia?: string;
  descricaoCaso?: string;
  numeroVitimas?: string;
  situacaoFinal?: string;
  latitude?: number;
  longitude?: number;
}

type RootStackParamList = {
  StepTwo: { ocorrencia?: Ocorrencia };
  StepThree: { formData: StepTwoFormData };
};

type StepTwoRouteProp = RouteProp<RootStackParamList, "StepTwo">;

const schema: yup.ObjectSchema<StepTwoFormData> = yup.object({
  recursosUtilizados: yup
    .string()
    .required("Recursos utilizados é obrigatório"),
  enderecoOcorrencia: yup
    .string()
    .required("Endereço da ocorrência é obrigatório"),
  descricaoCaso: yup.string().required("Descrição do caso é obrigatória"),
  numeroVitimas: yup
    .string()
    .matches(/^\d+$/, "Número de vítimas deve ser um número")
    .required("Número de vítimas é obrigatório"),
  situacaoFinal: yup.string().required("Situação final é obrigatória"),
  latitude: yup.number().optional(),
  longitude: yup.number().optional(),
});

export default function StepTwo({ navigation }: any) {
  const route = useRoute<StepTwoRouteProp>();
  const ocorrenciaEdit = route.params?.ocorrencia;

  const [menuVisible, setMenuVisible] = useState(false);
  const [loadingEndereco, setLoadingEndereco] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<StepTwoFormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      recursosUtilizados: ocorrenciaEdit?.recursosUtilizados || "",
      enderecoOcorrencia: ocorrenciaEdit?.enderecoOcorrencia || "",
      descricaoCaso: ocorrenciaEdit?.descricaoCaso || "",
      numeroVitimas: ocorrenciaEdit?.numeroVitimas || "",
      situacaoFinal: ocorrenciaEdit?.situacaoFinal || "",
      latitude: ocorrenciaEdit?.latitude,
      longitude: ocorrenciaEdit?.longitude,
    },
  });

  useEffect(() => {
    AsyncStorage.getItem("stepTwoData").then((saved) => {
      if (saved && !ocorrenciaEdit) {
        const data: Partial<StepTwoFormData> = JSON.parse(saved);
        Object.keys(data).forEach((key) => {
          setValue(
            key as keyof StepTwoFormData,
            data[key as keyof StepTwoFormData] || ""
          );
        });
      }
    });
  }, []);

  const watchAll = watch();
  useEffect(() => {
    AsyncStorage.setItem("stepTwoData", JSON.stringify(watchAll));
  }, [watchAll]);

  const getCurrentLocation = async () => {
    setLoadingEndereco(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permissão de localização negada!");
        setLoadingEndereco(false);
        return null;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      setCurrentLocation({ latitude, longitude });
      setValue("latitude", latitude, { shouldValidate: false });
      setValue("longitude", longitude, { shouldValidate: false });

      const [address] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (address) {
        const parts: string[] = [];

        if (address.street) parts.push(address.street);
        if (address.name) parts.push(address.name);
        if (address.streetNumber) parts.push(address.streetNumber);
        if (address.subregion) parts.push(address.subregion);
        if (address.city) parts.push(address.city);
        if (address.region) parts.push(address.region);
        if (address.postalCode) parts.push(address.postalCode);
        if (address.country) parts.push(address.country);

        const enderecoFormatado =
          parts.length > 0
            ? parts.join(", ")
            : `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

        setValue("enderecoOcorrencia", enderecoFormatado, {
          shouldValidate: true,
        });

        return { latitude, longitude, address: enderecoFormatado };
      }
    } catch (error) {
      alert("Erro ao obter localização. Tente novamente.");
    } finally {
      setLoadingEndereco(false);
    }
    return null;
  };

  const handleEnderecoPress = async () => {
    const locationData = await getCurrentLocation();
    if (locationData) {
      alert(
        `📍 Localização capturada!\n\nLatitude: ${locationData.latitude.toFixed(
          6
        )}\nLongitude: ${locationData.longitude.toFixed(6)}`
      );
    }
  };

  const onSubmit: SubmitHandler<StepTwoFormData> = async (data) => {
    try {
      if (!data.latitude || !data.longitude) {
        const locationData = await getCurrentLocation();
        if (locationData) {
          data.latitude = locationData.latitude;
          data.longitude = locationData.longitude;

          if (!data.enderecoOcorrencia && locationData.address) {
            data.enderecoOcorrencia = locationData.address;
          }
        } else {
          alert("Não foi possível obter a localização.");
        }
      }

      if (!data.enderecoOcorrencia) {
        alert("Por favor, informe o endereço da ocorrência.");
        return;
      }

      await AsyncStorage.setItem("stepTwoData", JSON.stringify(data));

      if (data.latitude && data.longitude) {
      } else {
        console.warn(" Aviso: Coordenadas não capturadas");
      }

      navigation.navigate("StepThree", { formData: data });
    } catch (error) {
      alert("Erro ao processar localização. Tente novamente.");
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.bigScreen}>
      <Appbar.Header>
        <Image
          source={require("../img/logo.png")}
          style={{ width: 75, height: 40, marginLeft: 10 }}
          resizeMode="contain"
        />
      </Appbar.Header>
      <ScrollView
        contentContainerStyle={styles.allContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.bigTitle, { fontSize: 24 }]}>
          Registro de Ocorrência
        </Text>
        <View style={styles.whiteBox}>
          <View style={styles.redLine} />
          <View style={styles.topStepRow}>
            <MaterialCommunityIcons
              name="progress-clock"
              size={22}
              color="#E6003A"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.smallStepText}>
              2 / 5 • Dados complementares
            </Text>
          </View>
          <View style={styles.locationButtonContainer}>
            <Button
              mode="outlined"
              onPress={handleEnderecoPress}
              loading={loadingEndereco}
              icon="map-marker"
              style={styles.locationButton}
              textColor="#E6003A"
            >
              {loadingEndereco
                ? "Obtendo localização..."
                : "Usar minha localização atual"}
            </Button>

            {currentLocation && (
              <View style={styles.coordinatesContainer}>
                <Text style={styles.coordinatesText}>
                  📍 Lat: {currentLocation.latitude.toFixed(6)}, Long:{" "}
                  {currentLocation.longitude.toFixed(6)}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.rowGroup}>
            <Controller
              control={control}
              name="numeroVitimas"
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <View style={{ flex: 1, marginRight: 6 }}>
                  <TextInput
                    label="Número de vítimas*"
                    value={value?.toString()}
                    onChangeText={onChange}
                    keyboardType="numeric"
                    style={styles.inputBox}
                  />
                  {error && <Text style={styles.errTiny}>{error.message}</Text>}
                </View>
              )}
            />
            <Controller
              control={control}
              name="situacaoFinal"
              render={({ field: { value }, fieldState: { error } }) => (
                <View style={{ flex: 1, marginLeft: 6 }}>
                  <TouchableWithoutFeedback
                    onPress={() => setMenuVisible(true)}
                  >
                    <View pointerEvents="box-only">
                      <TextInput
                        label="Situação final*"
                        value={value}
                        style={styles.inputBox}
                        editable={false}
                        right={<TextInput.Icon icon="menu-down" />}
                      />
                    </View>
                  </TouchableWithoutFeedback>
                  <Menu
                    visible={menuVisible}
                    onDismiss={() => setMenuVisible(false)}
                    anchor={{ x: 0, y: 0 }}
                    style={{ marginTop: 48 }}
                  >
                    {situacoes.map((item) => (
                      <Menu.Item
                        key={item.value}
                        onPress={() => {
                          setValue("situacaoFinal", item.value, {
                            shouldValidate: true,
                          });
                          setMenuVisible(false);
                        }}
                        title={item.label}
                      />
                    ))}
                  </Menu>
                  {error && <Text style={styles.errTiny}>{error.message}</Text>}
                </View>
              )}
            />
          </View>
          <Controller
            control={control}
            name="recursosUtilizados"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <View style={styles.boxSpace}>
                <TextInput
                  label="Recursos utilizados*"
                  value={value}
                  onChangeText={onChange}
                  style={styles.inputBox}
                />
                {error && <Text style={styles.errTiny}>{error.message}</Text>}
              </View>
            )}
          />
          <Controller
            control={control}
            name="enderecoOcorrencia"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <View style={styles.boxSpace}>
                <TextInput
                  label="Endereço da ocorrência*"
                  value={value}
                  onChangeText={onChange}
                  style={styles.inputBox}
                  multiline
                  numberOfLines={2}
                  right={
                    <TextInput.Icon
                      icon={loadingEndereco ? "loading" : "map-marker"}
                      onPress={handleEnderecoPress}
                    />
                  }
                />
                {error && <Text style={styles.errTiny}>{error.message}</Text>}
              </View>
            )}
          />
          <Controller
            control={control}
            name="descricaoCaso"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <View style={styles.boxSpace}>
                <TextInput
                  label="Descrição do caso*"
                  value={value}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={4}
                  style={[styles.inputBox, { minHeight: 80 }]}
                />
                {error && <Text style={styles.errTiny}>{error.message}</Text>}
              </View>
            )}
          />
          <View style={styles.rowBtns}>
            <Button
              mode="text"
              style={styles.btnSmall}
              textColor="#000"
              onPress={handleBack}
            >
              Voltar
            </Button>
            <Button
              mode="contained"
              style={[styles.btnSmall, { backgroundColor: "#E6003A" }]}
              onPress={handleSubmit(onSubmit)}
            >
              Continuar
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bigScreen: { flex: 1, backgroundColor: "#F6F7FA" },
  allContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  whiteBox: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginTop: 16,
    paddingBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: { elevation: 4 },
    }),
    position: "relative",
    overflow: "hidden",
  },
  redLine: {
    height: 4,
    backgroundColor: "#E6003A",
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 2,
  },
  topStepRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 16,
    marginLeft: 16,
    alignSelf: "flex-start",
  },
  smallStepText: { fontSize: 14, color: "#444", fontWeight: "500" },
  bigTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  boxSpace: { width: "90%", marginBottom: 12, alignSelf: "center" },
  inputBox: { backgroundColor: "#fff" },
  errTiny: { color: "#E6003A", fontSize: 13, marginTop: 4 },
  rowGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    alignSelf: "center",
    marginTop: 10,
  },
  rowBtns: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    alignSelf: "center",
    marginTop: 20,
  },
  btnSmall: { width: "48%", alignSelf: "center" },
  locationButtonContainer: {
    width: "90%",
    alignSelf: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  locationButton: {
    borderColor: "#E6003A",
  },
  coordinatesContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
  },
  coordinatesText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
});
