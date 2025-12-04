import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Platform, TouchableWithoutFeedback, Image } from "react-native";
import { Text, TextInput, Button, Appbar, Menu } from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const situacoes = [
  { label: "Pendente", value: "Pendente" },
  { label: "Em andamento", value: "Em andamento" },
  { label: "Finalizada", value: "Finalizada" },
];

const schema = yup.object({
  recursosUtilizados: yup.string().required("Recursos utilizados é obrigatório"),
  enderecoOcorrencia: yup.string().required("Endereço da ocorrência é obrigatório"),
  descricaoCaso: yup.string().required("Descrição do caso é obrigatória"),
  numeroVitimas: yup
    .string()
    .typeError("Número de vítimas deve ser um número")
    .min(0, "Não pode ser negativo")
    .required("Número de vítimas é obrigatório"),
  situacaoFinal: yup.string().required("Situação final é obrigatória"),
});

export default function StepTwo({ navigation }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [loadingEndereco, setLoadingEndereco] = useState(false);

  const { control, handleSubmit, formState: { errors }, setValue } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      recursosUtilizados: "",
      enderecoOcorrencia: "",
      descricaoCaso: "",
      numeroVitimas: "",
      situacaoFinal: "",
    },
  });

  const onSubmit = (data) => {
    navigation.navigate('StepThree', { formData: data });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // Função para buscar localização e endereço
  const handleEnderecoPress = async () => {
    try {
      setLoadingEndereco(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permissão de localização negada!');
        setLoadingEndereco(false);
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      let [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      if (address) {
        const enderecoFormatado = `${address.street || ''}, ${address.subregion || ''} - ${address.city || ''}, ${address.region || ''}`;
        setValue("enderecoOcorrencia", enderecoFormatado, { shouldValidate: true });
      }
    } catch (e) {
      alert('Erro ao obter localização!');
    } finally {
      setLoadingEndereco(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Image source={require('../img/logo.png')} style={{ width: 75, height: 40, marginLeft: 10 }} resizeMode="contain" />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { fontSize: 24 }]}>Registro de Ocorrência</Text>
        <View style={styles.formCard}>
          <View style={styles.redBar} />
          <View style={styles.stepRow}>
            <MaterialCommunityIcons name="progress-clock" size={22} color="#E6003A" style={{ marginRight: 8 }} />
            <Text style={styles.stepText}>2 / 5 • Dados complementares</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '90%', alignSelf: 'center' }}>
            <Controller
              control={control}
              name="numeroVitimas"
              render={({ field: { value, onChange }, fieldState: { error } }) => (
                <View style={{ flex: 1, marginRight: 6 }}>
                  <TextInput
                    label="Número de vítimas*"
                    value={value?.toString()}
                    onChangeText={onChange}
                    keyboardType="numeric"
                    style={styles.input}
                  />
                  {error && <Text style={styles.error}>{error.message}</Text>}
                </View>
              )}
            />
            <Controller
              control={control}
              name="situacaoFinal"
              render={({ field: { value }, fieldState: { error } }) => (
                <View style={{ flex: 1, marginLeft: 6 }}>
                  <TouchableWithoutFeedback onPress={() => setMenuVisible(true)}>
                    <View pointerEvents="box-only">
                      <TextInput
                        label="Situação final*"
                        value={value}
                        style={styles.input}
                        editable={false}
                        right={<TextInput.Icon icon="menu-down" />}
                        pointerEvents="none"
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
                          setValue("situacaoFinal", item.value, { shouldValidate: true });
                          setMenuVisible(false);
                        }}
                        title={item.label}
                      />
                    ))}
                  </Menu>
                  {error && <Text style={styles.error}>{error.message}</Text>}
                </View>
              )}
            />
          </View>
          <Controller
            control={control}
            name="recursosUtilizados"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <View style={styles.inputWrapper}>
                <TextInput
                  label="Recursos utilizados*"
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
            name="enderecoOcorrencia"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <View style={styles.inputWrapper}>
                <TouchableWithoutFeedback onPress={handleEnderecoPress}>
                  <View pointerEvents="box-only">
                    <TextInput
                      label="Endereço da ocorrência*"
                      value={value}
                      onChangeText={onChange}
                      style={styles.input}
                      editable={false}
                      right={<TextInput.Icon icon={loadingEndereco ? "loading" : "map-marker"} />}
                      placeholder="Clique para preencher automaticamente"
                    />
                  </View>
                </TouchableWithoutFeedback>
                {error && <Text style={styles.error}>{error.message}</Text>}
              </View>
            )}
          />
          <Controller
            control={control}
            name="descricaoCaso"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <View style={styles.inputWrapper}>
                <TextInput
                  label="Descrição do caso*"
                  value={value}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={4}
                  style={[styles.input, { minHeight: 80 }]}
                />
                {error && <Text style={styles.error}>{error.message}</Text>}
              </View>
            )}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '90%', alignSelf:'center', marginTop: 20 }}>
            <Button mode="text" style={[styles.button]} textColor="#000" onPress={handleBack}>
              Voltar
            </Button>
            <Button mode="contained" style={[styles.button, { backgroundColor:'#E6003A' }]} onPress={handleSubmit(onSubmit)}>
              Continuar
            </Button>
          </View>
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
    width:'48%',
    alignSelf:'center'
  },
});