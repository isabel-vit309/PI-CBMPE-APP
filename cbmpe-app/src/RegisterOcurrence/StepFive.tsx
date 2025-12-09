import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { VITE_API_URL } from "../../config";

type StepOneType = {
  dataHora?: string;
  viatura?: string;
  tipoOcorrencia?: string;
  agrupamentos?: string;
  local?: string;
};

type StepTwoType = {
  numeroVitimas?: string;
  situacaoFinal?: string;
  recursosUtilizados?: string;
  enderecoOcorrencia?: string;
  descricaoCaso?: string;
};

type StepThreeType = {
  imageUri?: string;
  signature?: string;
  isSignatureSaved?: boolean;
};

type StepFourType = {
  nome?: string;
  codigoId?: string;
  cpf?: string;
  telefone?: string;
  descricaoCaso?: string;
};

export default function StepFive({ navigation }) {
  const [stepOne, setStepOne] = useState<StepOneType>({});
  const [stepTwo, setStepTwo] = useState<StepTwoType>({});
  const [stepThree, setStepThree] = useState<StepThreeType>({});
  const [stepFour, setStepFour] = useState<StepFourType>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const one = await AsyncStorage.getItem("stepOneData");
        const two = await AsyncStorage.getItem("stepTwoData");
        const three = await AsyncStorage.getItem("stepThreeData");
        const four = await AsyncStorage.getItem("stepFourData");
        if (one) setStepOne(JSON.parse(one));
        if (two) setStepTwo(JSON.parse(two));
        if (three) setStepThree(JSON.parse(three));
        if (four) setStepFour(JSON.parse(four));
      } catch (e) {
        console.log("Erro ao carregar dados:", e);
      }
    }
    loadData();
  }, []);

  async function handleFinish() {
    setLoading(true);
    try {
      // Mapeamento igual ao web
      const ocorrenciaData = {
        roles: [stepOne.tipoOcorrencia], // igual ao web
        viatura: stepOne.viatura,
        grupamento: stepOne.agrupamentos,
        status: stepTwo.situacaoFinal,
        dataHoraOcorrido: stepOne.dataHora,
        regiao: stepOne.local,
        descricao: stepTwo.descricaoCaso,
        recursosUtilizados: stepTwo.recursosUtilizados,
        numeroVitimas: parseInt(stepTwo.numeroVitimas || "0"),
        enderecoOcorrencia: stepTwo.enderecoOcorrencia,
        situacaoFinal: stepTwo.situacaoFinal,
        nome: stepFour.nome,
        codigoIdentificacao: stepFour.codigoId,
        cpf: stepFour.cpf,
        telefone: stepFour.telefone,
        descricaoIdentificacao: stepFour.descricaoCaso,
        imageUri: stepThree.imageUri || null,
        assinatura: stepThree.signature || null,
      };

      let token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Sessão expirada", "Faça login novamente.");
        navigation.navigate("Login");
        return;
      }
      token = token.replace(/^"|"$/g, "").trim();
      if (token.startsWith("Bearer ")) token = token.slice(7);

      await axios.post(`${VITE_API_URL}/ocorrencias`, ocorrenciaData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      await AsyncStorage.multiRemove([
        "stepOneData",
        "stepTwoData",
        "stepThreeData",
        "stepFourData",
      ]);

      Alert.alert("Sucesso", "Ocorrência registrada com sucesso!");
      navigation.navigate("StepSix");
    } catch (error) {
      console.error("Erro detalhado ao enviar ocorrência:", error);
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          if (
            error.response.data?.message?.includes("acesso negado") ||
            error.response.data?.message?.includes("Access Denied")
          ) {
            Alert.alert(
              "Acesso negado",
              "Seu usuário não tem permissão para registrar ocorrências."
            );
          } else {
            Alert.alert(
              "Sessão expirada ou token inválido",
              "Faça login novamente."
            );
            await AsyncStorage.removeItem("token");
            navigation.navigate("Login");
          }
        } else if (error.response.status === 400) {
          Alert.alert(
            "Dados inválidos",
            error.response.data?.message || "Verifique os campos preenchidos"
          );
        } else {
          Alert.alert(
            "Erro ao registrar ocorrência",
            error.response.data?.message || error.message
          );
        }
      } else if (error.request) {
        Alert.alert(
          "Erro de conexão",
          "Não foi possível contactar o servidor."
        );
      } else {
        Alert.alert("Erro", error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Resumo da Ocorrência</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Dados principais</Text>
          <Text>Data/Hora: {stepOne.dataHora}</Text>
          <Text>Viatura: {stepOne.viatura}</Text>
          <Text>Tipo de Ocorrência: {stepOne.tipoOcorrencia}</Text>
          <Text>Agrupamentos: {stepOne.agrupamentos}</Text>
          <Text>Local: {stepOne.local}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Dados complementares</Text>
          <Text>Número de vítimas: {stepTwo.numeroVitimas}</Text>
          <Text>Situação final: {stepTwo.situacaoFinal}</Text>
          <Text>Recursos utilizados: {stepTwo.recursosUtilizados}</Text>
          <Text>Endereço da ocorrência: {stepTwo.enderecoOcorrencia}</Text>
          <Text>Descrição do caso: {stepTwo.descricaoCaso}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Anexos e Evidências</Text>
          <Text>Imagem:</Text>
          {stepThree.imageUri ? (
            <Image
              source={{ uri: stepThree.imageUri }}
              style={{
                width: 120,
                height: 120,
                borderRadius: 8,
                marginBottom: 8,
              }}
              resizeMode="cover"
            />
          ) : (
            <Text>Nenhuma imagem enviada.</Text>
          )}
          <Text>Assinatura:</Text>
          {stepThree.signature ? (
            <Image
              source={{ uri: stepThree.signature }}
              style={{ width: 120, height: 60, borderRadius: 4 }}
              resizeMode="contain"
            />
          ) : (
            <Text>Nenhuma assinatura salva.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Identificação</Text>
          <Text>Nome: {stepFour.nome}</Text>
          <Text>Código ID: {stepFour.codigoId}</Text>
          <Text>CPF: {stepFour.cpf}</Text>
          <Text>Telefone: {stepFour.telefone}</Text>
          <Text>Descrição do caso: {stepFour.descricaoCaso}</Text>
        </View>

        <Button
          mode="contained"
          style={styles.button}
          onPress={handleFinish}
          loading={loading}
          disabled={loading}
        >
          Finalizar
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    alignItems: "stretch",
    backgroundColor: "#F6F7FA",
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    alignSelf: "center",
    color: "#E6003A",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 18,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 8,
    color: "#222",
    fontSize: 16,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#E6003A",
    alignSelf: "center",
    width: "80%",
  },
});
