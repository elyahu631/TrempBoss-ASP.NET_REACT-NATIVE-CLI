import React, { createContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

export const rideContext = createContext();
import { BACKAPI } from '@env';


export const RidesContextProvider = ({ children }) => {
  const contextRoute = 'api/tremps'
  const [rides, setRides] = useState([]);
  useEffect(() => {
    return () => {
    }
  }, [])


  const addRide = async (newRide, token) => {
    try {
      const response = await fetch(`${BACKAPI}/${contextRoute}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer \n' + token

        },
        body: JSON.stringify(newRide)
      });

      const responseJson = await response.json()


      if (response.ok) {
        return await responseJson;
      } else {
        const errorResponse = responseJson;

        return { error: errorResponse }
      }
    } catch (error) {
      return { error: error };
    }
  }
  const userRides = async (token, filters) => {
    try {
      const response = await fetch(`${BACKAPI}/${contextRoute}/get-user-tremps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer \n' + token

        },
        body: JSON.stringify(filters)
      });
      const responseData = await response.json();

      return responseData;

    } catch (error) {
      return { status: false };
    }

  }
  const userApprovedRides = async (token, filters) => {
    try {
      const response = await fetch(`${BACKAPI}/${contextRoute}/approved-tremps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer \n' + token

        },
        body: JSON.stringify(filters)
      });
      const responseData = await response.json();

      return responseData;

    } catch (error) {
      return { status: false };
    }

  }

  const trempsByFilters = async (token, filters) => {
    try {
      const response = await fetch(`${BACKAPI}/${contextRoute}/tremps-by-filters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer \n' + token

        },
        body: JSON.stringify(filters)
      });
      if (response.ok) {
        const responseData = await response.json();

        return responseData;
      } else {

        const errorResponse = await response.json();
        return -9;
      }
    } catch (error) {
      Alert.alert("הודעה", 'שגיאה בשליפת נסיעות');
      return -8;
    }

  }

  const joinRide = async (tremp_id, user_id, token) => {

    try {
      const response = await fetch(`${BACKAPI}/${contextRoute}/join-ride`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer \n' + token

        },
        body: JSON.stringify({ tremp_id, user_id })
      });
      const responseJson = await response.json()
      console.log("responseJsonresponseJson2");
      console.log(responseJson);
      return responseJson

    } catch (error) {
      return { status: false, error: { message: 'שגיאה בהוספת בקשה' } };
    }
  }



  const UpdateApproveStatus = async (bodyInfoJson, token) => {

    try {
      const response = await fetch(`${BACKAPI}/${contextRoute}/approve-user-in-tremp`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer \n' + token

        },
        body: JSON.stringify(bodyInfoJson)
      });
      if (response.ok) {
        return await response?.json();
      } else {
        const errorResponse = await response.json();

        return errorResponse?.error?.message;
      }
    } catch (error) {
      return error?.message;
    }
  }

  const DeleteRide = async (bodyInfoJson, token) => {

    try {
      const response = await fetch(`${BACKAPI}/${contextRoute}/delete-tremp`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer \n' + token

        },
        body: JSON.stringify(bodyInfoJson)
      });
      return await response?.json();

    } catch (error) {
      return {error : {message :error?.message}};
    }
  }

  const GetUsersRequests = async (tremp_id, token) => {


    try {
      const response = await fetch(`${BACKAPI}/${contextRoute}/get-users-in-tremp/${tremp_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer \n' + token

        },
      });
      console.log(token);

      const resultjson = await response?.json()
      console.log("responseresponseresponseresponsessss323232");
      console.log(resultjson);
      console.log("responseresponseresponseresponsessss323232");

      if (response.ok) {
        return await response?.json();
      } else {
        const errorResponse = await response.json();

        return errorResponse?.error?.message;
      }
    } catch (error) {
      return error?.message;
    }
  }




  return (
    <rideContext.Provider value={{ rides, setRides, addRide, trempsByFilters, joinRide, userRides, UpdateApproveStatus, DeleteRide, GetUsersRequests ,userApprovedRides}}>
      {children}
    </rideContext.Provider>
  );
};
