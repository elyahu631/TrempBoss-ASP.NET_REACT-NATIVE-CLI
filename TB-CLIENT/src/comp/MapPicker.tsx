import React, { useState, useRef, useCallback, useEffect } from 'react';
import MapView, { Marker, LatLng, Region } from 'react-native-maps';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Modal, PermissionsAndroid, Alert, TextStyle } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Geolocation from 'react-native-geolocation-service';
import { Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import AutoCompletePlaces from './AutoCompletePlaces';
import FlexDirectionStyle, { DirectionsType } from '../styles/FlexDirection';
import { TouchableWithoutFeedback } from 'react-native';

interface MapPickerProps {
  PageWords: any;
  GoogleMapsApiKey: string;
  Theme: any;
  setFromLocation: React.Dispatch<React.SetStateAction<string>>;
  setToLocation: React.Dispatch<React.SetStateAction<string>>;
  setFromCoords: (coords: LatLng | null) => void;
  setToCoords: (coords: LatLng | null) => void;
  fromLocation: string,
  toLocation: string,
  fromCoords: LatLng | null,
  toCoords: LatLng | null,
  CurrentLanguage: string,
  GeneralWords: any,
  Inputstyles: TextStyle
}

const MapPicker: React.FC<MapPickerProps> = ({ Inputstyles, CurrentLanguage, fromLocation, fromCoords, toLocation, toCoords, setFromLocation, setFromCoords, setToLocation, setToCoords, PageWords, GeneralWords, GoogleMapsApiKey, Theme }) => {

  const [isFromInitialMount, setIsFromInitialMount] = useState(true);
  const [isToInitialMount, setIsToInitialMount] = useState(true);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 32.084816159432734, //if location not allowed
    longitude: 34.78151723742485,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [selectionMode, setSelectionMode] = useState<'from' | 'to' | 'none'>('from');


  const mapRef = useRef<MapView | null>(null);


  const [modalVisible, setModalVisible] = useState(false);
  const directions = FlexDirectionStyle();

  const styles = createStyles(Theme, Inputstyles, fromLocation, toLocation, directions)

  const handleShowModal = useCallback((initSelectionMode: "from" | "to" | "none") => {
    setSelectionMode(initSelectionMode)
    // Set the initial mount states to true when the modal is shown
    setIsFromInitialMount(true);
    setIsToInitialMount(true);
    setModalVisible(true);
  }, []);



  const requestLocationPermission = async () => {
    console.log("nowwwasks");

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        // {
        //   title: 'הרשאת מיקום',
        //   message: 'מיקום הכרחי למרכוז המפה',
        //   buttonPositive: 'אוקי',
        //   buttonNegative: 'בטל',
        // }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Location permission granted');
        // Get the current device location after permission is granted
        Geolocation.getCurrentPosition(
          (position) => {
            const currentLatitude = position.coords.latitude;
            const currentLongitude = position.coords.longitude;
            // Set the mapRegion to center on the current location
            setMapRegion({
              latitude: currentLatitude,
              longitude: currentLongitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            });
          },
          (error) => console.log('Error getting current location:', error),

        );
      } else {
        console.log('Location permission denied');
      }
    } catch (err) {
      console.warn('Location permission request error:', err);
    }
  };

  const centerMap = (latitude: number | undefined, longitude: number | undefined) => {
    if (!latitude || !longitude) return;
    if (mapRef?.current) {
      mapRef?.current.animateToRegion({
        latitude: latitude,
        longitude: longitude,
        latitudeDelta: 0.1922,
        longitudeDelta: 0.0421,
      });
    }
  }


  const handleMapPress = async (event: any) => {
    const { coordinate } = event.nativeEvent;
    let url = "";
    if (selectionMode === 'from' || selectionMode === 'to') {
      selectionMode === 'from' ? setFromCoords(coordinate) : setToCoords(coordinate);
      console.log(coordinate);
      centerMap(coordinate.latitude, coordinate.longitude)
      setSelectionMode(selectionMode === 'from' && !toLocation ? 'to' : selectionMode === 'to' && !fromLocation ? 'from' : 'none');
      try {
        url = CurrentLanguage == 'heb' ? `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinate.latitude},${coordinate.longitude}&key=${GoogleMapsApiKey}&language=he` :
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinate.latitude},${coordinate.longitude}&key=${GoogleMapsApiKey}`
        const response = await fetch(
          url
        );
        const data = await response.json();
        console.log("data");
        console.log(data);



        if (data?.results?.length && data?.results?.length > 0) {
          // console.log(data?.results);
          console.log("lat lng");

          console.log(data.results[0]);

          // const address = data.results[0]?.types == "plus_code" ? data.results[0]?.address_components[1]?.long_name +" zzzz" || "" : data.results[0].formatted_address;
          let formattedAdress = data.results[0].formatted_address
          const commaIndex = formattedAdress.lastIndexOf(',');
          if (data.results[0]?.types == "plus_code") {
            formattedAdress = data.results[0]?.address_components[1]?.long_name
          }
          else {
            // formattedAdress = data.results[0].formatted_address.substring(0, commaIndex).trim();
            formattedAdress = data.results[0].formatted_address.trim();


          }

          // Extract the address before the comma (excluding the comma itself)


          selectionMode === 'from' ? setFromLocation(formattedAdress) : setToLocation(formattedAdress);
        }
      } catch (error) {
        Alert.alert("No internet connection, Please try again.")


        console.log('Error fetching place details:', error);
      }
    }
  }

  const handleRemoveFrom = useCallback(() => {
    setFromCoords(null);
    setFromLocation('');
    setSelectionMode('from');
  }, []);

  const handleRemoveTo = useCallback(() => {
    setToCoords(null);
    setToLocation('');
    setSelectionMode('to');

  }, []);

  const handleConfirmLocations = useCallback(() => {
    if (fromCoords && toCoords && fromLocation && toLocation) {
      setModalVisible(false);
    } else {
      Alert.alert(
        'Confirm locations',
        `Are you sure you want to go back without the ${(!fromLocation || !fromCoords) && 'from' || ""}${(!toLocation || !toCoords) && 'to' || ""} location ?`,
        [
          {
            text: 'No',
            style: 'cancel',
          },
          {
            text: 'Yes',
            onPress: () => {
              if (!fromLocation || !fromCoords) {
                setFromLocation('');
                setFromCoords(null);
              }
              if (!toLocation || !toCoords) {
                setToLocation('');
                setToCoords(null);
              }
              setModalVisible(false);
            },
          },
        ],
        { cancelable: false }
      );

    }
  }, [fromCoords, toCoords, fromLocation, toLocation]);

  useEffect(() => {
    requestLocationPermission();
  }, [])



  const getPlaceWithoutCountry = (address: any) => {
    const commaIndex = address.description.lastIndexOf(',');
    console.log(commaIndex);

    // Extract the address before the last comma (excluding the comma itself)
    // const addressWithoutCountry = commaIndex != -1 ? address.description.substring(0, commaIndex).trim() : address.description;
    const addressWithoutCountry = commaIndex != -1 ? address.description.trim() : address.description;
    return addressWithoutCountry
  }

  const swapLocations = () => {
    const tempFromLocation = fromLocation;
    setFromLocation(toLocation);
    setToLocation(tempFromLocation);

    const tempFromCoords = fromCoords;
    setFromCoords(toCoords);
    setToCoords(tempFromCoords);
  };
  return (
    <View >
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}

      >


        <View style={styles.container}>

          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={mapRegion}
            onPress={handleMapPress}           >
            {fromCoords && <Marker coordinate={fromCoords} pinColor='green' />}
            {toCoords && <Marker coordinate={toCoords} />}
          </MapView>

          <View style={styles.headerContainer}>


            <View style={styles.header}>
              {/* handleConfirmLocations */}
              <View style={styles.firstHeaderPart}>
                {/* <Icon style={{}} name='check' size={20} color={'green' || Theme?.colors?.text?.primary || "white"} /> */}

                <TouchableOpacity onPress={() => { centerMap(fromCoords?.latitude, fromCoords?.longitude) }}>

                  <Icon style={{}} name='location-arrow' size={20} color={Theme?.colors?.text?.primary || "white"} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { centerMap(toCoords?.latitude, toCoords?.longitude) }}>

                  <Icon style={{}} name='map-marker' size={20} color={Theme?.colors?.text?.primary || "white"} />
                </TouchableOpacity>



              </View>
              <View style={styles.secondHeaderPart}>


                <TouchableWithoutFeedback style={styles.autoCompletes} >
                  {/* <Icon style={{}} name='location-arrow' size={20} color={Theme?.colors?.text?.primary || "white"} /> */}
                  <AutoCompletePlaces
                    current='from'
                    GeneralWords={GeneralWords}
                    setFromLocation={setFromLocation}
                    setToLocation={setToLocation}
                    getPlaceWithoutCountry={getPlaceWithoutCountry}
                    centerMap={centerMap}
                    setCoords={setFromCoords}
                    fromCoords={fromCoords}
                    toCoords={toCoords}
                    selectionMode={selectionMode}
                    setSelectionMode={setSelectionMode}
                    GoogleMapsApiKey={GoogleMapsApiKey}
                    CurrentLanguage={CurrentLanguage}
                    isInitialMount={isFromInitialMount}
                    setIsToInitialMount={setIsToInitialMount}
                    setIsFromInitialMount={setIsFromInitialMount}
                    isFromInitialMount={isFromInitialMount}
                    isToInitialMount={isToInitialMount}
                    fromLocation={fromLocation}
                    toLocation={toLocation}
                    Theme={Theme}
                    handleRemove={handleRemoveFrom}
                    directions={directions}
                  />
                </TouchableWithoutFeedback>

                <TouchableWithoutFeedback style={styles.autoCompletes} >


                  <AutoCompletePlaces
                    current='to'
                    GeneralWords={GeneralWords}
                    setFromLocation={setFromLocation}
                    setToLocation={setToLocation}
                    getPlaceWithoutCountry={getPlaceWithoutCountry}
                    centerMap={centerMap}
                    setCoords={setToCoords}
                    fromCoords={fromCoords}
                    toCoords={toCoords}
                    selectionMode={selectionMode}
                    setSelectionMode={setSelectionMode}
                    GoogleMapsApiKey={GoogleMapsApiKey}
                    CurrentLanguage={CurrentLanguage}
                    isInitialMount={isToInitialMount}
                    setIsToInitialMount={setIsToInitialMount}
                    setIsFromInitialMount={setIsFromInitialMount}
                    isFromInitialMount={isFromInitialMount}
                    isToInitialMount={isToInitialMount}
                    fromLocation={fromLocation}
                    toLocation={toLocation}
                    Theme={Theme}
                    handleRemove={handleRemoveTo}
                    directions={directions}

                  />

                </TouchableWithoutFeedback>


              </View>
              <View style={styles.thirdHeaderPart}>
                <TouchableOpacity onPress={() => { swapLocations() }}>
                  <Icon style={{ transform: [{ rotate: '90deg' }] }} name='exchange' size={20} color={Theme?.colors?.text?.primary || "white"} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleConfirmLocations()}>
                  <Icon style={{}} name='check' size={20} color={'green' || Theme?.colors?.text?.primary || "white"} />
                </TouchableOpacity>
              </View>
            </View>




          </View>
        </View>
      </Modal >
      <TouchableOpacity onPress={() => handleShowModal("from")}
        style={[styles.input,]}
      >
        {/* <TextInput
            maxLength={2}
            style={[styles.btn, { backgroundColor: Theme?.colors?.input?.border }]}
            // label='מקומות פנויים'
          /> */}

        <Text style={[styles.outModalInputs, { color: fromLocation ? Theme?.colors?.input?.text : Theme.colors.input.placeholder, }]}>{fromLocation || PageWords['pickOriginLocation']}</Text>

      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleShowModal("to")}
        style={[styles.input,]}
      >
        <Text style={[styles.outModalInputs, { color: toLocation ? Theme?.colors?.input?.text : Theme.colors.input.placeholder }]}>{toLocation || PageWords['pickDestinationLocation']}</Text>
      </TouchableOpacity>
    </View >
  );
};







const createStyles = (
  Theme: any,
  Inputstyles: TextStyle,
  fromLocation: string,
  toLocation: string,
  directions: DirectionsType

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
      color: 'red',
      alignItems: 'flex-end',
      textAlign: 'right',
      ...Inputstyles
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
    // removeLocation: {
    //   color: Theme?.colors?.text?.primary || 'white',
    // },
    // removeLocationTouchable: {
    //   position: 'absolute',
    //   right: 15,

    // },
    autoCompletes: {

    },
    outModalInputs: {
      fontSize: Inputstyles.fontSize, alignSelf: directions?.alignItems
    }





  });
};


export default MapPicker;
