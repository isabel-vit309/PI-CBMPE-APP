import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { VITE_API_URL } from "../../config";

interface TokenPayload {
  sub: string;
  role?: string | string[];
  roles?: string | string[];
  nome?: string;
  email?: string;
}

export default function Login({ onLogin }: { onLogin: () => void }) {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert("Erro", "Preencha email e código de acesso");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const text = await response.text();
      console.log("Resposta bruta:", text);

      let token: string;
      let data: any = {};
      try {
        data = JSON.parse(text);
        token = data.token;
      } catch (e) {
        token = text;
      }

      if (!response.ok) {
        throw new Error(
          data.message || data.error || `Erro ${response.status}`
        );
      }

      const decoded: TokenPayload = jwtDecode(token as string);

      let roleValue =
        (Array.isArray(decoded.role) ? decoded.role[0] : decoded.role) ||
        (Array.isArray(decoded.roles) ? decoded.roles[0] : decoded.roles) ||
        "";

      if (
        roleValue &&
        typeof roleValue === "string" &&
        roleValue.startsWith("ROLE_")
      ) {
        roleValue = roleValue.replace("ROLE_", "");
      }
      const usuarioCompleto = {
        id: decoded.sub,
        nome: decoded.nome || "",
        email: decoded.email || "",
        roles: Array.isArray(decoded.roles) ? decoded.roles : [roleValue],
      };

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("role", roleValue);
      await AsyncStorage.setItem("usuario", JSON.stringify(usuarioCompleto));

      onLogin();
    } catch (err: any) {
      console.error("❌ Erro no login:", err);
      Alert.alert("Erro", err.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.title}>Login</Text>
        <Text style={styles.label}>Email</Text>
        <TextInput
          mode="outlined"
          placeholder="Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text style={styles.label}>Código de Acesso</Text>
        <TextInput
          mode="outlined"
          placeholder="Código de Acesso"
          secureTextEntry={!passwordVisible}
          right={
            <TextInput.Icon
              icon={passwordVisible ? "eye-off" : "eye"}
              onPress={() => setPasswordVisible(!passwordVisible)}
            />
          }
          style={styles.input}
          value={senha}
          onChangeText={setSenha}
        />
        <Button
          mode="contained"
          style={styles.button}
          onPress={handleLogin}
          loading={loading}
        >
          Acessar
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    width: "85%",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#000",
  },
  label: {
    fontSize: 14,
    color: "#000",
    marginBottom: 4,
  },
  input: {
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  button: {
    marginTop: 10,
    backgroundColor: "#E6003A",
    paddingVertical: 6,
    borderRadius: 6,
  },
});
