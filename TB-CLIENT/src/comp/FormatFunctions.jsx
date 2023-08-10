import React, { useContext } from 'react';
import { TranslationContext } from '../styles/Languages/Languages';

export const formatDateTime = (dateTime) => {
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  let formattedDate;
  let formattedCurrentDate;
  const currentDate = new Date();
  const currentLanguage = useContext(TranslationContext)?.currentLanguage; 

  if (currentLanguage === 'heb') {
    formattedDate = new Date(dateTime).toLocaleString('he-IL', options);
    formattedCurrentDate = currentDate.toLocaleString('he-IL', options);
  } else {
    formattedDate = new Date(dateTime).toLocaleString('en-IE', options);
    formattedCurrentDate = currentDate.toLocaleString('en-IE', options);
  }

  if (formattedDate === formattedCurrentDate) return currentLanguage === 'heb' ? "היום" : "Today";
  return formattedDate;
};

export const formatHourTime = (dateTime) => {
  const options = { hour: '2-digit', minute: '2-digit' };
  let formattedTime;
  const currentLanguage = useContext(TranslationContext)?.currentLanguage; 

  if (currentLanguage === 'heb') {
    formattedTime = new Date(dateTime).toLocaleTimeString('he-IL', options);
  } else {
    formattedTime = new Date(dateTime).toLocaleTimeString('en-IE', options);
  }

  return formattedTime;
};

export const formatDateWeekday = (dateTime) => {
  const options = { weekday: 'long' };
  let formattedDate;
  const currentLanguage = useContext(TranslationContext)?.currentLanguage; 
  if (currentLanguage === 'heb') {
    formattedDate = new Date(dateTime).toLocaleString('he-IL', options);
  } else {
    formattedDate = new Date(dateTime).toLocaleString('en-IE', options);
  }
  const weekday = formattedDate.split(',')[0].trim();
  return weekday;
};

export const formatAddressWithoutCountry = (address) => {
  const countryName = address.indexOf("Israel") !== -1 ? "Israel" : address.indexOf("ישראל") !== -1 ? "ישראל" : null;
  if (!countryName) {
    return address;
  }
  const formattedAddress = address
    .replace(new RegExp(countryName, 'g'), '') // Replace all occurrences of the country name with an empty string
    .replace(/\s\s+/g, ' ') // Replace multiple spaces with a single space
    .trim("")
    .replace(/^,|,$/g, ''); // Trim leading and trailing commas; // Trim any leading or trailing spaces
  return formattedAddress || address;

};