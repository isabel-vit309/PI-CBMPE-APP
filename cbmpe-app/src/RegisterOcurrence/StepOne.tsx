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
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RouteProp, useRoute } from "@react-navigation/native";

interface Ocorrencia {
  id?: number;
  dataHora?: string;
  viatura?: string;
  tipoOcorrencia?: string;
  agrupamentos?: string;
  local?: string;
}

interface TipoOcorrencia {
  value: string;
  label: string;
}

interface StepOneFormData {
  dataHora: string;
  viatura: string;
  tipoOcorrencia: string;
  agrupamentos: string;
  local: string;
}

type RootStackParamList = {
  StepOne: { ocorrencia?: Ocorrencia };
  StepTwo: { formData: StepOneFormData };
};

type StepOneRouteProp = RouteProp<RootStackParamList, "StepOne">;

const tiposOcorrencia: TipoOcorrencia[] = [
  { value: "Incendio", label: "Incêndio" },
  { value: "Alagamento", label: "Alagamento" },
  { value: "Deslizamento", label: "Deslizamento" },
  { value: "Acidente Rodoviário", label: "Acidente Rodoviário" },
  { value: "Queda de Árvore", label: "Queda de Árvore" },
  { value: "Tempestade", label: "Tempestade" },
];

const schema: yup.ObjectSchema<StepOneFormData> = yup.object({
  dataHora: yup.string().required("Data e hora é obrigatória"),
  viatura: yup.string().required("Viatura é obrigatória"),
  tipoOcorrencia: yup.string().required("Selecione o tipo de ocorrência"),
  agrupamentos: yup.string().notRequired(),
  local: yup.string().required("Local é obrigatório"),
});

const locais = [
  { value: "Rural", label: "Rural" },
  { value: "Urbana", label: "Urbana" },
];

export default function StepOne({ navigation }: any) {
  const route = useRoute<StepOneRouteProp>();
  const ocorrenciaEdit = route.params?.ocorrencia;

  const [showMenu, setShowMenu] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showLocalMenu, setShowLocalMenu] = useState(false);

  const defaultFormValues: StepOneFormData = {
    dataHora: ocorrenciaEdit?.dataHora || "",
    viatura: ocorrenciaEdit?.viatura || "",
    tipoOcorrencia: ocorrenciaEdit?.tipoOcorrencia || "",
    agrupamentos: ocorrenciaEdit?.agrupamentos || "",
    local: ocorrenciaEdit?.local || "",
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<StepOneFormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: defaultFormValues,
  });

  useEffect(() => {
    if (ocorrenciaEdit) {
      reset(defaultFormValues);
    } else {
      AsyncStorage.getItem("stepOneData").then((saved) => {
        if (saved) {
          const data: Partial<StepOneFormData> = JSON.parse(saved);
          reset({ ...defaultFormValues, ...data });
        }
      });
    }
  }, [ocorrenciaEdit]);

  const watchAll = watch();
  useEffect(() => {
    AsyncStorage.setItem("stepOneData", JSON.stringify(watchAll));
  }, [watchAll]);

  function formatDateTime(date: string | undefined) {
    if (!date) return "";
    const d = new Date(date);
    return (
      d.toLocaleDateString("pt-BR") +
      " " +
      d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    );
  }

  function handleDatePress() {
    setShowDatePicker(true);
  }

  function onDateChange(event: any, selectedDate?: Date) {
    setShowDatePicker(false);
    if (selectedDate) {
      setValue("dataHora", selectedDate.toISOString(), {
        shouldValidate: true,
      });
      setShowTimePicker(true);
    }
  }

  function onTimeChange(event: any, selectedTime?: Date) {
    setShowTimePicker(false);
    if (selectedTime) {
      const currentISO = watch("dataHora");
      const dateObj = currentISO ? new Date(currentISO) : new Date();
      dateObj.setHours(selectedTime.getHours());
      dateObj.setMinutes(selectedTime.getMinutes());
      dateObj.setSeconds(0);
      setValue("dataHora", dateObj.toISOString(), { shouldValidate: true });
    }
  }

  const onSubmit: SubmitHandler<StepOneFormData> = (data) => {
    AsyncStorage.setItem("stepOneData", JSON.stringify(data));
    navigation.navigate("StepTwo", { formData: data });
  };

  return (
    <View style={styles.mainBox}>
      <Appbar.Header>
        <Image
          source={require("../img/logo.png")}
          style={{ width: 75, height: 40, marginLeft: 10 }}
          resizeMode="contain"
        />
      </Appbar.Header>
      <ScrollView
        contentContainerStyle={styles.scrollInside}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.bigTitle, { fontSize: 24 }]}>
          Registro de Ocorrência
        </Text>
        <View style={styles.boxForm}>
          <View style={styles.redLineTop} />
          <View style={styles.stepHeaderRow}>
            <MaterialCommunityIcons
              name="progress-clock"
              size={22}
              color="#E6003A"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.stepTextSmall}>1 / 5 • Dados principais</Text>
          </View>
          <Controller
            control={control}
            name="dataHora"
            render={({ field: { value }, fieldState: { error } }) => (
              <View style={styles.boxInputAll}>
                <TouchableWithoutFeedback onPress={handleDatePress}>
                  <View pointerEvents="box-only">
                    <TextInput
                      label="Data e hora*"
                      value={formatDateTime(value)}
                      style={styles.inputField}
                      editable={false}
                      right={<TextInput.Icon icon="calendar" />}
                      placeholder="Escolha a data e hora"
                    />
                  </View>
                </TouchableWithoutFeedback>
                {showDatePicker && (
                  <DateTimePicker
                    value={value ? new Date(value) : new Date()}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onDateChange}
                    locale="pt-BR"
                  />
                )}
                {showTimePicker && (
                  <DateTimePicker
                    value={value ? new Date(value) : new Date()}
                    mode="time"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onTimeChange}
                    locale="pt-BR"
                  />
                )}
                {error && <Text style={styles.textError}>{error.message}</Text>}
              </View>
            )}
          />
          <Controller
            control={control}
            name="viatura"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <View style={styles.boxInputAll}>
                <TextInput
                  label="Viatura*"
                  value={value}
                  onChangeText={onChange}
                  style={styles.inputField}
                />
                {error && <Text style={styles.textError}>{error.message}</Text>}
              </View>
            )}
          />
          <Controller
            control={control}
            name="tipoOcorrencia"
            render={({ field: { value }, fieldState: { error } }) => (
              <View style={styles.boxInputAll}>
                <TouchableWithoutFeedback onPress={() => setShowMenu(true)}>
                  <View pointerEvents="box-only">
                    <TextInput
                      label="Tipo de Ocorrência*"
                      value={value}
                      style={styles.inputField}
                      editable={false}
                      right={<TextInput.Icon icon="menu-down" />}
                      placeholder="Selecione o tipo de ocorrência"
                    />
                  </View>
                </TouchableWithoutFeedback>
                <Menu
                  visible={showMenu}
                  onDismiss={() => setShowMenu(false)}
                  anchor={{ x: 0, y: 0 }}
                  style={{ marginTop: 48 }}
                >
                  {tiposOcorrencia.map((item) => (
                    <Menu.Item
                      key={item.value}
                      onPress={() => {
                        setValue("tipoOcorrencia", item.label, {
                          shouldValidate: true,
                        });
                        setShowMenu(false);
                      }}
                      title={item.label}
                    />
                  ))}
                </Menu>
                {error && <Text style={styles.textError}>{error.message}</Text>}
              </View>
            )}
          />
          <Controller
            control={control}
            name="agrupamentos"
            render={({ field: { value, onChange } }) => (
              <View style={styles.boxInputAll}>
                <TextInput
                  label="Agrupamentos"
                  value={value}
                  onChangeText={onChange}
                  style={styles.inputField}
                />
              </View>
            )}
          />
          <Controller
            control={control}
            name="local"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <View style={styles.boxInputAll}>
                <TouchableWithoutFeedback
                  onPress={() => setShowLocalMenu(true)}
                >
                  <View pointerEvents="box-only">
                    <TextInput
                      label="Local*"
                      value={value}
                      style={styles.inputField}
                      editable={false}
                      right={<TextInput.Icon icon="menu-down" />}
                      placeholder="Selecione Rural ou Urbana"
                    />
                  </View>
                </TouchableWithoutFeedback>
                <Menu
                  visible={showLocalMenu}
                  onDismiss={() => setShowLocalMenu(false)}
                  anchor={{ x: 0, y: 0 }}
                  style={{ marginTop: 48 }}
                >
                  {locais.map((item) => (
                    <Menu.Item
                      key={item.value}
                      title={item.label}
                      onPress={() => {
                        onChange(item.value);
                        setShowLocalMenu(false);
                      }}
                    />
                  ))}
                </Menu>
                {error && <Text style={styles.textError}>{error.message}</Text>}
              </View>
            )}
          />

          <Button
            mode="contained"
            style={styles.btnNext}
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
  mainBox: { flex: 1, backgroundColor: "#F6F7FA" },
  scrollInside: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  boxForm: {
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
  redLineTop: {
    height: 4,
    backgroundColor: "#E6003A",
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 2,
  },
  stepHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 16,
    marginLeft: 16,
  },
  bigTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  stepTextSmall: { fontSize: 14, color: "#444", fontWeight: "500" },
  boxInputAll: { width: "90%", marginBottom: 12, alignSelf: "center" },
  inputField: { backgroundColor: "#fff" },
  textError: { color: "#E6003A", fontSize: 13, marginTop: 4 },
  btnNext: {
    marginTop: 20,
    backgroundColor: "#E6003A",
    width: "90%",
    alignSelf: "center",
  },
});
