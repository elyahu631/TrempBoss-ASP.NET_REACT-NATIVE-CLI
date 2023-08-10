import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, Image, Dimensions, ScrollView, Alert } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { ThemeContext } from '../../styles/Themes/ThemeContext';
import { userContext } from '../../context/UserContext';
import FlexDirectionStyle from '../../styles/FlexDirection';
import { TranslationContext } from '../../styles/Languages/Languages';
import { rideContext } from '../../context/RidesContext';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { GoogleMapsApiKey } from '@env';
import { formatAddressWithoutCountry, formatDateTime, formatHourTime } from '../../comp/FormatFunctions';
import SliderRange from '../../comp/SliderRange';


export default function RideDetails({ route }) {
    const { userLoggedIn, getUserById, isDriver, setIsDriver } = useContext(userContext);
    const { LanguageWords } = useContext(TranslationContext);
    const { joinRide } = useContext(rideContext);
    const { ride } = route.params;
    const { theme } = useContext(ThemeContext);
    const styles = createStyles(theme.colors, FlexDirectionStyle());
    console.log(FlexDirectionStyle());
    const generalWords = LanguageWords().general
    const addRideWords = LanguageWords().addRide
    const isRide = ride?.tremp_type == 'driver'
    // const [seatsAmount, setSeatsAmount] = useState(1)


    const getCoordinatesFromLocationName = async (locationName) => {
        try {
            const encodedLocationName = encodeURIComponent(locationName);
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${locationName}&key=${GoogleMapsApiKey}`
            );

            if (response.ok) {
                const data = await response.json();
                const { results } = data;
                if (results.length > 0) {
                    const { geometry } = results[0];
                    const { location } = geometry;

                    return { latitude: location.lat, longitude: location.lng };
                } else {
                    // If no results found for the location name
                    return null;
                }
            } else {
                // If the response is not ok (e.g., 404 or 500 error)
                return null;
            }
        } catch (error) {
            console.error('Error fetching coordinates:', error);
            return null;
        }
    };
    const [fromCoords, setFromCoords] = useState(null)
    const [toCoords, setToCoords] = useState(null)

    // const fromCoords = getCoordinatesFromLocationName(ride?.from_route);
    // const toCoords = getCoordinatesFromLocationName(ride?.to_route);
    const navigation = useNavigation();

    const updateCoords = async () => {
        const fromCoords = await getCoordinatesFromLocationName(ride?.from_route);
        const toCoords = await getCoordinatesFromLocationName(ride?.to_route);
        setFromCoords(fromCoords)
        setToCoords(toCoords)
    }
 
    useEffect(() => {
        updateCoords();



    }, [])

    const sendJoinRequest = async (tremp_id, user_id) => {

        try {
            const result = await joinRide(tremp_id, user_id, userLoggedIn.token)
            if (result.status) {

                navigation.navigate(generalWords['home'])
            }
            else {
                Alert.alert('הודעה', "שגיאה בשליחת הבקשה")
            }
        } catch (error) {
            console.log("Error sending join request");
        }
    }





    return (
        <ScrollView style={styles.container}>

            <View >
                {/* <Text style={{ color: 'red' }}>{JSON.stringify(ride)}</Text> */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Text style={{ textAlign: 'center', color:isRide? theme?.colors?.driver:theme?.colors?.hitchhiker }}>
                            {isRide ? generalWords?.driver : generalWords?.hitchhiker}
                        </Text>
                        <View style={styles.creatorInfoContainer}>
                            <View style={{ gap: 10 }}>

                                <Text style={styles.creatorName}>
                                    {ride?.creator?.first_name || 'first name'}

                                </Text>
                                {/* <Text style={styles.creatorName}>

                                    {ride?.creator?.last_name || "last name"}
                                </Text> */}

                                <Image
                                    source={{
                                        uri:
                                            ride?.creator?.image_URL ||
                                            "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
                                    }}
                                    style={styles.image}
                                />

                            </View>


                            <View style={styles.routeInfoContainer}>

                                <View style={styles.titleAndInfo}>

                                    <Text style={styles.title}>
                                        {generalWords?.from}
                                    </Text>
                                    <Text style={styles.info}>
                                        {formatAddressWithoutCountry(ride?.from_route)}
                                    </Text>
                                    <Text style={styles.title}>
                                        {generalWords?.to}
                                    </Text>
                                    <Text style={styles.info}>
                                        {formatAddressWithoutCountry(ride?.to_route)}
                                    </Text>
                                </View>
                                <View style={styles.titleAndInfo}>

                                    <Text style={styles.title}>
                                        {generalWords?.rideTime}</Text>
                                    <Text style={styles.info}>
                                        {formatDateTime(ride.tremp_time)}
                                    </Text>
                                    <Text style={styles.info}>
                                        {formatHourTime(ride.tremp_time)}
                                    </Text>
                                </View>
                                <View style={styles.titleAndInfo}>

                                    {ride?.tremp_type == 'driver' ? <Text style={styles.title}>
                                        {generalWords?.seatsJoined}: {ride?.hitchhikers_count}/{ride?.seats_amount}
                                    </Text>
                                        :
                                        <Text style={styles.title}>
                                            {generalWords?.seats}:{ride?.seats_amount}

                                        </Text>

                                    }
                                    {/* {ride?.tremp_type == 'driver' ? <Text style={styles.title}>
                                        {generalWords?.seats}: {ride?.hitchhikers_count}/{ride?.seats_amount}
                                    </Text> : <Text style={styles.title}>
                                        {ride?.seats_amount}
                                    </Text>} */}
                                </View>

                            </View>

                        </View>
                        <View style={styles.routeInfoContainer}>

                        </View>


                        {/* {ride?.tremp_type === "driver" && <SliderRange MaxValue={ride?.seats_amount - ride?.hitchhikers_count } MinValue={1} SetSeatsAmount={setSeatsAmount} SeatsAmount={seatsAmount} IsDriver={isDriver} Theme={theme} PageWords={addRideWords} />} */}

                        {/* sendJoinRequest */}
                        <Button onPress={() => { sendJoinRequest(ride?.tremp_id, userLoggedIn?.user?.user_id) }} buttonColor={isRide?theme?.colors?.hitchhiker:theme?.colors?.driver} mode="contained">{ride?.tremp_type == 'driver' ? addRideWords?.IsHitchhikerTitle : addRideWords?.IsDriverTitle} </Button>




                        {/* <View style={styles.container}>
                        <MapView
                            style={styles.map}
                            initialRegion={{
                                latitude: 37.7749, // Replace with a latitude value for the center of your map
                                longitude: 122.4194, // Replace with a longitude value for the center of your map
                                latitudeDelta: 0.0922, // Replace with a positive value for the latitude delta
                                longitudeDelta: 0.0421, // Replace with a positive value for the longitude delta
                            }}
                        >
                            <Marker coordinate={{ latitude: 37.7749, longitude: -122.4194 }} title="From Marker" />
                            <Marker coordinate={{ latitude: 37.7897, longitude: -122.4205 }} title="To Marker" />
                        </MapView>
                    </View> */}

                    </Card.Content>
                </Card>
            </View>
            <View style={{ flex: 1 }}>
                {fromCoords && toCoords && <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: (fromCoords?.latitude + toCoords?.latitude) / 2,
                        longitude: (fromCoords?.longitude + toCoords?.longitude) / 2,
                        latitudeDelta: Math.abs(fromCoords?.latitude - toCoords?.latitude) * 2,
                        longitudeDelta: Math.abs(fromCoords?.longitude - toCoords?.longitude) * 2,
                    }}
                >
                    <Marker coordinate={fromCoords} title="From Marker" />
                    <Marker coordinate={toCoords} title="To Marker" />
                </MapView>}
                {/* <Text> {JSON.stringify(fromCoords)}</Text>
                <Text> {JSON.stringify(toCoords)}</Text> */}
            </View>
        </ScrollView>

    );
}

const createStyles = (colors, directions) =>
    StyleSheet.create({
        container: {
            flex: 1,
            padding: 16,
            backgroundColor: colors.background,
        },
        card: {
            marginBottom: 16,
            backgroundColor: colors.secondary,
        },
        creatorInfoContainer: {
            justifyContent: 'space-around',
            flexDirection: "row",
            marginBottom: 16,
        },
        creatorName: {
            color: colors.text.primary,
            textAlign: 'center',
        },
        title: {
            color: colors.text.secondary,

        },
        image: {
            width: 100,
            height: 100,
            borderRadius: 100,
        },
        routeInfoContainer: { alignItems: directions.alignItems },
        info: {

            color: colors.text.primary,
            marginBottom: 5,
        },

        titleAndInfo: {
            marginBottom: 5,
            alignItems: directions.alignItems

        },
        noteText: {
            color: colors.text.secondary,
            marginVertical: 4,
        },
        seatsText: {
            color: colors.text.secondary,
            marginVertical: 8,
        },
        map: {
            flex: 1,
            height: Dimensions.get('window').height * 0.3,
        },
    });