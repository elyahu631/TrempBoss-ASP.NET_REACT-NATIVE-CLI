import React, { createContext, useEffect, useState } from 'react';
export const userContext = createContext();
import { BACKAPI } from '@env';

export const UserContextProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userLoggedInId, setUserLoggedInId] = useState('');
  const [userLoggedIn, setUserLoggedIn] = useState(null);
  const [isDriver, setIsDriver] = useState(false);
  const contextRoute = 'api/users'



  const GetUserName = (creatorId) => {
    try {
      if (!userLoggedIn) return "אין משתמש מחובר"
      return userLoggedIn.first_name + userLoggedIn.last_name ? userLoggedIn.first_name + " " + userLoggedIn.last_name : "אין שם ";
    } catch (error) {
      return "אין שם"
    }
  };
  const GetUserLoggedIn = () => {
    try {
      return userLoggedIn || " לא נמצא";
    } catch (error) {
      return "יוזר לא נמצא"
    }
  };
  const loginUser = async (userData) => {
    try {
      const response = await fetch(`${BACKAPI}${contextRoute}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      let json = await response.json();
      if (json?.status) {
        setUserLoggedInId(json.data.user.user_id)
        setUserLoggedIn(json.data);
        setIsLoggedIn(true);
      }
      return json;

    } catch (error) {

      // console.error('שגיאה בהוספת משתמש', error);
      return { error: { message: "שגיאה ,בדוק חיבור תקין לאינטרנט או נסה מאוחר יותר." } };
    }
  };


  const UpdateLoggedInUser = async (updateDetailsJson) => {
    console.log("UpdateLoggedInUserUpdateLoggedInUserUpdateLoggedInUser");
    console.log(updateDetailsJson);
    try {
      const response = await fetch(`${BACKAPI}${contextRoute}/update/${userLoggedIn?.user?.user_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer \n' + userLoggedIn.token

        },
        body: JSON.stringify(updateDetailsJson)
      });
      console.log("await response.json()await response.json()");
      console.log(response);
      if (response.ok) {

        setUserLoggedIn(prev => ({//copy the past and override the changes.
          ...prev,
          user: {
            ...prev.user,
            ...updateDetailsJson
          }
        }));
        return { message: 'Profile updated successfully' ,status:true}

      } else {// When request is failed.
        const responseJson = await response.json()
        return { error: { message: responseJson } }


      }
    } catch (error) {// When had error calling the request.
      return { error: { message: error } }
    }
  };



  const UpdateLoggedInUserImage = async (imageData) => {


    if (!imageData) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageData.assets[0].uri,
        type: imageData.assets[0].type,
        name: imageData.assets[0].fileName,
      });

      const response = await fetch(`${BACKAPI}${contextRoute}/update-image/${userLoggedIn.user.user_id}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.ok) {
        // Image uploaded successfully
        const result = await response.json();
        console.log("result?.data?.imageUrlresult?.data?.imageUrlresult?.data?.imageUrl");
        console.log(result);
        setUserLoggedIn(prev => ({//copy the past and override the changes.
          ...prev,
          user: {
            ...prev.user,
            image_URL: result?.data?.imageUrl
          }
        }));


        return result;
      } else {
        // Handle server error
        return { error: 'Image upload failed' };
      }
    } catch (error) {
      // Handle network or other errors
      return { error: 'Error occurred during image upload:', error };

    }
  };

  const AddUser = async (userData) => {
    console.log(userData);
    try {
      const response = await fetch(`${BACKAPI}${contextRoute}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        // await fetchUsers();
        return await response.json();
      } else {
        const errorResponse = await response.json();
        return errorResponse;
      }
    } catch (error) {
      return error;
    }
  };


  const getUserById = async (id) => {
    try {
      const response = await fetch(`${BACKAPI}${contextRoute}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer \n' + userLoggedIn.token

        },
      });
      if (response.ok) {
        let json = await response.json();
        // await fetchUsers();
        // console.log(json);
        return json;
      } else {
        const errorResponse = await response.json();
        console.error(errorResponse)

        // console.error(errorResponse);
        return errorResponse.error;
      }
    } catch (error) {
      console.log(error)

      // console.error('שגיאה בהוספת משתמש', error);
      return error;
    }
  };











  const setUserToken = async (token) => {
    try {
      const response = await fetch(`${BACKAPI}${contextRoute}/updateToken/${userLoggedInId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: token.toString() })
      });
      if (response.ok) {
        await fetchUsers();
      } else {
        console.error(response);
        // Handle the case where the request was not successful
      }
    } catch (error) {
      console.error('שגיאה בהוספת משתמש', error);
    }
  };



  return (
    <userContext.Provider value={{ UpdateLoggedInUserImage, loginUser, isLoggedIn, setIsLoggedIn, setUserLoggedInId, userLoggedInId, setUserToken, GetUserName, GetUserLoggedIn, AddUser, userLoggedIn, UpdateLoggedInUser, getUserById, isDriver, setIsDriver, setUserLoggedIn }}>
      {children}
    </userContext.Provider>
  );
};
