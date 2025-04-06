import { View, Text, Button } from 'react-native'
import React from 'react'
import {useAuth0, Auth0Provider} from 'react-native-auth0';

const index = () => {
  const {authorize} = useAuth0();

  const onPress = async () => {
      try {
          await authorize();
      } catch (e) {
          console.log(e);
      }
  };
return( <Button onPress={onPress} title="Log in" />

  )
}

export default index