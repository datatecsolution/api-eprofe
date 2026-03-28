declare module '@react-native-cookies/cookies' {
    export interface Cookie {
        name: string;
        value: string;
        path?: string;
        domain?: string;
        version?: string;
        expires?: string;
        secure?: boolean;
        httpOnly?: boolean;
    }

    export interface Cookies {
        [key: string]: Cookie;
    }

    export default class CookieManager {
        static get(url: string, useWebKit?: boolean): Promise<Cookies>;
        static set(url: string, cookie: Cookie, useWebKit?: boolean): Promise<boolean>;
        static setFromResponse(url: string, cookieStr: string): Promise<boolean>;
        static clearAll(useWebKit?: boolean): Promise<boolean>;
        static clearByName(url: string, name: string, useWebKit?: boolean): Promise<boolean>;
    }
}
