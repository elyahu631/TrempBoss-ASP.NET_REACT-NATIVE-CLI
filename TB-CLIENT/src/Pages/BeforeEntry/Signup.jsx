import React, { useContext, useState } from 'react'
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Snackbar, Button, Text } from 'react-native-paper';
import { userContext } from '../../context/UserContext';
import { TranslationContext } from '../../styles/Languages/Languages';
// import { Formik } from 'formik';
// import * as Yup from 'yup';
import { ThemeContext } from '../../styles/Themes/ThemeContext';
import { Formik } from 'formik';
import * as Yup from 'yup';
export default function Sign_up(props) {
  const { theme } = useContext(ThemeContext);
  const { primary, secondary, text, background } = theme.colors
  const styles = createStyles(primary, secondary, text, background)
  const primaryColorVar = primaryColor(primary, secondary, text.primary);
  const { GetDictByLangAndKey } = useContext(TranslationContext);
  const wordsKey = 'login';
  const pageWords = GetDictByLangAndKey(wordsKey);
  const generalWords = GetDictByLangAndKey('general');


  const [errorMessage, setErrorMessage] = useState("")
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const { AddUser } = useContext(userContext);
  const [showPassword, setShowPassword] = useState(false)

  // const validationSchema = Yup.object().shape({
  //   email: Yup.string().email('Invalid email').required('Email is required'),
  //   password: Yup.string()
  //     .required('Password is required')
  //     .min(8, 'Password must be 8 to 20 characters')
  //     .max(20, 'Password must be 8 to 20 characters')
  //     .matches(
  //       /^(?=.*[a-z])(?=.*\d).*/,
  //       'Password must contain at least one lowercase letter and one number'
  //     ),
  //   confirmPassword: Yup.string()
  //     .oneOf([Yup.ref('password'), null], 'Passwords must match')
  //     .required('Confirm Password is required'),
  // });

  const validationSchema = Yup.object().shape({
    email: Yup.string().email('אימייל לא תקין').required('אימייל חובה'),
    password: Yup.string()
      .required('חובה לבחור סיסמא')
      .min(8, 'סיסמא לא יכולה להיות קצרה מ8 תווים')
      .max(20, 'סיסמא לא יכולה להיות ארוכה מ20 תווים')
      .matches(
        /^(?=.*[a-z])(?=.*\d).*/,
        'סיסמא חייבת להכיל לפחות אות קטנה אחת ומספר אחד'
      ),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm Password is required'),
  });
  
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);

  };

  const signUpAction = async ({ email, password, confirmPassword }) => {
    // Implement sign-up logic here


    if (email === "" || password === "" || confirmPassword === "") {
      await setErrorMessage("אנא מלא את כל הפרטים")
      await setSnackbarVisible(true);
      return;
    }
    if (password !== confirmPassword) {
      await setErrorMessage("אימות סיסמא לא תואם")
      await setSnackbarVisible(true);
      return;
    }
    try {//upload to database
      let insertResult = await AddUser({ email, password })
      console.log("insertResult");
      console.log(insertResult);
      console.log("insertResult");
      if (!insertResult?.status) {
        await setErrorMessage(insertResult?.error?.message)
        await setSnackbarVisible(true);
        return;
      }
      props.navigation.navigate('Login')
    }
    catch {

    }

  }





  return (

    <View style={styles.container}>
      <Text style={styles.primaryColor} variant="headlineLarge">{pageWords['register']}</Text>

      <Formik
        initialValues={{
          email: '',
          password: '',
          confirmPassword: '',
        }}
        validationSchema={validationSchema}
        onSubmit={(values) => signUpAction(values)}
      >
        {({ handleChange, handleSubmit, values, errors, touched }) => (
          <>
            <TextInput
              placeholder={pageWords['insertMail']}
              style={styles.input}
              onChangeText={handleChange('email')}
              value={values.email}
              placeholderTextColor="gray"
              textAlign={generalWords['align']}
              error={touched.email && errors.email}
            />
            {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            <TextInput
              placeholder={pageWords['insertPassword']}
              autoCapitalize="none"
              style={styles.input}
              onChangeText={handleChange('password')}
              value={values.password}
              placeholderTextColor="gray"
              secureTextEntry={!showPassword}
              textAlign={generalWords['align']}
              error={touched.password && errors.password}
            />
            {touched.password && errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

            <TextInput
              placeholder={pageWords['confirmPass']}
              style={styles.input}
              onChangeText={handleChange('confirmPassword')}
              value={values.confirmPassword}
              placeholderTextColor="gray"
              secureTextEntry={!showPassword}
              textAlign={generalWords['align']}
              error={touched.confirmPassword && errors.confirmPassword}
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}

            <TouchableOpacity onPress={toggleShowPassword}>
              <Text style={styles.showPasswordButtonText}>
                {showPassword ? pageWords['hidePassword'] : pageWords['showPassword']}
              </Text>
            </TouchableOpacity>


            <Button

              mode="outlined"
              textColor={background}
              buttonColor={primaryColorVar.primary}
              onPress={handleSubmit}
              labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
              style={{ marginTop: 10  }}

            >
              {pageWords['register']}
            </Button>

          </>
        )}
      </Formik>
      <Button textColor={primaryColorVar.primary} onPress={() => {
        props.navigation.navigate('Login')
      }}>

        {pageWords['ifRegistered']}
      </Button>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{

          onPress: () => {
            // Handle undo action
          },
        }}
        style={{
          backgroundColor: 'red',
          borderRadius: 20,
        }}
      >
        {errorMessage}
      </Snackbar>

    </View >

  )
}
const primaryColor = (primary, secondary, opposite) => {
  return { primary, secondary, opposite }
}

const createStyles = (primary, secondary, text, background) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: background,
    },
    primaryColor: {
      color: primary,
    },
    primaryTextColor: {
      color: text.primary,
    },

    input: {
      width: 300,
      borderColor: 'gray',
      borderWidth: 2,
      borderRadius: 10,
      padding: 10,
      marginVertical: 10,
      backgroundColor: background,
      fontSize: 18,
      fontWeight: 'bold',
      color: text.primary,
      letterSpacing: 1.2,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.27,
      shadowRadius: 4.65,
      elevation: 6,
    },
    hideInput: {
      color: text.primary,
      width: 300,
      borderColor: 'gray',
      borderWidth: 2,
      borderRadius: 10,
      padding: 10,
      marginVertical: 10,
      backgroundColor: background,
      fontSize: 18,
      fontWeight: 'bold',
      letterSpacing: 1.2,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.27,
      shadowRadius: 4.65,
      elevation: 6,
    },
    showPasswordButton: {
      textAlign: 'right',
    },
    showPasswordButtonLeft: {
      textAlign: 'left',
    },
    showPasswordButtonText: {
      color: text.primary,
    },
    errorText: {
      color: 'red',
      fontSize: 12,
    },
    signUpButton: {
      padding: 5,
      alignItems: 'center',
      marginTop: 15,
    },
    signUpButtonText: {
      color: background, // Use your background color
      fontWeight: 'bold',
    },
  });