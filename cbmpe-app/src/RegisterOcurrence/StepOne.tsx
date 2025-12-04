import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Platform, TouchableWithoutFeedback, Image } from "react-native";
import { Text, TextInput, Button, Appbar, Menu } from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialCommunityIcons } from '@expo/vector-icons';

const tiposOcorrencia = [
  { value: "Incendio", label: "Incêndio" },
  { value: "Alagamento", label: "Alagamento" },
  { value: "Deslizamento", label: "Deslizamento" },
  { value: "Acidente Rodoviário", label: "Acidente Rodoviário" },
  { value: "Queda de Árvore", label: "Queda de Árvore" },
  { value: "Tempestade", label: "Tempestade" },
];

const schema = yup.object({
  dataHora: yup.string().required("Data e hora é obrigatória"),
  viatura: yup.string().required("Viatura é obrigatória"),
  tipoOcorrencia: yup.string().required("Selecione o tipo de ocorrência"),
  agrupamentos: yup.string(),
  local: yup.string().required("Local é obrigatório"),
});

export default function StepOne({ navigation }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      dataHora: "",
      viatura: "",
      tipoOcorrencia: "",
      agrupamentos: "",
      local: "",
    },
  });

  function formatDateTime(date) {
    if (!date) return "";
    const d = new Date(date);
    return (
      d.toLocaleDateString("pt-BR") +
      " " +
      d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    );
  }

  const handleDatePress = () => setShowDatePicker(true);
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setValue("dataHora", selectedDate.toISOString(), { shouldValidate: true });
      setShowTimePicker(true);
    }
  };
  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const currentISO = watch("dataHora");
      let dateObj = currentISO ? new Date(currentISO) : new Date();
      dateObj.setHours(selectedTime.getHours());
      dateObj.setMinutes(selectedTime.getMinutes());
      dateObj.setSeconds(0);
      setValue("dataHora", dateObj.toISOString(), { shouldValidate: true });
    }
  };

  // Aqui faz a navegação para a próxima tela
  const onSubmit = (data) => {
    navigation.navigate('StepTwo', { formData: data });
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Image
            source={require('../img/logo.png')} 
            style={{ width: 75, height: 40, marginLeft: 10 }}
            resizeMode="contain"
        />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { fontSize: 24 }]}>Registro de Ocorrência</Text>
        <View style={styles.formCard}>
          <View style={styles.redBar} />
          <View style={styles.stepRow}>
            <MaterialCommunityIcons name="progress-clock" size={22} color="#E6003A" style={{ marginRight: 8 }} />
            <Text style={styles.stepText}>1 / 5 • Dados principais</Text>
          </View>
          <Controller
            control={control}
            name="dataHora"
            render={({ field: { value }, fieldState: { error } }) => (
              <View style={styles.inputWrapper}>
                <TouchableWithoutFeedback onPress={handleDatePress}>
                  <View pointerEvents="box-only">
                    <TextInput
                      label="Data e hora*"
                      value={value ? formatDateTime(value) : ""}
                      style={styles.input}
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
                {error && <Text style={styles.error}>{error.message}</Text>}
              </View>
            )}
          />
          <Controller
            control={control}
            name="viatura"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <View style={styles.inputWrapper}>
                <TextInput
                  label="Viatura*"
                  value={value}
                  onChangeText={onChange}
                  style={styles.input}
                />
                {error && <Text style={styles.error}>{error.message}</Text>}
              </View>
            )}
          />
          <Controller
            control={control}
            name="tipoOcorrencia"
            render={({ field: { value }, fieldState: { error } }) => (
              <View style={styles.inputWrapper}>
                <TouchableWithoutFeedback onPress={() => setShowMenu(true)}>
                  <View pointerEvents="box-only">
                    <TextInput
                      label="Tipo de Ocorrência*"
                      value={value}
                      style={styles.input}
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
                        setValue("tipoOcorrencia", item.label, { shouldValidate: true });
                        setShowMenu(false);
                      }}
                      title={item.label}
                    />
                  ))}
                </Menu>
                {error && <Text style={styles.error}>{error.message}</Text>}
              </View>
            )}
          />
          <Controller
            control={control}
            name="agrupamentos"
            render={({ field: { value, onChange } }) => (
              <View style={styles.inputWrapper}>
                <TextInput
                  label="Agrupamentos"
                  value={value}
                  onChangeText={onChange}
                  style={styles.input}
                />
              </View>
            )}
          />
          <Controller
            control={control}
            name="local"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <View style={styles.inputWrapper}>
                <TextInput
                  label="Local*"
                  value={value}
                  onChangeText={onChange}
                  style={styles.input}
                />
                {error && <Text style={styles.error}>{error.message}</Text>}
              </View>
            )}
          />
          <Button mode="contained" style={styles.button} onPress={handleSubmit(onSubmit)}>
            Continuar
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7FA",
  },
  content: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: 'center',
  },
  formCard: {
    width: '100%',
    backgroundColor: '#fff',
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
      android: {
        elevation: 4,
      },
    }),
    position: 'relative',
    overflow: 'hidden',
  },
  redBar: {
    height: 4,
    backgroundColor: '#E6003A',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 2,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
    marginLeft: 16,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    alignSelf:'flex-start'
  },
  stepText: {
    fontSize: 14,
    color: "#444",
    fontWeight:'500'
  },
  inputWrapper: {
    width: "90%",
    marginBottom: 12,
    alignSelf:'center'
  },
  input: {
    backgroundColor: "#fff",
  },
  error: {
    color: "#E6003A",
    fontSize: 13,
    marginTop: 4,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#E6003A",
    width: "90%",
    alignSelf:'center'
  },
});