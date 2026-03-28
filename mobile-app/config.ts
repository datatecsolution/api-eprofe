import { Platform } from 'react-native';

const DEV_API_URL = Platform.OS === 'android'
    ? 'http://10.0.2.2:8080/api'
    : 'http://localhost:8080/api';

// Change this to your production URL when deploying
const PROD_API_URL = 'https://api.eprofe.com/api';

const IS_DEV = __DEV__;

const config = {
    apiUrl: IS_DEV ? DEV_API_URL : PROD_API_URL,
};

export default config;
