

import { View, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, Dimensions } from 'react-native';
import React, { useContext, useState, useEffect } from 'react';
import { Text, TextInput, Button, Card } from 'react-native-paper';
import { userContext } from '../../context/UserContext';
import { rideContext } from '../../context/RidesContext';
import noPhoto from '../../asserts/images/noPhoto.png';
import { formatDateTime, formatHourTime, formatAddressWithoutCountry } from '../../comp/FormatFunctions';

const { width } = Dimensions.get('window');
const imageSize = width * 0.2;

export default function ApprovedRideDetails({ route }) {
    // usersRideRequests, tremp_id, creator_id,
    const { Ride, Theme, LanguageWords, CurrentLanguage, } = route.params;
    const { tremp_id, create_date, from_route, to_route, seats_amount, tremp_time, tremp_type, driver, hitchhikers } = Ride;
    console.log("routerouterouterouterouterouterouterouterouterouteroute");
    console.log(Ride);
    console.log(driver);

    const [isInAction, setIsInAction] = useState(false);

    const styles = createStyles(
        Theme.colors.primary,
        Theme.colors.secondary,
        Theme.colors.text,
        Theme.colors.background,

    );
    const {  DeleteRide } = useContext(rideContext);
    const { userLoggedIn, UpdateLoggedInUser, UpdateLoggedInUserImage } = useContext(userContext);

    const handleDeleteRide = async (rideInfo) => {

        if (isInAction) {
            return;
        }
        setIsInAction(true);
        const deleteJson = { tremp_id: rideInfo.tremp_id, user_id: userLoggedIn.user._id }
        try {
            let result = await DeleteRide(deleteJson, userLoggedIn.token)

            userMessage = result?.status ? "בוצע בהצלחה" : JSON.stringify(result?.Message || "נסה שוב מאוחר יותר.")


        } catch (error) {
            console.log(error);

        }
        finally {
            setIsInAction(false);
            console.log("finally");

        }
        // Alert.alert(userMessage);

    }

    return (



        <View style={styles.container}>
            <Card style={styles.rideCard} title="Ride Details">
                <Card.Content >

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>

                        <View>

                            <Text style={styles.cardText}>{LanguageWords?.general?.rideTime}</Text>
                            <Text style={styles.cardText}>
                                {formatDateTime(tremp_time)}
                            </Text>
                            <Text style={styles.cardText}>
                                {formatHourTime(tremp_time)}
                            </Text>
                        </View>
                        <View>
                            <Text style={styles.cardText}>{LanguageWords?.general?.route} </Text>
                            <Text style={styles.cardText}>{formatAddressWithoutCountry(from_route)} </Text>
                            <Text style={styles.cardText}>{formatAddressWithoutCountry(to_route)} </Text>
                        </View>
                        <View style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={styles.cardText}>{LanguageWords?.general?.seats} {seats_amount} </Text>
                            <TouchableOpacity onPress={(data) => handleDeleteRide(Ride)} style={styles.saveButton}>
                                <Text style={styles.cardText}>מחק</Text>
                            </TouchableOpacity>
                        </View>
                        {/* <Text style={styles.cardText}>{tremp_type} </Text> */}
                    </View>
                </Card.Content>

            </Card>
            <ScrollView style={{ marginBottom: 120 }}>
                {/* <Text style={{ color: 'white' }}>{JSON.stringify(Ride)}</Text> */}
                <Text style={styles.cardText}>{"נהג:"}</Text>
                <Text style={styles.cardText}>{driver?.first_name} {driver?.last_name}</Text>
                <Text style={styles.cardText}>{"מצטרפים:"}</Text>
                {hitchhikers.map((hitchhiker, index) => (
                    <Text key={index} style={styles.cardText}>{hitchhiker?.first_name} {hitchhiker?.last_name}</Text>
                ))}



            </ScrollView>
        </View>
    );
}

const createStyles = (primary, secondary, text, background) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: background,
            padding: 16,
        },
        rideCard: {
            backgroundColor: background,
            borderWidth: 2,
            borderColor: text.primary
        },
        cardText: {
            color: text.primary
        },

  




    });
