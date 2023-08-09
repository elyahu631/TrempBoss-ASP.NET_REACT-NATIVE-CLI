import { Swipeable } from 'react-native-gesture-handler';
import { View, Text, TouchableOpacity, Animated, Alert, TouchableWithoutFeedback, StyleSheet } from 'react-native'
import React, { useContext } from 'react'
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import FlexDirectionStyle from '../styles/FlexDirection';
import { userContext } from '../context/UserContext';
import { formatAddressWithoutCountry, formatDateTime, formatDateWeekday, formatHourTime } from './FormatFunctions';

export default function SwipeableComp(props) {
  const { isDriver } = useContext(userContext);

  const directions = FlexDirectionStyle();

  // const isRideCreator = !props?.ride?.approvalStatus || props?.ride?.creator_id == userLoggedInId
  const navigation = useNavigation(); // Access the navigation prop
  const styles = createStyles(
    props.Theme.colors.primary,
    props.Theme.colors.secondary,
    props.Theme.colors.text,
    props.Theme.colors.background,
    props.LanguageWords.align,
    props.leftIcon.background,
    props?.secondLeft?.background,
    props?.rightIcon?.background,
    directions,
    props.Theme.colors,
    isDriver


  );


  const renderLeftActions = (progress, dragX) => {
    // Define the left swipe actions
    const trans = dragX.interpolate({
      inputRange: [0, 100],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    return (
      <View style={{ flexDirection: 'row' }}>


        <TouchableOpacity style={directions.isRTL ? styles.leftActionsContainer : styles.leftActionsContainerIfNotRTL} onPress={() => props.handleLeftPress(props?.ride?.tremp_id)}>
          <Animated.View style={[styles.actionContainer, { transform: [{ scale: trans }] }]}>
            <Icon name={props?.leftIcon?.name} size={35} color={props?.Theme?.colors?.text?.primary || "white"} />
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderRightActions = (progress, dragX, ride) => {
    if (ride?.approvalStatus && props?.trempTypeRequest != ride?.tremp_type) {
      return

    }
    // Define the right swipe actions
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity style={directions.isRTL ? styles.rightActionsContainer : styles.rightActionsContainerIfNotRTL} onPress={() => props.handleRightPress(ride)}>
        <Animated.View style={[styles.actionContainer, { transform: [{ scale: trans }] }]}>
          <Icon name={props?.rightIcon?.name} size={35} color={props?.Theme?.colors?.text?.primary || "white"} />
          {/* <Text style={styles.actionText}>Info</Text> */}
        </Animated.View>
      </TouchableOpacity>
    );
  };
  return (
    <TouchableWithoutFeedback  >
      <Swipeable renderLeftActions={renderLeftActions}
        renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, props.ride)}
      >
        {!props?.hideRideInfo ? (
          <View style={styles.cardContainer}>

            <Text style={[styles.text, { textAlign: 'center', textDecorationLine: 'underline' }]}>{formatDateWeekday(props.ride?.tremp_time)}</Text>

            <View style={styles.card}>
              {(props.ride?.creator?.first_name || props.ride?.creator?.last_name) && (
                <View>
                  <Text style={[styles.text, { textAlign: 'center' }]}>
                    {props.ride?.creator?.first_name}
                  </Text>
                  <Text style={[styles.text, { textAlign: 'center' }]}>
                    {props.ride?.creator?.last_name}
                  </Text>
                </View>

              )}
              <View>
                <Text style={styles.text}>
                  {props?.LanguageWords?.from}:{formatAddressWithoutCountry(props.ride?.from_route)}
                </Text>
                <Text style={styles.text}>
                  {props?.LanguageWords?.to}:{formatAddressWithoutCountry(props.ride?.to_route)}
                </Text>

              </View>




              <View>
                <Text style={[styles.text, { textAlign: 'center' }]}>
                  {formatDateTime(props.ride?.tremp_time)}
                </Text>
                <Text style={[styles.text, { textAlign: 'center' }]}>
                  {formatHourTime(props.ride?.tremp_time)}
                </Text>
              </View>

            </View>
            {/* dont have the users_in-tremp */}
            {/* {props?.userRides && (
              <Text style={styles.text}>
                {props?.LanguageWords?.requestsAmount}: {props?.ride?.users_in_tremp?.length || 0}
              </Text>
            )} */}
            {props?.ride?.approvalStatus && <Text style={styles.text}>{props?.ride?.approvalStatus}</Text>}
          </View>
        ) : <View style={[styles.requestCard,
        props?.userRequest?.is_confirmed === 'approved'
          ? styles.requestApproved
          : null,
        props?.userRequest?.is_confirmed === 'denied'
          ? styles.requestDenied
          : null,
        ]}>
          <Text
            style={styles.text}
          >
            {props?.userRequest?.user_id}
          </Text>
          <Text style={styles.text}>{props?.userRequest?.is_confirmed}</Text>


        </View>
        }
      </Swipeable>
    </TouchableWithoutFeedback >

  )
}



const createStyles = (primary, secondary, text, background, align, leftBG, secondLeftBG, rightBG, directionStyle, themeColors, isDriver) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: background,
      textAlign: align,
    },
    cardContainer: {
       borderRadius: 8,
      padding: 20,
      borderWidth: 2,
      borderColor: secondary,
      gap: 5,
      backgroundColor: 'rgba(255, 255, 255, 0.1)' /* Replace with your desired color and opacity */


    },
    card: {
      flexDirection: 'row',
      // alignItems: directionStyle.alignItems,
      padding: 0,
      margin: 0,
      gap: 0,
      justifyContent: 'space-between',


    },
    requestCard: {
      alignItems: directionStyle.alignItems,
      borderRadius: 8,
      padding: 15,
      elevation: 1,
      // Change the shadow color (for iOS shadow)

    },
    text: {
      color: text.primary,
      overflow: 'scroll',
    },
    leftActionsContainer: {
      justifyContent: 'center',
      borderTopRightRadius: 10,
      borderBottomRightRadius: 10,
      backgroundColor: leftBG,
      borderWidth: 2,
      borderColor: text.primary



    },
    leftActionsContainerIfNotRTL: {
      justifyContent: 'center',
      borderTopLeftRadius: 10,
      borderBottomLeftRadius: 10,
      backgroundColor: leftBG,
      borderWidth: 2,
      borderColor: text.primary



    },

    rightActionsContainer: {
      justifyContent: 'center',
      borderTopLeftRadius: 10,
      borderBottomLeftRadius: 10,
      backgroundColor: rightBG,
      borderWidth: 2,
      borderColor: text.primary


    },
    rightActionsContainerIfNotRTL: {
      justifyContent: 'center',
      borderTopRightRadius: 10,
      borderBottomRightRadius: 10,
      backgroundColor: rightBG,
      borderWidth: 2,
      borderColor: text.primary
    },
    swipeActionContainer: {
      paddingVertical: 10,
      paddingHorizontal: 20,
    },
    actionText: {
      color: 'white',
    },

    actionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    requestApproved: {
      shadowColor: 'green',

    },
    requestDenied: {
      shadowColor: 'red',

    },



  });
