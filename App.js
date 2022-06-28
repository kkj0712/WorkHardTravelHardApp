import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Pressable,
} from 'react-native';
import { theme } from './colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Fontisto } from '@expo/vector-icons';

const STORAGE_KEY = "@toDos";
const WORKING_KEY = "@working";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [check, setCheck] = useState(false);
  
  useEffect(() => {
    loadToDos();
    loadStatus();
  }, []);
  
  useEffect(() => {
    saveStatus();
  }, [working]);

  const work = () => setWorking(true);
  const travel = () => setWorking(false);
  const onChangeText = (payload) => setText(payload);

  const saveStatus = async () => {
    try {
      await AsyncStorage.setItem(WORKING_KEY, working.toString());
    } catch (error) {
      console.log(`saveStatus error: ${error}`);
    }
  }

  const loadStatus = async () => {
    try {
      const w = await AsyncStorage.getItem(WORKING_KEY);
      setWorking(JSON.parse(w));
    } catch (error) {
      console.log(`loadStatus error: ${error}`);
    }
  }

  const saveTodos = async (toSave) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.log(`saveToDos error: ${error}`);
    }
  };

  const loadToDos = async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY);
      setToDos(JSON.parse(s)); //String -> Object
      console.log(toDos);
    } catch (error) {
      console.log(`loadToDos error: ${error}`);
    }
  };
  
  const addTodo = async () => {
    if(text === ""){
      return;
    } 
    const newToDos = {
      ...toDos, 
      [Date.now()]: { text, working, check },
    };
    setToDos(newToDos);
    await saveTodos(newToDos);
    setText("");
  };

  const checkToDo = async (key) => {
    setCheck(!check);
    const newToDos = {...toDos};
    newToDos[key].check = check;
    setToDos(newToDos);
    await saveTodos(newToDos);
  };

  const updateToDo = () => {
    const newToDos = {...toDos};
    saveTodos(newToDos);
  };

  const editText = (key, payload) => {
    const newToDos = {...toDos};
    newToDos[key].text = payload;
    setToDos(newToDos);
  };

  const deleteToDo = (key) => {
    Alert.alert("Delete To Do?", "Are you sure?", [
      { text: "Cancel" },
      { 
        text: "I'm Sure", 
        onPress: () => { 
          const newToDos = { ...toDos };
          delete newToDos[key];
          setToDos(newToDos);
          saveTodos(newToDos);
        }, 
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text 
            style={{
              ...styles.btnText, 
              color: working ? "white": theme.grey,
            }}
          >Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text 
            style={{
              ...styles.btnText, 
              color: !working ? "white": theme.grey,
              }}
            >Travel
            </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addTodo}
        onChangeText={onChangeText}
        value={text}
        placeholder={working ? "Add a To Do" : "Where do you wanna go?"} 
        style={styles.input} 
      />
      <ScrollView>
        {Object.keys(toDos).map((key) => 
          toDos[key].working === working ? 
          <View key={key} style={styles.toDo}>
            <View style={styles.checkBox} >
              <TouchableOpacity onPress={() => checkToDo(key)}>
                { toDos[key].check === true ?
                <Fontisto name="checkbox-active" size={20} color={theme.toDoBg} /> : 
                <Fontisto name="checkbox-passive" size={20} color={theme.toDoBg} />
                }
              </TouchableOpacity>
              <TextInput 
                style={{
                  ...styles.toDoText,
                  textDecorationLine: toDos[key].check === true? 'line-through' : 'none',
                }}
                onChangeText={(payload) => editText(key, payload)}
                onSubmitEditing={updateToDo}
              >
                {toDos[key].text}
              </TextInput>
            </View>
            <TouchableOpacity hitSlop={20} onPress={() => deleteToDo(key)}>
              <Fontisto name="trash" size={16} color={theme.toDoBg} />
            </TouchableOpacity>
          </View> : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.grey,
    marginBottom: 10,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    paddingLeft: 10,
  },
  checkBox: {
    flexDirection: "row",
    alignItems: "center",
  }
});
