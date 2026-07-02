module.exports = function (api) {
    // Detección de plataforma vía el caller de Metro/Expo (ios | android | web).
    // babel-preset-expo agrega `@babel/plugin-proposal-decorators` { legacy: true } para NATIVO
    // (index.js), pero su web-preset NO lo incluye, así que los decoradores @field/@date de
    // WatermelonDB no se transforman en web → "Decorating class property failed" al hacer
    // prepareCreate. Lo agregamos SOLO en web para no duplicarlo en nativo (duplicado = error de Babel).
    const isWeb = api.caller((caller) => !!caller && caller.platform === 'web');
    api.cache.using(() => (isWeb ? 'web' : 'native'));

    return {
        presets: [
            ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
            'nativewind/babel',
        ],
        plugins: [
            // Solo web: los decoradores @field/@date de WatermelonDB. El web-preset de
            // babel-preset-expo no incluye decoradores NI class-properties en loose. Con decoradores
            // legacy, class-properties DEBE ir en loose (usa _initializerDefineProperty en vez de
            // _initializerWarningHelper, que lanza "Decorating class property failed"). Ambos van
            // ANTES del reanimated plugin, y class-properties loose es consistente con los otros
            // transforms loose del web-preset (private-methods/private-property-in-object).
            ...(isWeb
                ? [
                      ['@babel/plugin-proposal-decorators', { legacy: true }],
                      ['@babel/plugin-transform-class-properties', { loose: true }],
                  ]
                : []),
            // reanimated debe ser el ÚLTIMO plugin.
            'react-native-reanimated/plugin',
        ],
    };
};
