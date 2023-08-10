import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Slider from '@react-native-community/slider';
import FlexDirectionStyle, { DirectionsType } from '../styles/FlexDirection';

const SliderRange = (props: any) => {
  console.log(props);
  
  const flexDirection = FlexDirectionStyle();
  const styles = createStyles(flexDirection)
  const handleValueChange = (value: number) => {
    props.SetSeatsAmount(value);
  };

  return (
    <View style={styles.container}>

      <Text style={{ color: props?.Theme?.colors?.text?.primary }}>{props.IsDriver ? props?.PageWords?.seatsAvailable : props?.PageWords?.askForSeatsAmount}{":" + props.SeatsAmount}</Text>

      <Slider
        value={props.SeatsAmount}
        style={[styles.slider, flexDirection.flexDirection == "row" ? styles.swapSide : null]}
        minimumValue={props.MinValue}
        maximumValue={props.MaxValue}
        step={1}
        onValueChange={handleValueChange}
        minimumTrackTintColor={props.IsDriver ? props.Theme.colors?.driver : props.Theme.colors?.hitchhiker}
        maximumTrackTintColor={props.Theme.colors.text.primary}
        thumbTintColor={props.IsDriver ? props.Theme.colors?.hitchhiker : props.Theme.colors?.driver}
      />
    </View>
  );
};

const createStyles = (directions: DirectionsType) => StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  slider: {
    width: Dimensions.get('window').width * 0.7,
  }, swapSide: {
    transform: [{ scaleX: -1 }]

  }
});

export default SliderRange;
