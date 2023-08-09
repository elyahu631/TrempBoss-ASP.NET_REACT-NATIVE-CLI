import { View, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Button, Alert } from 'react-native'
import React, { useContext, useEffect, useState, useCallback } from 'react'
import { Text } from 'react-native-paper'
import { rideContext } from '../../context/RidesContext';
import { userContext } from '../../context/UserContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import SwipeableComp from '../../comp/SwipeableComp';
import { title } from '../../styleElements/StylesElements';
export default function ApprovedRides(props) {
    const { userLoggedIn, isDriver } = useContext(userContext);
    const [isLoading, setIsLoading] = useState(true); // New state variable
    const [isInAction, setIsInAction] = useState(false); // New state variable

    const [rides, setRides] = useState([]);
    const [filter, setFilter] = useState('');
    const navigation = useNavigation(); // Access the navigation prop
    const { userApprovedRides, DeleteRide } = useContext(rideContext);
    // Function to apply filter options


    useEffect(() => {
        getRides()
        filterRides()


    }, [isDriver])


    const styles = createStyles(
        props.Theme,
        props.LanguageWords.align,
        title(isDriver, props.Theme)

    );

    const getRides = async () => {
        setIsLoading(true);
        const fetchOptions = {
            user_id: userLoggedIn.user.user_id,
            tremp_type: isDriver ? 'driver' : 'hitchhiker',
        };

        try {
            const resultDriver = await userApprovedRides(userLoggedIn.token, fetchOptions);
            setRides(resultDriver?.data || []);
        } catch (error) {
            setRides([]);
        }

        setIsLoading(false);
    };



    const handleFilterChange = (text) => {
        setFilter(text);
    };

    const filterRides = () => {
        if (filter === '') {
            return rides;
        }
        let filteredRides = []
        filteredRides = rides.filter(
            (ride) =>
            (ride.from_route.toLowerCase().includes(filter.toLowerCase()) ||
                ride.to_route.toLowerCase().includes(filter.toLowerCase()))
        );
        return filteredRides;
    };

    const handleRightPress = (ride) => {

        navigation.navigate('approvedRideDetails', {
            Ride: ride,
            Theme: props.Theme,
            LanguageWords: props.LanguageWords,
            CurrentLanguage: props.CurrentLanguage

        });

        // Alert.alert('Right clicked')
    }
    const handleLeftPress = async (e) => {
        if (isInAction) {
            return;
        }
        setIsInAction(true);
        let userMessage = ""
        const deleteJson = { tremp_id: e, user_id: userLoggedIn.user.user_id }
        try {
            const result = await DeleteRide(deleteJson, userLoggedIn.token)
            console.log("resultresultresultresultresultresultresultresultresultresultresultresultresultresultresultresultresultresultresultresultresult");
            console.log(result);

            userMessage = result?.status ? "בוצע בהצלחה" : "1שגיאה במחיקה ,נסה שנית מאוחר יותר"

        } catch (error) {
            userMessage = "שגיאה במחיקה ,נסה שנית מאוחר יותר"

        }
        finally {

            setIsInAction(false);
        }
        Alert.alert(userMessage)

        getRides();

        // Alert.alert(JSON.stringify(result))
    }


    const rideComps = () => {
        if (rides.length === 0) {
            return null;
        }

        const filteredRides = filterRides();
        return (
            <>
                <View style={styles.cardContainer}>
                    {filteredRides.map((ride, index) => (
                        <SwipeableComp
                            userRides={true}
                            key={index}
                            ride={ride}
                            handleRightPress={handleRightPress}
                            handleLeftPress={handleLeftPress}
                            rightIcon={{ name: "info-circle", background: 'blue' }}
                            leftIcon={{ name: "trash", background: 'red' }}
                            Theme={props.Theme}
                            LanguageWords={props.LanguageWords.general}
                            CurrentLanguage={props.CurrentLanguage}
                            trempTypeRequest={isDriver ? 'driver' : 'hitchhiker'}
                        />
                    ))}
                </View>
            </>
        );
    };


    return (
        <View style={styles.container}>
            <ScrollView style={{ marginBottom: 60 }}>
                <View style={{ justifyContent: 'center' }}>

                    <View style={styles.pickerContainer}>
                        <Text style={styles.title}>{isDriver ? props.PageWords["approvedRides"] : props.PageWords["approvedTremps"]}</Text>

                    </View>

                </View>

                <TextInput
                    placeholderTextColor={props.Theme.colors.input.placeholder}
                    style={styles.input}
                    placeholder={props?.GeneralWords?.searchPlaceholder}
                    onChangeText={handleFilterChange}
                />
                {isLoading ? (
                    <ActivityIndicator size="large" color={isDriver ? props.Theme?.colors?.driver : props.Theme?.colors?.hitchhiker} />
                ) : (
                    <View style={styles.cardContainer}>{rideComps()}</View>
                )}
                <View style={{ marginBottom: 50 }} />
            </ScrollView>
        </View>
    );
}

const createStyles = (theme, align, title) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme?.colors?.background,
            padding: 15,
        },
        cardContainer: {
            gap: 10,
            marginTop: 15,
        },
        card: {
            width: '100%',
            backgroundColor: theme?.colors?.secondary,
            borderRadius: 8,
            padding: 10,
            marginBottom: 10,
            elevation: 2,
        },
        text: {
            color: theme?.colors?.text?.primary,
            textAlign: align,
        },
        input: {
            borderWidth: 1,
            borderColor: theme?.colors?.input?.border,
            padding: 10,
        },

        pickerContainer: {
            margin: 10,
            flex: 1
        },
        title: title,





    });
