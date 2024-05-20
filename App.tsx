import { WebView, WebViewMessageEvent } from "react-native-webview";
import Constants from "expo-constants";
import {
    BackHandler,
    Button,
    Platform,
    StyleSheet,
    TextInput,
    View,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { PermissionsAndroid } from "react-native";
import { CameraView } from "expo-camera";

export default function App() {
    const webViewRef = useRef<WebView>(null);

    const [url, setUrl] = useState<string>("");
    const [search, setSearch] = useState<Boolean>(false);
    const [showCamera, setShowCamera] = useState(false);
    const message = "Hola vengo desde la app nativa";

    const onAndroidBackPress = () => {
        if (showCamera) {
            setShowCamera(!showCamera)
            return true;
        }
        if (webViewRef.current) {
            webViewRef.current.goBack();
            return true;
        }
        return false;
    };

    useEffect(() => {
        requestCameraPermission();
        if (Platform.OS === "android") {
            BackHandler.addEventListener(
                "hardwareBackPress",
                onAndroidBackPress
            );
            return () => {
                BackHandler.removeEventListener(
                    "hardwareBackPress",
                    onAndroidBackPress
                );
            };
        }
    });

    const requestCameraPermission = async () => {
        if (Platform.OS === "android") {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: "Permiso de cámara",
                        message:
                            "Esta aplicación necesita acceder a tu cámara.",
                        buttonNeutral: "Preguntar luego",
                        buttonNegative: "Cancelar",
                        buttonPositive: "Aceptar",
                    }
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    return true;
                } else {
                    return false;
                }
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
    };

    const handleFunction = (event: WebViewMessageEvent) => {
        switch (event.nativeEvent.data) {
            case "requestCameraPermission":
                requestCameraPermission();
                break;
            case "requesrMessage":
                sendMessage();
                break;
            case "readQR":
                showCameraQR();
                break;
            default:
                break;
        }
    };

    const press = () => {
        setSearch(!search);
    };

    const showCameraQR = () => {
        setShowCamera(true);
    };

    const sendMessage = () => {
        const jsCode = `readMessage('${message}');`;
        console.log(jsCode);
        webViewRef.current?.injectJavaScript(jsCode);
    };

    const sendQR = (qr: string) => {
        const jsCode = `readMessage('${qr}');`;
        console.log(jsCode);
        setShowCamera(!showCamera);
        webViewRef.current?.injectJavaScript(jsCode);
    };

    return (
        <View style={{ flex: 1, marginTop: Constants.statusBarHeight }}>
            {search ? (
                <>
                    <WebView
                        ref={webViewRef}
                        source={{
                            uri: url,
                        }}
                        onMessage={handleFunction}
                        allowsBackForwardNavigationGestures
                    />
                    <Button title="Volver" onPress={press}></Button>
                    {showCamera && (
                        <CameraView
                            style={styles.camera}
                            onBarcodeScanned={(qr) => sendQR(qr.data)}
                        ></CameraView>
                    )}
                </>
            ) : (
                <View style={styles.container}>
                    <TextInput
                        style={styles.textInput}
                        onChangeText={(text) => setUrl(text)}
                    ></TextInput>
                    <Button title="Buscar" onPress={press}></Button>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: Constants.statusBarHeight,
        alignItems: "center",
        justifyContent: "center",
    },
    textInput: {
        width: "80%",
        borderColor: "black",
        borderWidth: 1,
        borderRadius: 30,
        marginBottom: 10,
    },
    camera: {
        position: "absolute",
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
    },
});
