import React from 'react';

// Stub WEB de SaceWebViewSync.
// `react-native-webview` no existe en el navegador y su import top-level contaminaría el bundle web.
// En web el scraping de SACE lo hace el BACKEND (POST /api/sace/sync-server/{docenteId}), disparado
// desde useInitialSync.pullData. Por eso este componente nunca se monta en web; existe solo para que
// el import `{ SaceWebViewSync }` de LoginScreen se resuelva sin arrastrar react-native-webview.
interface SaceWebViewSyncProps {
    credentials: { usuario: string; clave: string };
    onSyncSuccess: (data: string) => void;
    onSyncError: (error: string) => void;
}

export const SaceWebViewSync: React.FC<SaceWebViewSyncProps> = () => {
    return null;
};

export default SaceWebViewSync;
