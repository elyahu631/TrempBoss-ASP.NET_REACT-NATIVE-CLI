import { Text, View, StyleSheet, Dimensions, TextStyle, StyleProp, ScrollView, Platform, TouchableOpacity } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { Button, Snackbar, TextInput } from 'react-native-paper'

import { rideContext } from '../../context/RidesContext';
import { userContext } from '../../context/UserContext';
import { InputObject, TextObject } from '../../types/types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapPicker from '../../comp/MapPicker';
import { LatLng } from 'react-native-maps';
import SliderRange from '../../comp/SliderRange';
import { title } from '../../styleElements/StylesElements';
import { Theme } from '../../styles/Themes/ThemeContext';

export default function AddDriveOrRequest(props: any) {
  const { addRide } = useContext(rideContext);
  const { userLoggedIn, isDriver } = useContext(userContext);




  const [inProgress, setInProgress] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("red")
  const styles = createStyles(props.Theme, props.GeneralWords, title(isDriver, props.Theme), isDriver,snackBarColor,inProgress)

  const [seats_amount, setSeatsAmount] = useState<number>(1);
  const [note, setNote] = useState('');

  const [showDetails, setShowDetails] = useState("")
  const [snackbarVisible, setSnackbarVisible] = useState(false);





  const [date, setDate] = useState(null);
  const [time, setTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [text, setText] = useState(props.PageWords.PickDate);
  const [hour, setHour] = useState(props.PageWords.PickTime);

  const [fromLocation, setFromLocation] = useState('');
  const [fromCoords, setFromCoords] = useState<LatLng | null>(null);
  const [toLocation, setToLocation] = useState('');
  const [toCoords, setToCoords] = useState<LatLng | null>(null);



  const onChange = (event: any, selectedDate: any) => {
    if (event?.type != "set") {
      setShowDatePicker(false);
      return;
    }
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
    let tempDate = new Date(currentDate);
    let fDate = tempDate.getDate() + "/" + (tempDate.getMonth() + 1) + "/" + tempDate.getFullYear();
    setText(fDate);

  }
  const onTimeChange = (event: any, selectedTime: any) => {
    if (event.type !== "set") {
      setShowTimePicker(false);
      return;
    }
  
    const currentHour = selectedTime || date;
  
    const timeZoneOffset = currentHour.getTimezoneOffset();
    const adjustedTime = new Date(currentHour.getTime() - timeZoneOffset * 60 * 1000);
  
    setShowTimePicker(false);
    setTime(adjustedTime);
  
    const formattedHour = currentHour.getHours().toString().padStart(2, '0'); 
    const formattedMinutes = currentHour.getMinutes().toString().padStart(2, '0'); 
    const formattedTime = `${formattedHour}:${formattedMinutes}`;
  
    setHour(formattedTime);
  };

  // const handleTextChangeseats_amount = (newText: number) => {
  //   setSeatsAmount(newText);
  // };
const displaySnackBar =(content:string,color:string='red')=>{
  setSnackBarColor(color);
  setShowDetails(content);
  setSnackbarVisible(true);
  setInProgress(false);
}

  const handleTextChangeNote = (newText: string) => {
    setNote(newText);
  };

  const handelSubmit = async () => {

    if (inProgress) {
      setShowDetails("באמצע תהליך");
      setSnackbarVisible(true);
      return;
    }

    setInProgress(true);
    if (!seats_amount) {
      displaySnackBar("הכנס מספר מקומות פנויים")
      return;
    }
    if (!fromLocation || !toLocation || !fromCoords || !toCoords) {
      displaySnackBar("מוצא או יעד ריקים")
      return;
    }
    if (!date || !time) {
      displaySnackBar("אנא בחר תאריך ושעה")
      return;

    }
    const selectedDateTime = new Date(date);//combain date and the time 
    selectedDateTime.setHours(time.getHours());
    selectedDateTime.setMinutes(time.getMinutes());


    let result = await addRide({ creator_id: userLoggedIn?.user?.user_id, tremp_type: isDriver ? "driver" : 'hitchhiker', tremp_time: selectedDateTime, seats_amount, from_route: fromLocation, to_route: toLocation, note }, userLoggedIn.token)


    if (!result?.status) {
      displaySnackBar(JSON.stringify(result?.error));
      return;
    }
    displaySnackBar("נסיעה הוספה",'green')
 

  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isDriver ? props?.PageWords.IsDriverTitle : props?.PageWords.IsHitchhikerTitle}
      </Text>

      <View style={styles.inputContainer}>
        <MapPicker
          Inputstyles={styles.input}
          CurrentLanguage={props.CurrentLanguage}
          GeneralWords={props.GeneralWords}
          GoogleMapsApiKey={props.GoogleMapsApiKey}
          PageWords={props.PageWords}
          Theme={props.Theme}
          fromLocation={fromLocation}
          fromCoords={fromCoords}
          toLocation={toLocation}
          toCoords={toCoords}
          setFromLocation={setFromLocation}
          setFromCoords={setFromCoords}
          setToLocation={setToLocation}
          setToCoords={setToCoords}
        />

        <TextInput
          onChangeText={handleTextChangeNote}
          value={note}
          style={styles.input}
          placeholder={props.PageWords.note}
          placeholderTextColor={props.Theme.colors.input.placeholder}
          textColor={props.Theme.colors.text.primary}
        />

        <SliderRange MaxValue={5} MinValue={1} SetSeatsAmount={setSeatsAmount} SeatsAmount={seats_amount} IsDriver={isDriver} Theme={props.Theme} PageWords={props.PageWords} />
      </View>

      <TouchableOpacity style={styles.datePickerContainer} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.datePickerText}>{text}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.datePickerContainer} onPress={() => setShowTimePicker(true)}>
        <Text style={styles.datePickerText}>{hour}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date || new Date()}
          mode="date"
          is24Hour
          display="default"
          onChange={(event, selectedDate) => onChange(event, selectedDate)}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={time || new Date()}
          mode="time"
          is24Hour
          display="default"
          onChange={onTimeChange}

        />
      )}

      <Button style={styles.submitButton} onPress={handelSubmit} textColor={props?.Theme?.colors?.text?.primary}>
        {props.PageWords.addBtnText}
      </Button>
      <View style={{
        flex:1,justifyContent:'center',
        alignItems: 'center',
        }}>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={styles.snackbar}
          
        >

         <Text style={styles.snackbarContext}>{showDetails}</Text> 
        </Snackbar>
      </View>
    </View>
  );
}



const createStyles = (theme: Theme, GeneralWords: any, title: object, isDriver: boolean,snackBarColor:string,isInProgress:boolean) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingHorizontal: 20, // Add horizontal padding,


    },
    title: title,
    inputContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 15, // Add some margin between the input elements
    },
    input: {
      backgroundColor: theme.colors.input.border,
      textAlign: GeneralWords.align as TextStyle['textAlign'],
      borderRadius: 4,
      width: Dimensions.get('window').width * 0.8,
      height: 50,
      paddingHorizontal: 10,
      marginBottom: 15,
      fontSize: 16,
      justifyContent: 'center',

    },
    datePickerContainer: {
      marginBottom: 16,
      alignSelf: 'center',
    },
    datePickerText: {
      color: theme.colors.text.primary,
      textAlign: 'center',
      fontSize: 16,
      fontWeight: 'bold',
    },
    submitButton: {
      backgroundColor: isDriver ? theme?.colors?.driver : theme?.colors?.hitchhiker,
      opacity:isInProgress?.4:1,
      width: Dimensions.get('window').width * 0.7,
      alignSelf: 'center',
      marginTop: 10,
      marginBottom: 20, 
    },
    snackbar: {
      backgroundColor: snackBarColor,
      borderRadius: 8,
      bottom: Dimensions.get('window').height * 0.2,
    },snackbarContext:{
      color:theme?.colors?.text?.primary||'gray',
      textAlign:'center',
      fontWeight:'bold',
    }
  });
};