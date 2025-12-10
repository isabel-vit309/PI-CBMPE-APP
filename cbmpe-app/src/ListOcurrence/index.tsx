import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  Alert,
  RefreshControl,
} from "react-native";
import { Text, Appbar, Button } from "react-native-paper";
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

export default function ListOcurrence({ navigation }) {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const fetchOcorrencias = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Erro", "Token não encontrado. Faça login novamente.");
        return;
      }

      const tokenClean = token.replace(/^"|"$/g, "").trim();

      const response = await fetch(`${VITE_API_URL}/ocorrencias`, {
        headers: {
          Authorization: `Bearer ${tokenClean}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        Alert.alert("Sessão expirada", "Faça login novamente.");
        // Navegar para tela de login
        return;
      }

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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOcorrencias();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOcorrencias();
  };

  const handleDeletePress = (id: number) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja deletar esta ocorrência? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sim, deletar",
          style: "destructive",
          onPress: () => deleteOcorrencia(id),
        },
      ]
    );
  };

  const deleteOcorrencia = async (id: number) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Erro", "Token não encontrado.");
        return;
      }

      const tokenClean = token.replace(/^"|"$/g, "").trim();

      console.log("Tentando deletar ocorrência ID:", id);
      console.log("URL:", `${VITE_API_URL}/ocorrencias/${id}`);

      const response = await fetch(`${VITE_API_URL}/ocorrencias/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${tokenClean}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      console.log("Status da resposta DELETE:", response.status);

      if (response.status === 204 || response.status === 200) {
        // Sucesso - remover da lista
        setOcorrencias((prev) => prev.filter((o) => o.id !== id));
        Alert.alert("Sucesso", "Ocorrência deletada com sucesso!");
      } else if (response.status === 401) {
        Alert.alert(
          "Não autorizado",
          "Sua sessão expirou. Faça login novamente."
        );
        // Navegar para login
      } else if (response.status === 403) {
        Alert.alert(
          "Permissão negada",
          "Você não tem permissão para deletar esta ocorrência."
        );
      } else if (response.status === 404) {
        Alert.alert("Não encontrado", "A ocorrência não foi encontrada.");
        // Atualizar lista
        fetchOcorrencias();
      } else {
        const errorText = await response.text();
        Alert.alert(
          "Erro",
          `Erro ${response.status}: ${errorText || "Erro desconhecido"}`
        );
      }
    } catch (err: any) {
      console.error("Erro ao deletar:", err);
      Alert.alert(
        "Erro",
        "Não foi possível conectar ao servidor. Verifique sua conexão."
      );
    }
  };

  const handleEditPress = (id: number) => {
    const ocorrencia = ocorrencias.find((o) => o.id === id);
    if (ocorrencia) {
      navigation.navigate("Ocorrência", {
        screen: "StepOne",
        params: {
          ocorrencia: ocorrencia, // 🔹 use o mesmo nome que StepOne espera
        },
      });
    }
  };

  const filteredOcorrencias = ocorrencias.filter(
    (o) =>
      o.nome.toLowerCase().includes(search.toLowerCase()) ||
      o.enderecoOcorrencia.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando ocorrências...</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainScreen}>
      <Appbar.Header>
        <Image
          source={require("../img/logo.png")}
          style={{ width: 75, height: 40, marginLeft: 10 }}
          resizeMode="contain"
        />
      </Appbar.Header>

      <Text style={styles.bigTitle}>Minhas Ocorrências</Text>

      <View style={styles.searchBox}>
        <MaterialIcons name="search" size={22} color="#808080" />
        <TextInput
          placeholder="Buscar por nome ou endereço..."
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <MaterialIcons
            name="clear"
            size={20}
            color="#808080"
            onPress={() => setSearch("")}
          />
        )}
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          Total: {ocorrencias.length} ocorrência(s)
          {search.length > 0 && ` | Filtradas: ${filteredOcorrencias.length}`}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#d60027"]}
          />
        }
      >
        {filteredOcorrencias.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="search-off" size={50} color="#ccc" />
            <Text style={styles.emptyText}>
              {search.length > 0
                ? "Nenhuma ocorrência encontrada com esta busca"
                : "Você ainda não registrou nenhuma ocorrência"}
            </Text>
          </View>
        ) : (
          filteredOcorrencias.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.personName}>{item.nome}</Text>
                <View style={styles.actions}>
                  <MaterialIcons
                    name="edit"
                    size={22}
                    color="#d60027"
                    onPress={() => handleEditPress(item.id)}
                  />
                  <MaterialIcons
                    name="delete"
                    size={22}
                    color="#d60027"
                    onPress={() => handleDeletePress(item.id)}
                    style={{ marginLeft: 15 }}
                  />
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <MaterialIcons name="calendar-today" size={16} color="#666" />
                  <Text style={styles.infoText}>
                    {new Date(item.dataRegistro).toLocaleDateString("pt-BR")} às{" "}
                    {new Date(item.dataRegistro).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <MaterialIcons name="location-on" size={16} color="#666" />
                  <Text style={styles.infoText}>{item.enderecoOcorrencia}</Text>
                </View>

                <View style={styles.infoRow}>
                  <MaterialIcons name="local-hospital" size={16} color="#666" />
                  <Text style={styles.infoText}>
                    Vítimas: {item.numeroVitimas} | Situação:{" "}
                    {item.situacaoFinal}
                  </Text>
                </View>

                {item.descricao && (
                  <View style={styles.infoRow}>
                    <MaterialIcons name="description" size={16} color="#666" />
                    <Text style={styles.infoText} numberOfLines={2}>
                      {item.descricao}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.footerText}>
                  ID: {item.codigoIdentificacao || item.id}
                </Text>
              </View>
            </View>
          ))
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bigTitle: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    elevation: 2,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    marginLeft: 10,
    fontSize: 16,
    flex: 1,
    color: "#333",
  },
  statsContainer: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center",
  },
  statsText: {
    color: "#666",
    fontSize: 14,
  },
  scrollList: {
    flex: 1,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
  },
  personName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardBody: {
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
    flex: 1,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
  footerText: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
  },
});
