import { View, StyleSheet, TextStyle, useColorScheme, TouchableOpacity, Modal, FlexAlignType, Alert } from 'react-native'
import React, { useState, useContext } from 'react';
import { Text } from 'react-native-paper'
import { InputObject, TextObject } from '../../types/types'
import { TranslationContext } from '../../styles/Languages/Languages';
import languagesOptions from '../../styles/Languages/languageOptions.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CheckBox from '@react-native-community/checkbox';
import FlexDirectionStyle from '../../styles/FlexDirection';
import { TitleStyles, title } from '../../styleElements/StylesElements';


interface language {
    value: string,
    name: String,

}

export default function Settings(props: any) {
    const [isDialogVisible, setIsDialogVisible] = useState(false);
    const directions = FlexDirectionStyle();
    const alignItems: FlexAlignType = directions.alignItems;
    const { setLanguage, currentLanguage } = useContext(TranslationContext);
    const onSelect = (item: any) => {
        setLanguage(item.value)
        AsyncStorage.setItem('language', item.value);


    }


    const styles = createStyles(props.Theme.colors.primary, props.Theme.colors.secondary, props.Theme.colors.text, props.Theme.colors.background, props.Theme.colors.input, props.GeneralWords.align, isDialogVisible, title(props.isDriver, props.Theme))


    const onSelectedItem = async (val: language) => {
        if (val === props.CurrentLanguage) return;

        setIsDialogVisible(false);
        onSelect(val)
        // AsyncStorage.setItem('language', val.value);


    }
    return (
        <View style={styles.container}>
            {/* 1{props.LanguageWords.greeting} */}
            <Text style={styles.title}>{props?.PageWords?.title || "settings"}</Text>
            <View style={styles.language}>
                <TouchableOpacity
                    style={{
                        flex: 1,
                        alignItems: alignItems || 'flex-end',
                        borderWidth: 1,
                        paddingVertical: 10,
                        paddingHorizontal: 15, // Add horizontal padding
                        borderRadius: 5, // Add a small border radius

                    }}
                    onPress={() => setIsDialogVisible(true)}
                >
                    <Text style={styles.languageTitle}>{props.GeneralWords.CurrentLanguage || 'Language'}</Text>
                </TouchableOpacity>

                {/* <DropDown
                    onSelect={onSelect}
                    languagesOptions={languagesOptions} /> */}

            </View>
            <Modal
                visible={isDialogVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsDialogVisible(false)}
            >
                <View style={styles.modalContainer}>
                    {/* Content of the dialog */}
                    {/* You can add any components and styles you need for the dialog */}
                    <View style={styles.modalInner}>

                        <Text style={{ color: props.Theme.colors.text.primary, textAlign: directions.textAlign == 'left' ? 'right' : 'left', }}>{props.GeneralWords.CurrentLanguage}:</Text>




                        {languagesOptions.map((val: language, i: number) => {
                            const selectedValue = val.value;

                            return (
                                <View key={String(i)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <TouchableOpacity onPress={() => onSelectedItem(val)} key={String(i)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={{ color: selectedValue === currentLanguage ? 'green' : props.Theme.colors.text.primary }}>{val.name}</Text>
                                    </TouchableOpacity>
                                    <CheckBox value={selectedValue === currentLanguage} onValueChange={() => onSelectedItem(val)} />
                                </View>

                            )
                        })}
                        <View style={styles.hr} />
                        <TouchableOpacity onPress={() => setIsDialogVisible(false)} style={{ alignItems: 'center', marginVertical: 15 }}>
                            <Text style={{ color: props.Theme.colors.text.primary, fontSize: 16 }}>Cancel</Text>
                        </TouchableOpacity>

                    </View>

                </View>
            </Modal>
        </View>
    )
}





const createStyles = (
    primary: string,
    secondary: string,
    text: TextObject,
    background: string,
    input: InputObject,
    align: string,
    isModalVisible: boolean,
    title: TitleStyles
) => {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: background,
            paddingHorizontal: 15

        },
        text: {
            color: text.primary,
            textAlign: align as TextStyle['textAlign'],
        },
        languageTitle: {
            textAlign: 'center',
            color: text.primary,

        },
        title: title,


        language: {
            flexDirection: align === 'left' ? 'row' : 'row-reverse',

        },
        modalContainer: {
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,

        },
        modalInner: {
            width: '90%',
            padding: 20,
            borderRadius: 10,
            backgroundColor: secondary,
            shadowColor: 'black',
            shadowOpacity: 0.3,
            shadowRadius: 5,
            elevation: 5,
        },

        hr: {
            borderBottomColor: text.secondary,
            borderBottomWidth: 1,
        },
        circle: {
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: 1,
            justifyContent: 'center',
            alignItems: 'center',
        }
    });
};
