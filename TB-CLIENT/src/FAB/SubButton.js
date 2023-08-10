import React from 'react';

import { DeviceEventEmitter, StyleSheet, Text, Image, View } from 'react-native';
import { TapGestureHandler, State } from 'react-native-gesture-handler';

import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import {
  SUBBTN_BORDER_RADIUS,
  SUBBTN_HEIGHT,
  SUBBTN_TAP_EVENT,
  SUBBTN_WIDTH,
} from './Constants';

const SubButton = props => {
  const styles = createStyles(props?.backGroundColor)

  /**
   * Destructure our label and our onPress callback
   */
  const { label, onPress, size, color, icon, backgroud } = props;

  /**
   * The shared value of the button opacity. We change
   * the opacity when the button is being held down.
   */
  const buttonOpacity = useSharedValue(1);

  /**
   * The tap gesture handler for the button.
   *
   * We change the opacity to represent the button being
   * pressed. If the button does get pressed, we emit the SubButton tap event to
   * trigger the FAB children container to close; if the press is interrupted,
   * we change the opacity back to 1.0 and break.
   */
  function _onTapHandlerStateChange({ nativeEvent }) {
    switch (nativeEvent.state) {
      case State.BEGAN: {
        buttonOpacity.value = 0.5;
        break;
      }
      case State.END: {
        DeviceEventEmitter.emit(SUBBTN_TAP_EVENT);
        buttonOpacity.value = 1.0;
        onPress && onPress();
        break;
      }
      case State.CANCELLED: {
        buttonOpacity.value = 1.0;
        break;
      }
      case State.FAILED: {
        buttonOpacity.value = 1.0;
        break;
      }
      case State.UNDETERMINED: {
        buttonOpacity.value = 1.0;
        break;
      }
    }
  }

  /**
   * The animated styles for the opacity of the button
   * that is used in the style prop of the button
   */
  const animatedStyles = useAnimatedStyle(() => {
    return {
      opacity: buttonOpacity.value,
    };
  });

  return (
    <TapGestureHandler onHandlerStateChange={_onTapHandlerStateChange}>
      <Animated.View style={[styles.subButton, animatedStyles]}>
        {/* <Icon name="gear" size={30} /> */}
        {icon == 'wheel' && (<View>
          <Image
            source={require('../asserts/images/steetingwheel.png')} // Specify the path to your PNG image
            style={[styles.image, { height: size, width: size, tintColor: color }]}
          />
        </View>)
        }
        {icon == 'hand' &&
          (<View>
            <Image
              source={require('../asserts/images/hand.png')} // Specify the path to your PNG image
              style={[styles.image, { height: size, width: size, tintColor: color }]}
            />
          </View>)
        }
        {/* <Text style={styles.label}>{label}</Text> */}
      </Animated.View>
    </TapGestureHandler>
  );
};

export default SubButton;

const createStyles = (background) => {
  return StyleSheet.create({
    subButton: {
      width: SUBBTN_WIDTH,
      height: SUBBTN_HEIGHT,
      borderRadius: SUBBTN_BORDER_RADIUS,
      backgroundColor: background,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
    },


  });
}