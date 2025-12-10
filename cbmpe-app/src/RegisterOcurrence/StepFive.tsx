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

  const limparFormulario = async () => {
    try {
      await AsyncStorage.multiRemove([
        "stepOneData",
        "stepTwoData",
        "stepThreeData",
        "stepFourData",
      ]);

      setStepOne({});
      setStepTwo({});
      setStepThree({});
      setStepFour({});

      return true;
    } catch (error) {
      return false;
    }
  };

  async function handleFinish() {
    setLoading(true);
    try {
      let token = await AsyncStorage.getItem("token");

      console.log("Token bruto:", token);

      if (!token || token === "" || token === "null") {
        Alert.alert("Sessão expirada", "Faça login novamente.");
        await AsyncStorage.removeItem("token");
        navigation.navigate("Login");
        setLoading(false);
        return;
      }

      token = token.trim();
      if (token.startsWith('"') && token.endsWith('"')) {
        token = token.slice(1, -1);
      }
      if (token.startsWith("Bearer ")) {
        token = token.slice(7);
      }

      console.log("Token limpo:", token.substring(0, 30) + "...");

      const ocorrenciaData = {
        viatura: stepOne.viatura,
        grupamento: stepOne.agrupamentos,
        local: stepOne.local,
        numeroVitimas: parseInt(stepTwo.numeroVitimas || "0"),
        situacaoFinal: stepTwo.situacaoFinal,
        recursosUtilizados: stepTwo.recursosUtilizados,
        enderecoOcorrencia: stepTwo.enderecoOcorrencia,
        descricao: stepTwo.descricaoCaso,
        nome: stepFour.nome,
        codigoIdentificacao: stepFour.codigoId,
        cpf: stepFour.cpf,
        telefone: stepFour.telefone,
      };

      console.log("Dados enviados:", JSON.stringify(ocorrenciaData, null, 2));
      console.log("URL:", `${VITE_API_URL}/ocorrencias`);
      console.log(
        "Header Authorization:",
        `Bearer ${token.substring(0, 20)}...`
      );

      const response = await axios.post(
        `${VITE_API_URL}/ocorrencias`,
        ocorrenciaData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        }
      );

      const limpezaOk = await limparFormulario();

      if (limpezaOk) {
        Alert.alert(
          "✅ Sucesso!",
          "Ocorrência registrada e formulário limpo.",
          [{ text: "OK", onPress: () => navigation.navigate("StepSix") }]
        );
      } else {
        Alert.alert(
          "⚠️ Atenção",
          "Ocorrência registrada, mas houve um problema ao limpar o formulário.",
          [{ text: "OK", onPress: () => navigation.navigate("StepSix") }]
        );
      }
    } catch (error) {
      console.error("Erro completo:", {
        status: error.response?.status,
        message: error.response?.data?.message,
        data: error.response?.data,
        fullError: error.message,
      });

      if (error.response) {
        if (error.response.status === 401) {
          Alert.alert("Token expirado", "Faça login novamente para continuar.");
          await AsyncStorage.removeItem("token");
          navigation.navigate("Login");
        } else if (error.response.status === 403) {
          Alert.alert(
            "Acesso negado",
            "Seu usuário não tem permissão para registrar ocorrências."
          );
        } else if (error.response.status === 400) {
          Alert.alert(
            "Dados inválidos",
            error.response.data?.message || "Verifique os campos preenchidos"
          );
        } else {
          Alert.alert(
            "Erro",
            error.response.data?.message || "Erro ao registrar ocorrência"
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
          Finalizar e Limpar Formulário
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
    width: "90%",
  },
});
