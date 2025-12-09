import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Platform, Image } from "react-native";
import { Text, TextInput, Button, Appbar } from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const schema = yup.object({
  nome: yup.string().required("Nome é obrigatório"),
  codigoId: yup.string().required("Código de ID é obrigatório"),
  cpf: yup.string().required("CPF é obrigatório"),
  telefone: yup.string().required("Telefone é obrigatório"),
  descricaoCaso: yup.string().required("Descrição do caso é obrigatória"),
});

export default function StepFour({ navigation }) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      nome: "",
      codigoId: "",
      cpf: "",
      telefone: "",
      descricaoCaso: "",
    },
  });

  useEffect(() => {
    AsyncStorage.getItem("stepFourData").then((saved) => {
      if (saved) {
        let data = JSON.parse(saved);
        if (data.nome) setValue("nome", data.nome);
        if (data.codigoId) setValue("codigoId", data.codigoId);
        if (data.cpf) setValue("cpf", data.cpf);
        if (data.telefone) setValue("telefone", data.telefone);
        if (data.descricaoCaso) setValue("descricaoCaso", data.descricaoCaso);
      }
    });
  }, []);

  const watchAll = watch();
  useEffect(() => {
    AsyncStorage.setItem("stepFourData", JSON.stringify(watchAll));
  }, [watchAll]);

  function onSubmit(data) {
    AsyncStorage.setItem("stepFourData", JSON.stringify(data));
    navigation.navigate("StepFive", { formData: data });
  }

  function handleBack() {
    navigation.goBack();
  }

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
        contentContainerStyle={styles.scrollStuff}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.bigTitle, { fontSize: 24 }]}>
          Registro de Ocorrência
        </Text>

        <View style={styles.cardBox}>
          <View style={styles.topRedLine} />

          <View style={styles.progressRow}>
            <MaterialCommunityIcons
              name="progress-clock"
              size={22}
              color="#E6003A"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.progressText}>4 / 5 • Identificação</Text>
          </View>

          <View style={styles.twoInputsRow}>
            <Controller
              control={control}
              name="nome"
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <View style={styles.smallInputBox}>
                  <TextInput
                    label="Nome*"
                    value={value}
                    onChangeText={onChange}
                    style={styles.inputThing}
                  />
                  {error && <Text style={styles.errText}>{error.message}</Text>}
                </View>
              )}
            />

            <Controller
              control={control}
              name="codigoId"
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <View style={styles.smallInputBox}>
                  <TextInput
                    label="Código de ID*"
                    value={value}
                    onChangeText={onChange}
                    style={styles.inputThing}
                  />
                  {error && <Text style={styles.errText}>{error.message}</Text>}
                </View>
              )}
            />
          </View>

          <Controller
            control={control}
            name="cpf"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <View style={styles.fullInputBox}>
                <TextInput
                  label="CPF*"
                  value={value}
                  onChangeText={onChange}
                  style={styles.inputThing}
                />
                {error && <Text style={styles.errText}>{error.message}</Text>}
              </View>
            )}
          />

          <Controller
            control={control}
            name="telefone"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <View style={styles.fullInputBox}>
                <TextInput
                  label="Telefone*"
                  value={value}
                  onChangeText={onChange}
                  style={styles.inputThing}
                  keyboardType="phone-pad"
                />
                {error && <Text style={styles.errText}>{error.message}</Text>}
              </View>
            )}
          />

          <Controller
            control={control}
            name="descricaoCaso"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <View style={styles.fullInputBox}>
                <TextInput
                  label="Descrição do caso*"
                  value={value}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={4}
                  style={[styles.inputThing, { minHeight: 80 }]}
                />
                {error && <Text style={styles.errText}>{error.message}</Text>}
              </View>
            )}
          />

          <View style={styles.btnsRow}>
            <Button
              mode="text"
              style={styles.btnSimple}
              textColor="#000"
              onPress={handleBack}
            >
              Voltar
            </Button>

            <Button
              mode="contained"
              style={[styles.btnSimple, { backgroundColor: "#E6003A" }]}
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
  bigScreen: {
    flex: 1,
    backgroundColor: "#F6F7FA",
  },

  scrollStuff: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  cardBox: {
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
      android: {
        elevation: 4,
      },
    }),
    position: "relative",
    overflow: "hidden",
  },

  topRedLine: {
    height: 4,
    backgroundColor: "#E6003A",
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 2,
  },

  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 16,
    marginLeft: 16,
    alignSelf: "flex-start",
  },

  bigTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    alignSelf: "flex-start",
  },

  progressText: {
    fontSize: 14,
    color: "#444",
    fontWeight: "500",
  },

  twoInputsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    alignSelf: "center",
  },

  smallInputBox: {
    flex: 1,
    marginHorizontal: 6,
  },

  fullInputBox: {
    width: "90%",
    marginBottom: 12,
    alignSelf: "center",
  },

  inputThing: {
    backgroundColor: "#fff",
  },

  errText: {
    color: "#E6003A",
    fontSize: 13,
    marginTop: 4,
  },

  btnsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    alignSelf: "center",
    marginTop: 20,
  },

  btnSimple: {
    width: "48%",
    alignSelf: "center",
  },
});
