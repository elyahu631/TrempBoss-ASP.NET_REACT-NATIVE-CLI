import { View, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, Dimensions } from 'react-native';

import React, { useContext, useState } from 'react';
import { Text, TextInput, Button } from 'react-native-paper';
import { userContext } from '../../context/UserContext';
import FlexDirectionStyle from '../../styles/FlexDirection';

import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import GenderDropDown from '../../comp/GenderDropDown';
import { title } from '../../styleElements/StylesElements';

const { width } = Dimensions.get('window');
const imageSize = width * 0.4;

export default function Profile(props) {
  console.log(props);
  const languageWords = props.LanguageWords
  const directions = FlexDirectionStyle();

  const { userLoggedIn, UpdateLoggedInUser, UpdateLoggedInUserImage, isDriver } = useContext(userContext);
  const [firstName, setFirstName] = useState(userLoggedIn?.user?.first_name || null);
  const [lastName, setLastName] = useState(userLoggedIn?.user?.last_name || null);
  const [phoneNumber, setPhoneNumber] = useState(userLoggedIn?.user?.phone_number || null);
  const [email, setEmail] = useState(userLoggedIn?.user?.email || null);
  const [gender, setGender] = useState(userLoggedIn?.user?.gender || null);
  const [genderDropDownValue, setGenderDropDownValue] = useState(userLoggedIn?.user?.gender == "M" ? languageWords?.male : userLoggedIn?.user?.gender == languageWords?.female ? "Female" : "");
  const [currentImage, setCurrentImage] = useState(userLoggedIn?.user?.image_URL || null);
  const [image, setImage] = useState(null);
  const [isImageChanged, setIsImageChanged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  const styles = createStyles(
    props.Theme.colors.primary,
    props.Theme.colors.secondary,
    props.Theme.colors.text,
    props.Theme.colors.background,
    directions,
    title(isDriver, props.Theme)
  );

  const UpdateUser = async () => {
    if (isLoading) return
    setIsLoading(true)
    let updateInfoJson = {};
    console.log("userLoggedIn");

    if (firstName !== userLoggedIn?.user?.first_name) {
      updateInfoJson.first_name = firstName;
    }

    if (lastName !== userLoggedIn?.user?.last_name) {
      updateInfoJson.last_name = lastName;
    }

    if (phoneNumber !== userLoggedIn?.user.phone_number) {
      updateInfoJson.phone_number = phoneNumber;
    }

    if (email !== userLoggedIn?.user?.email) {
      updateInfoJson.email = email;
    }

    if (gender !== userLoggedIn?.user?.gender) {
      updateInfoJson.gender = gender;
    }
    let userMessage = ""
    const isInfoChanged = Object.keys(updateInfoJson).length !== 0
    console.log("ssszwtttttttttttttttttttttttttttttttttttttttttttttttttttt");
    console.log(updateInfoJson);
    console.log(firstName, userLoggedIn?.user?.first_name);
    if (!isInfoChanged && !isImageChanged) {
      setIsLoading(false)
      Alert.alert("הודעה", "אין שינויים");
      return;
    }
    if (isInfoChanged) {
      const result = await UpdateLoggedInUser(updateInfoJson);
      if (!result?.status) {
        userMessage += ".הייתה שגיאה בעדכון השדות נסה שנית מאוחר יותר"
        // Alert.alert("הודעה", "הייתה שגיאה אנא נסה שנית מאוחר יותר");
      }
      else {
        userMessage += "השדות עודכנו בהצלחה"

      }
    }
    // Alert.alert("Message", "Changed successfully");

    if (image && isImageChanged) {
      const imageResult = await UpdateLoggedInUserImage(image)

      if (!imageResult?.status) {
        userMessage += "\nהיית שגיאה בהעלת תמונה"
      }
      else {
        // userLoggedIn()imageUrl
        userMessage += "\nתמונה עודכנה בהצלחה"
        setIsImageChanged(false);

      }
    }
    Alert.alert("הודעה", userMessage);
    setIsLoading(false)

    return;


  };

  const handleImagePress = () => {
    Alert.alert(
      'Select Image Source',
      'Choose the image source',
      [
        {
          text: 'Camera',
          onPress: () => launchCamera({ mediaType: 'photo' }, handleImageResponse),
        },
        {
          text: 'Gallery',
          onPress: () => launchImageLibrary({ mediaType: 'photo' }, handleImageResponse),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };








  const handleImageResponse = async (response) => {
    if (!response.didCancel && !response.error) {
      // const imageUri = response.assets[0].uri;
      // const formData = new FormData();
      console.log(response.assets[0].uri);
      setImage(response)
      setCurrentImage(response?.assets[0].uri)
      setIsImageChanged(true);
    }
  };
  const DropDownOptions = [
    {
      value: "",
      name: languageWords?.selectGender
    },
    {
      value: "M",
      name: languageWords?.male
    },
    {
      value: "F",
      name: languageWords?.female
    }
  ];
  console.log(DropDownOptions);
  const onSelect = (item) => {
    setGenderDropDownValue(item.name)
    setGender(item.value)
  }
  return (
    <View style={styles.container}>
      <ScrollView style={{ marginBottom: 60 }}>
        <Text style={styles.title}>{languageWords.profile}</Text>
        <TouchableOpacity onPress={handleImagePress} style={styles.imageContainer}>
          {currentImage ? ( // Check if image and image URI exist
            <Image source={{ uri: currentImage }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.plus}>+</Text>
            </View>
          )}
        </TouchableOpacity>
        <View>
          <View style={{ flexDirection: 'row', gap: 30 }}>

            <View style={{ flex: 1 }}>
              <Text style={styles.description}>{languageWords?.firstName}</Text>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                style={styles.input}
                textColor={props.Theme.colors.text.primary}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.description}>{languageWords?.lastName}</Text>
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                style={styles.input}
                textColor={props.Theme.colors.text.primary}
              />
            </View>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>{languageWords?.phoneNumber}</Text>
            <TextInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              style={styles.input}
              textColor={props.Theme.colors.text.primary}
            />
          </View>

          <View >
            <Text style={styles.description}>{languageWords?.email}</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              textColor={props.Theme.colors.text.primary}
            />
          </View>

          {/* Repeat similar blocks for other inputs */}

          <View >
            <Text style={styles.description}>{languageWords?.gender}</Text>
            <View style={styles.pickerContainer}>
              {/* <Picker
                modalStyle={{ backgroundColor: 'red' }}
                style={styles.picker}
                selectedValue={gender}
                onValueChange={handleGenderChange}
              >
                <Picker.Item style={styles.pickerItem} label={languageWords?.selectGender} value="" />
                <Picker.Item style={styles.pickerItem} label={languageWords?.male} value="M" />
                <Picker.Item style={styles.pickerItem} label={languageWords?.female} value="F" />
              </Picker> */}
              <GenderDropDown
                style={styles.genderDropDown}
                // textColor={props?.Theme?.colors?.text?.primary}
                genderDropDownValue={genderDropDownValue}
                value={genderDropDownValue}
                onSelect={onSelect}
                languagesOptions={DropDownOptions}
              />
            </View>
          </View>
          <Button mode="contained" onPress={UpdateUser} style={[styles.saveButton, { opacity: isLoading ? 0.2 : 1 }]}>
            {languageWords?.update}
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (primary, secondary, text, background, directions, title) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: background,
      paddingHorizontal: 16,
    },
    title: {
      fontSize: 24,
      color: text.primary,
      textAlign: 'center',
    },
    imageContainer: {
      alignSelf: 'center',
      width: imageSize,
      height: imageSize,
      borderRadius: imageSize / 2,
      borderWidth: 2,
      borderColor: text.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: {
      width: '100%',
      height: '100%',
      borderRadius: imageSize / 2,
    },
    imagePlaceholder: {
      width: '100%',
      height: '100%',
      borderRadius: imageSize / 2,
      backgroundColor: 'lightgray',
      justifyContent: 'center',
      alignItems: 'center',
    },
    plus: {
      fontSize: 48,
      color: text.primary,
    },
    input: {
      fontSize: 18,
      paddingHorizontal: 10,
      backgroundColor: 'transparent',
      borderBottomWidth: 1,
      borderBottomColor: text.primary,
      textAlign: directions.textAlign,
      height: 40,
      marginBottom: 15


    },
    saveButton: {
      marginVertical: 16,
      backgroundColor: primary,
    },
    pickerContainer: {
      borderBottomWidth: 2,
      borderBottomColor: text.primary,
      fontSize: 18,
      fontWeight: 'bold',
      letterSpacing: 1.2,
      flex: 1,

    },


    description: {
      fontSize: 15,
      fontWeight: 'bold',
      textAlign: directions.textAlign == 'right' ? 'left' : 'right',
      color: text.primary
    },

    pickerItem: {
      color: text.primary
    }, title: title,
    genderDropDown: {
      color: text.primary
    }

  });