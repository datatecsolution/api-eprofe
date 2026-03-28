import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { WebView } from 'react-native-webview';

interface SaceWebViewSyncProps {
    onSyncSuccess: (cookies: string) => void;
    onSyncError: (error: string) => void;
    credentials: {
        usuario: string;
        clave: string;
    };
}

export const SaceWebViewSync: React.FC<SaceWebViewSyncProps> = ({
    onSyncSuccess,
    onSyncError,
    credentials,
}) => {
    const webViewRef = useRef<WebView>(null);
    const hasSucceeded = useRef(false);
    const [currentUrl, setCurrentUrl] = useState('https://sace.se.gob.hn/cuentas/login');

    // Escape credentials for safe JS string injection
    const escapeJS = (str: string) =>
        str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/`/g, '\\`').replace(/\$/g, '\\$');

    const safeUsuario = escapeJS(credentials.usuario);
    const safeClave = escapeJS(credentials.clave);

    // Script to intelligently handle login, profile selection, and cookie extraction
    const injectSmartScript = `
    (function() {
      try {
        const currentUrl = window.location.href;

        // 1. Match Login Form
        const usuarioInput = document.getElementById('usuario');
        const claveInput = document.getElementById('clave');

        if (usuarioInput && claveInput) {
          usuarioInput.value = '${safeUsuario}';
          claveInput.value = '${safeClave}';
          
          const submitBtn = document.querySelector('button[type="submit"]');
          if (submitBtn) {
            submitBtn.click();
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'STATUS', message: 'LOGIN_CLICKED' }));
          } else {
             const form = usuarioInput.closest('form');
             if(form) {
                 form.submit();
                 window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'STATUS', message: 'FORM_SUBMITTED' }));
             } else {
                 window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ERROR', message: 'Submit button or form not found' }));
             }
          }
          return;
        }

        // 2. Match Profile Selection Form
        const profileForms = document.querySelectorAll('form[action*="/cuentas/usuario/autorizar"]');
        if (profileForms.length > 0) {
           let targetForm = null;
           for (let i = 0; i < profileForms.length; i++) {
               const tr = profileForms[i].closest('tr');
               if (tr && tr.textContent.toUpperCase().includes('DOCENTE')) {
                   targetForm = profileForms[i];
                   break;
               }
           }
           
           if (targetForm) {
               targetForm.submit();
               window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'STATUS', message: 'PROFILE_SELECTED' }));
           } else {
               profileForms[0].submit();
               window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'STATUS', message: 'DEFAULT_PROFILE_SELECTED' }));
           }
           return;
        }

        // 3. Navigate to Download Page and Extract Excels via JS Fetch
        if (currentUrl.indexOf('/cuentas/login') === -1 && profileForms.length === 0) {
            if (currentUrl.indexOf('/notas/descargar') === -1) {
                window.location.href = 'https://sace.se.gob.hn/notas/descargar';
                return;
            }
            
            const buttons = document.querySelectorAll('button.descargar[data-cs]');
            const tokenInput = document.querySelector('input[name=csrfmiddlewaretoken]');
            const token = tokenInput ? tokenInput.value : '';
            
            if (buttons.length === 0) {
                // Not fully loaded or no files
                return;
            }

            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'STATUS', message: 'Iniciando descarga de Excels desde SACE...' }));

            // Prevent multiple executions
            if(window.hasStartedDownload) return;
            window.hasStartedDownload = true;

            const downloadAll = async () => {
                try {
                    let allFiles = [];
                    for(let i = 0; i < buttons.length; i++) {
                        const csId = buttons[i].getAttribute('data-cs');
                        const formData = new URLSearchParams();
                        formData.append('cs', csId);
                        formData.append('csrfmiddlewaretoken', token);
                        
                        const response = await fetch('https://sace.se.gob.hn/notas/descargar', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            body: formData.toString()
                        });
                        
                        const blob = await response.blob();
                        const base64 = await new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result.split(',')[1]);
                            reader.readAsDataURL(blob);
                        });
                        
                        allFiles.push({ filename: 'descarga_' + i + '_' + csId + '.xls', base64: base64 });
                    }
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'FILES_DOWNLOADED', data: allFiles }));
                } catch (e) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ERROR', message: 'Error descargando archivo: ' + e.message }));
                }
            };

            downloadAll();
        }

      } catch (e) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ERROR', message: e.message }));
      }
    })();
    true;
  `;

    const handleNavigationStateChange = (navState: any) => {
        setCurrentUrl(navState.url);
    };

    const handleMessage = (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);

            switch (data.type) {
                case 'STATUS':
                    console.log('SACE WebView Status:', data.message);
                    break;
                case 'FILES_DOWNLOADED':
                    if (!hasSucceeded.current) {
                        hasSucceeded.current = true;
                        // Send the base64 files payload to the sync function via the cookies parameter (repurposed)
                        onSyncSuccess(JSON.stringify(data.data));
                    }
                    break;
                case 'ERROR':
                    if (!hasSucceeded.current) {
                        onSyncError(data.message);
                    }
                    break;
                default:
                    console.log('Unknown message from WebView:', data);
            }
        } catch (e) {
            console.error('Failed to parse message from WebView', e);
        }
    };


    return (
        <View style={styles.container}>
            {/* We keep it off-screen but rendered so it can execute JS without breaking layout */}
            <View style={styles.hiddenWebViewContainer}>
                <WebView
                    ref={webViewRef}
                    source={{ uri: 'https://sace.se.gob.hn/cuentas/login' }}
                    onNavigationStateChange={handleNavigationStateChange}
                    onMessage={handleMessage}
                    injectedJavaScript={injectSmartScript}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    sharedCookiesEnabled={true}
                    thirdPartyCookiesEnabled={true}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 0,
        height: 0,
        opacity: 0,
    },
    hiddenWebViewContainer: {
        width: 1,
        height: 1,
    }
});

export default SaceWebViewSync;
