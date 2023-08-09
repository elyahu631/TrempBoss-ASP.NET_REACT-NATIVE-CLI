import { View, Text, TouchableOpacity, StyleSheet, Image, TextStyle } from 'react-native'
import React, { useState, useContext } from 'react'
import { TranslationContext } from '../styles/Languages/Languages';


interface language {
    value: string,
    name: String,

}


export default function GenderDropDown({
    currentLanguage = useContext(TranslationContext).currentLanguage,
    genderDropDownValue = "",
    style = {},
    languagesOptions = [
        {
            "value": "",
            "name": ""
        }
    ],
    onSelect = (val: language) => { }
}) {

    const [showOptions, setShowOptions] = useState(false)
    const onSelectedItem = (val: language) => {
        setShowOptions(false);
        onSelect(val)


    }
    const styles = createStyles(

        style

    );
    return (
        <View style={styles.container}>
            <View style={{ marginBottom: 10 }}>
                <TouchableOpacity style={styles.input} onPress={() => setShowOptions(prev => !prev)}>
                    <Text style={[styles.text, { fontSize: 18 }]}>{genderDropDownValue ? genderDropDownValue : languagesOptions[0].name}</Text>
                </TouchableOpacity >

            </View>
            {showOptions && (<View style={{ justifyContent: 'center' }} >

                {languagesOptions.map((val: language, i: number) => {
                    const selectedValue = val.value;

                    return (
                        <TouchableOpacity style={styles.eachOption} onPress={() => onSelectedItem(val)} key={String(i)} >
                            {selectedValue == currentLanguage ? <Text style={{ alignSelf: 'center', color: 'green' }}>{val.name}</Text>
                                : <Text style={[styles.text,{ alignSelf: 'center' }]}>{val.name}</Text>
                            }
                        </TouchableOpacity>
                    )
                })}
            </View>)}
        </View>
    )
}
const createStyles = (style: TextStyle) =>
    StyleSheet.create({
        container: {
            flex: 1

        },
        // earth: {
        //      height: 25, width: 25,
        // },
        eachOption: {
            padding: 8,
            borderRadius: 12,
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            marginBottom: 8

        }, input: {
            justifyContent: 'flex-end',
            paddingHorizontal: 10,
            height: 40,
            color: 'red'

        }, text:
            style


    });