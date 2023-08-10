import { View, TouchableOpacity, Text, Modal, StyleSheet, Dimensions } from 'react-native';
import React, { useState, useCallback } from 'react';
import { Button } from 'react-native-paper';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Icon from 'react-native-vector-icons/FontAwesome';
import FlexDirectionStyle from '../styles/FlexDirection';

const { height } = Dimensions.get('window');
const { width } = Dimensions.get('window');

export default function AutoCompletePlaces(props) {
  const flexDirection = FlexDirectionStyle();
  const [modalVisible, setModalVisible] = useState(false);
  const styles = createStyles(props?.Theme, flexDirection)
  const SetCurrentLocation = props?.current == "from" ? props.setFromLocation : props.setToLocation
  const currentLocation = props?.current == "from" ? props.fromLocation : props.toLocation
  const isInitialMount = props?.current == "from" ? props.isFromInitialMount : props.isToInitialMount
  const SetInitialMount = props?.current == "from" ? props.setIsFromInitialMount : props.setIsToInitialMount



  const handleShowModal = (initSelectionMode) => {
    props.setSelectionMode(initSelectionMode)
    props.setIsFromInitialMount(true);
    props.setIsToInitialMount(true);
    setModalVisible(true);
  };


  const innerAutoComplete = () => {
    return <View
      style={[styles.autoCompletesInsideContainer]}
    >
      <View
        style={[styles.autoCompletesInside]}
      >
        <GooglePlacesAutocomplete
          fetchDetails={true}

          placeholder={props?.current == "from" ? props?.GeneralWords.from : props?.current == 'to' ? props?.GeneralWords.to : ''}
          onPress={(data, details = null) => {
            props.current == 'from' ?
              props.setFromLocation(props?.getPlaceWithoutCountry(data)) :
              props.setToLocation(props?.getPlaceWithoutCountry(data))

            // props?.setLocation(props?.getPlaceWithoutCountry(data));
            const location = details?.geometry?.location;
            if (location) {
              props?.centerMap(location.lat, location.lng)
              props?.setCoords({
                latitude: location.lat,
                longitude: location.lng,
              });
              if (!props?.Coords) {
                props?.setSelectionMode('from')
              }
              else {
                props?.setSelectionMode('none');
              }
            } else {
              props?.setCoords(null);
            }
            setModalVisible(false)
          }}
          // renderRow={renderOption}
          query={{
            key: props?.GoogleMapsApiKey,
            language: props?.CurrentLanguage == 'heb' ? 'iw' : 'en',
            components: 'country:il',
            type: 'geocode'

          }}
          textInputProps={{
            value: currentLocation,

            onChangeText: (text) => {
              isInitialMount ? SetInitialMount(false) :
                (SetCurrentLocation(text), props?.setCoords(null))
            },
            placeholderTextColor: props?.Theme.colors.input.placeholder,
            style: [styles.input, { color: props?.Theme.colors.input.text, backgroundColor: props?.Theme.colors.input.border, }]
          }}
          styles={{
            textInputContainer: {
              backgroundColor: props?.Theme?.colors?.background, // Set the background color of the TextInput container to transparent
            },

            description: {
              color: '#000', // Set the text color of the dropdown items
            },
            listView: {
              width: width,
            }
          }}
        />

        <TouchableOpacity onPress={() => setModalVisible(false)}>
          <Icon style={{ margin: 15 }} name='times' size={25} color={props?.Theme?.colors?.text?.primary || "white"} />
        </TouchableOpacity>
      </View>
    </View>
  }

  const addRidePageContent = () => {
    return <View
      style={[styles.input, { color: props?.Theme.colors.input.text,  borderColor: props?.selectionMode == props?.current ? 'yellow' : (props.current=='from' && props.fromLocation)|| (props.current=='to' && props.toLocation)?props?.Theme?.colors?.background: props?.Theme?.colors?.input?.text, borderWidth: 2 }]}

    >

      <TouchableOpacity onPress={() => handleShowModal(props?.current || 'from')}>
        <Button
          style={[styles.btn,]}
        >
          <Text style={{ color: currentLocation ? props?.Theme?.colors?.input?.text : props?.Theme.colors.input.placeholder }}>{currentLocation ? currentLocation : props?.current == 'from' ? props?.GeneralWords.from : props?.current == 'to' ? props?.GeneralWords.to : ''}</Text>
        </Button>
      </TouchableOpacity>
      {currentLocation && (
        <TouchableOpacity style={styles.removeLocationTouchable} onPress={props?.handleRemove}>
          <Icon style={styles.removeLocation} name='times' size={25} />
          {/* <Text >x</Text> */}
        </TouchableOpacity>
      )}
    </View>
  }
  return (
    <View style={styles.container}>
      {addRidePageContent()}
      
      {(props?.current == 'from' || props?.current == 'to') && <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}

      >
        {innerAutoComplete()}

      </Modal>}

    </View >
  )
}
const createStyles = (
  Theme,
  Direction
) => {
  return StyleSheet.create({
    container: {
      flex: 1,

    },
    map: {
      flex: 1,
    },
    inputContainer: {
      position: 'absolute',
      top: 10,
      left: 10,
      right: 10,
    },
    input: {
      flex: 1,
      margin: 4,
      borderRadius: 8,
      justifyContent: 'center',

    },
    btn: {
      width: '100%',
      height: 50,
      borderRadius: 8,
      alignItems: Direction.alignItems,
      justifyContent: 'center',
      // backgroundColor:'red'
      backgroundColor: Theme?.colors?.input?.border
    }
    ,
    confirmBtn: {
      margin: 4,
      borderRadius: 8,
      color: 'black',

    }, headerContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: Theme.colors.input.border, // Replace this with your desired color
    },
    header: {
      flexDirection: 'row',
      marginVertical: 7
    },

    firstHeaderPart: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'space-around',
    },
    secondHeaderPart: {
      flex: 5,
      // backgroundColor: 'blue'
    },
    thirdHeaderPart: {
      alignItems: 'center',
      justifyContent: 'space-around',
      flex: 1,
    },
    removeLocation: {
      color: Theme?.colors?.text?.primary || 'white',
    },
    removeLocationTouchable: {
      position: 'absolute',
      right: Direction.isLangaugeRTL ? 0 : null,
      padding: 5,
      // top: 15

    },

    container: {
      flex: 1,

    },

    autoCompletesInsideContainer: {
      flex: 1,
      backgroundColor: Theme?.colors?.background,


    }, autoCompletesInside: {
      flexDirection: 'row',
      flex: 1,
      margin: 10,

    }




  });
};