import { useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";

type PhotoCameraProps = {
  onCapture: (uri: string) => void; // called with the photo's address
  onCancel: () => void;
};

// A simple camera screen made with expo-camera.
// Works on phones and in the browser (webcam). On web it needs localhost or https.
export default function PhotoCamera({ onCapture, onCancel }: PhotoCameraProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [taking, setTaking] = useState(false);

  // useRef gives us access to the CameraView, so we can call takePictureAsync() on it
  const cameraRef = useRef<CameraView>(null);

  async function takePicture() {
    if (!cameraRef.current) return;
    setTaking(true);
    try {
      // quality 0.5: smaller files upload faster
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });
      onCapture(photo.uri); // file://… on a phone, data:image/… on web
    } catch (e) {
      console.error("Failed to take picture:", e);
    } finally {
      setTaking(false);
    }
  }

  // 1. Permission is still loading
  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  // 2. Not allowed yet: explain and ask
  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>We need your permission to use the camera.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionText}>Allow camera</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 3. Allowed: show the camera
  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing} />

      <View style={styles.controls}>
        <TouchableOpacity onPress={onCancel}>
          <Text style={styles.controlText}>Cancel</Text>
        </TouchableOpacity>

        {/* Shutter button */}
        <TouchableOpacity style={styles.shutter} onPress={takePicture} disabled={taking}>
          {taking ? <ActivityIndicator /> : null}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setFacing(facing === "back" ? "front" : "back")}>
          <Text style={styles.controlText}>Flip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  camera: { flex: 1 },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 24,
  },
  controlText: { color: "white", fontSize: 17, width: 60, textAlign: "center" },
  shutter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "white",
    borderWidth: 4,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16, padding: 24 },
  message: { fontSize: 16, textAlign: "center" },
  permissionButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  permissionText: { color: "white", fontSize: 16, fontWeight: "600" },
  cancelText: { color: "#FF3B30", fontSize: 16 },
});
