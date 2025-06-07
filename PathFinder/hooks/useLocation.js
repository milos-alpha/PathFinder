import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permission to access location was denied');
          return;
        }

        // eslint-disable-next-line no-shadow
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location.coords);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { location, error, loading };
};
