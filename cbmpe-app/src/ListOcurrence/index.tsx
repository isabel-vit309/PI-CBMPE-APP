import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  Alert,
} from "react-native";
import { Text, Appbar } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { VITE_API_URL } from "../../config";

interface Ocorrencia {
  id: number;
  nome: string;
  viatura: string;
  grupamento: string;
  local: string;
  numeroVitimas: number;
  situacaoFinal: string;
  recursosUtilizados: string;
  enderecoOcorrencia: string;
  descricao: string;
  codigoIdentificacao: string;
  cpf: string;
  telefone: string;
  dataRegistro: string;  
}

export default function ListOcurrence() {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchOcorrencias = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Erro", "Token não encontrado. Faça login novamente.");
        return;
      }

      const tokenClean = token
        .replace(/^"|"$/g, "")
        .trim()
        .replace(/^Bearer /, "");

      const response = await fetch(`${VITE_API_URL}/ocorrencias`, {
        headers: { Authorization: `Bearer ${tokenClean}` },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Erro ${response.status}`);
      }

      const data = await response.json();
      setOcorrencias(data);
    } catch (err: any) {
      console.error("Erro ao buscar ocorrências:", err);
      Alert.alert("Erro", err.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOcorrencias();
  }, []);

  const filteredOcorrencias = ocorrencias.filter((o) =>
    o.nome.toLowerCase().includes(search.toLowerCase())
  );

  const handleEditPress = (id: number) => {
    const ocorrencia = ocorrencias.find((o) => o.id === id);
    if (ocorrencia) {
      Alert.alert("Editar", `Editando ocorrência: ${ocorrencia.nome}`);
      // TODO: Navigate to edit screen or open edit modal
    }
  };

  const handleDeletePress = (id: number) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja deletar esta ocorrência?",
      [
        { text: "Cancelar", onPress: () => {}, style: "cancel" },
        {
          text: "Deletar",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              if (!token) {
                Alert.alert("Erro", "Token não encontrado.");
                return;
              }

              const tokenClean = token
                .replace(/^"|"$/g, "")
                .trim()
                .replace(/^Bearer /, "");

              const response = await fetch(
                `${VITE_API_URL}/ocorrencias/${id}`,
                {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${tokenClean}` },
                }
              );

              if (!response.ok) {
                throw new Error(`Erro ${response.status}`);
              }

              // Remove from state after successful deletion
              setOcorrencias((prev) => prev.filter((o) => o.id !== id));
              Alert.alert("Sucesso", "Ocorrência deletada com sucesso!");
            } catch (err: any) {
              Alert.alert("Erro", err.message || "Erro ao deletar ocorrência");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <View style={styles.mainScreen}>
      <Appbar.Header>
        <Image
          source={require("../img/logo.png")}
          style={{ width: 75, height: 40, marginLeft: 10 }}
          resizeMode="contain"
        />
      </Appbar.Header>

      <Text style={styles.bigTitle}>Ocorrências</Text>

      <View style={styles.searchBox}>
        <MaterialIcons name="search" size={22} color="#808080" />
        <TextInput
          placeholder="Search"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.tableTop}>
        <Text style={styles.tableTopTxt}>Author ↓</Text>
      </View>

      <ScrollView style={styles.scrollList}>
        {filteredOcorrencias.map((item) => (
          <View key={item.id} style={styles.lineRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.personName}>{item.nome}</Text>
              <Text style={styles.smallText}>
                Data:{" "}
                {new Date(item.dataRegistro).toLocaleDateString("pt-BR")}
              </Text>
              <Text style={styles.smallText}>
                Hora:{" "}
                {new Date(item.dataRegistro).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
              <Text style={styles.smallText}>
                Endereço: {item.enderecoOcorrencia}
              </Text>
              <Text style={styles.smallText}>
                Vítimas: {item.numeroVitimas}
              </Text>
              <Text style={styles.smallText}>
                Situação: {item.situacaoFinal}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
              <MaterialIcons 
                name="edit" 
                size={24} 
                color="#d60027" 
                onPress={() => handleEditPress(item.id)}
              />

              <MaterialIcons 
                name="delete" 
                size={24} 
                color="#d60027" 
                onPress={() => handleDeletePress(item.id)}
                style={{ marginLeft: 10 }}
              />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainScreen: {
    flex: 1,
    backgroundColor: "#f5f6fa",
    padding: 15,
  },
  bigTitle: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  searchInput: {
    marginLeft: 8,
    fontSize: 16,
    flex: 1,
  },
  tableTop: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d60027",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  tableTopTxt: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
  },
  scrollList: {
    flex: 1,
  },
  lineRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e6e6e6",
  },
  personName: {
    fontSize: 16,
    fontWeight: "600",
  },
  smallText: {
    fontSize: 13,
    color: "#777",
  },
});
