import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import MapView, { Marker } from "react-native-maps";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { VITE_API_URL } from "../../config";

interface Ocorrencia {
  id: number;
  titulo: string;
  latitude: number;
  longitude: number;
  enderecoOcorrencia?: string;
  descricao?: string;
  situacaoFinal?: string;
}

const geocodeAddress = async (address: string) => {
  if (!address) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address
    )}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "MeuAppExpo/1.0",
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }
    return null;
  } catch (err) {
    return null;
  }
};

export default function Home() {
  const navigation = useNavigation<any>();
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Usuário");
  const [region, setRegion] = useState({
    latitude: -8.047562,
    longitude: -34.877002,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const fetchOcorrencias = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Erro", "Sessão expirada. Faça login novamente.");
        navigation.navigate("Login");
        setLoading(false);
        return;
      }

      const tokenClean = token.replace(/^"|"$/g, "").trim();

      const response = await fetch(`${VITE_API_URL}/ocorrencias`, {
        headers: {
          Authorization: `Bearer ${tokenClean}`,
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();

        const ocorrenciasComCoordenadas: Ocorrencia[] = [];

        for (const ocorrencia of data) {
          let lat = ocorrencia.latitude;
          let lng = ocorrencia.longitude;

          if ((!lat || !lng) && ocorrencia.enderecoOcorrencia) {
            const coords = await geocodeAddress(ocorrencia.enderecoOcorrencia);
            if (coords) {
              lat = coords.latitude;
              lng = coords.longitude;
            }
          }

          if (lat && lng) {
            ocorrenciasComCoordenadas.push({
              id: ocorrencia.id,
              titulo: ocorrencia.nome || `Ocorrência #${ocorrencia.id}`,
              latitude: parseFloat(lat),
              longitude: parseFloat(lng),
              enderecoOcorrencia: ocorrencia.enderecoOcorrencia,
              descricao: ocorrencia.descricao,
              situacaoFinal: ocorrencia.situacaoFinal,
            });
          }
        }

        setOcorrencias(ocorrenciasComCoordenadas);

        if (ocorrenciasComCoordenadas.length > 0) {
          setRegion({
            latitude: ocorrenciasComCoordenadas[0].latitude,
            longitude: ocorrenciasComCoordenadas[0].longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        }
      } else if (response.status === 401) {
        Alert.alert("Sessão expirada", "Faça login novamente.");
        navigation.navigate("Login");
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar as ocorrências");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserName = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const user = JSON.parse(userData);
        setUserName(user.nome || "Usuário");
      }
    } catch (error) {
      // Silencioso
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUserName();
      fetchOcorrencias();
    }, [])
  );

  useEffect(() => {
    fetchUserName();
    fetchOcorrencias();
  }, []);

  const handleMarkerPress = (ocorrencia: Ocorrencia) => {
    Alert.alert(
      ocorrencia.titulo,
      `📍 ${ocorrencia.latitude.toFixed(6)}, ${ocorrencia.longitude.toFixed(
        6
      )}\n\n${ocorrencia.enderecoOcorrencia || "Sem endereço"}\n\n${
        ocorrencia.descricao || "Sem descrição"
      }\n\nSituação: ${ocorrencia.situacaoFinal || "Não informada"}`,
      [{ text: "OK" }]
    );
  };

  const handleAddOcorrencia = () => {
    AsyncStorage.removeItem("stepOneData");
    AsyncStorage.removeItem("stepTwoData");
    AsyncStorage.removeItem("stepThreeData");

    navigation.navigate("Ocorrência", {
      screen: "StepOne",
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.helloText}>
          Olá, {userName}!
        </Text>
        <View style={styles.roleContainer}>
          <Text style={styles.roleText}>CBMPE</Text>
        </View>
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.optionOcurrence}
          onPress={handleAddOcorrencia}
        >
          <MaterialIcons name="add-circle-outline" size={28} color="#333" />
          <Text style={styles.optionLabel}>Nova Ocorrência</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionOcurrence}
          onPress={() =>
            navigation.navigate("Casos", { screen: "ListOcurrence" })
          }
        >
          <MaterialIcons name="assignment" size={28} color="#333" />
          <Text style={styles.optionLabel}>Ver Casos</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <Text variant="titleLarge" style={styles.ocurrenceTitle}>
          Mapa de Ocorrências
        </Text>
      </View>

      <View style={styles.containerMap}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF3259" />
            <Text style={styles.loadingText}>Carregando mapa...</Text>
          </View>
        ) : (
          <>
            <MapView
              style={styles.map}
              region={region}
              showsUserLocation
              showsMyLocationButton
            >
              {ocorrencias.map((item) => (
                <Marker
                  key={item.id}
                  coordinate={{
                    latitude: item.latitude,
                    longitude: item.longitude,
                  }}
                  title={item.titulo}
                  description={item.enderecoOcorrencia}
                  pinColor={
                    item.situacaoFinal === "Finalizada"
                      ? "green"
                      : item.situacaoFinal === "Em andamento"
                      ? "orange"
                      : "#FF3259"
                  }
                  onPress={() => handleMarkerPress(item)}
                />
              ))}
            </MapView>

            {ocorrencias.length === 0 && (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="location-off" size={50} color="#ccc" />
                <Text style={styles.emptyText}>
                  Nenhuma ocorrência com localização
                </Text>
                <Text style={styles.emptySubtext}>
                  Crie uma nova ocorrência para visualizar no mapa
                </Text>
              </View>
            )}
          </>
        )}
      </View>

      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "#FF3259" }]} />
          <Text style={styles.legendText}>Pendente</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "orange" }]} />
          <Text style={styles.legendText}>Em andamento</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "green" }]} />
          <Text style={styles.legendText}>Finalizada</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  helloText: {
    fontWeight: "bold",
    color: "#222",
  },
  roleContainer: {
    marginTop: 6,
    backgroundColor: "#FF3259",
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 50,
  },
  roleText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 15,
    gap: 10,
  },
  optionOcurrence: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    gap: 6,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  statsContainer: {
    marginBottom: 12,
  },
  ocurrenceTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  statsText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  containerMap: {
    height: 360,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    backgroundColor: "#ccc",
    position: "relative",
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  emptyContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginTop: 10,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginTop: 5,
    paddingHorizontal: 20,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 15,
    padding: 10,
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: "#555",
  },
});
