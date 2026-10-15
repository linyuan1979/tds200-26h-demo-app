import { useState, useRef } from "react";
import { View, Image, Text, TouchableOpacity, StyleSheet, Button, Modal } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as Device from "expo-device";

type ImageSelectorProps = {
  imageUri: string | null; // the chosen photo, or null if none yet
  onChange: (uri: string | null) => void;
};

// Lets the user take a photo (expo-camera) or choose one from the gallery
// (expo-image-picker), and shows a preview. Same idea as Session 6/7's ImageSelector,
// but with one image per post instead of a list.
export default function ImageSelector({ imageUri, onChange }: ImageSelectorProps) {
  const [cameraVisible, setCameraVisible] = useState(false);
  const [facing, setFacing] = useState<"back" | "front">("back");

  // useRef gives us the CameraView, so we can call takePictureAsync() on it
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();

  // The iOS Simulator and Android emulator have no real camera.
  // (On web, isDevice is true, so the webcam is used.)
  const isSimulator = !Device.isDevice;

  async function pickFromGallery() {
    // quality 0.5: smaller files upload faster (0 = smallest, 1 = best quality)
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.5,
    });
    if (!result.canceled) {
      onChange(result.assets[0].uri);
    }
  }

  async function captureImage() {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.5 });
    if (photo?.uri) {
      onChange(photo.uri); // file://… on a phone, data:image/… on web
      setCameraVisible(false);
    }
  }

  function renderCameraContent() {
    // Permission is still loading
    if (!permission && !isSimulator) {
      return <View style={styles.cameraContainer} />;
    }

    // Not allowed yet: explain and ask
    if (!isSimulator && permission && !permission.granted) {
      return (
        <View style={styles.cameraContainer}>
          <Text style={styles.permissionText}>We need your permission to show the camera</Text>
          <Button onPress={requestPermission} title="Grant permission" />
          <TouchableOpacity style={styles.closeBtn} onPress={() => setCameraVisible(false)}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.cameraContainer}>
        {!isSimulator ? (
          <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.simPanel]}>
            <Text style={styles.simText}>Camera unavailable on simulator</Text>
          </View>
        )}

        <View style={styles.cameraControls}>
          <TouchableOpacity style={styles.cameraBtn} onPress={() => setCameraVisible(false)}>
            <Text style={styles.cameraBtnText}>✕</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shutter, isSimulator && styles.buttonDisabled]}
            disabled={isSimulator}
            onPress={captureImage}
          >
            <View style={styles.shutterInner} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cameraBtn, isSimulator && styles.buttonDisabled]}
            disabled={isSimulator}
            onPress={() => setFacing((current) => (current === "back" ? "front" : "back"))}
          >
            <Text style={styles.cameraBtnText}>⟳</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.pickerRow}>
        <TouchableOpacity style={styles.pickerButton} onPress={() => setCameraVisible(true)}>
          <Text style={styles.pickerText}>📷 Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.pickerButton} onPress={pickFromGallery}>
          <Text style={styles.pickerText}>🖼️ Gallery</Text>
        </TouchableOpacity>
      </View>

      {/* Preview with a button to remove the photo */}
      {imageUri && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
          <TouchableOpacity style={styles.removeBtn} onPress={() => onChange(null)}>
            <Text style={styles.removeText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* The camera opens full screen in its own Modal */}
      <Modal
        visible={cameraVisible}
        animationType="slide"
        onRequestClose={() => setCameraVisible(false)} // Android back button
      >
        {renderCameraContent()}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  pickerRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  pickerButton: {
    flex: 1,
    backgroundColor: "#f2f2f7",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  pickerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  previewContainer: {
    borderRadius: 10,
    overflow: "hidden",
  },
  preview: {
    width: "100%",
    aspectRatio: 4 / 3,
  },
  removeBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,59,48,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  removeText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  cameraContainer: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
  },
  permissionText: {
    color: "white",
    textAlign: "center",
    marginBottom: 16,
    fontSize: 16,
  },
  closeBtn: {
    marginTop: 20,
    alignItems: "center",
  },
  closeBtnText: {
    color: "#aaa",
    fontSize: 16,
  },
  simPanel: {
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  simText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  cameraControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 40,
  },
  cameraBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraBtnText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  shutter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "white",
  },
  buttonDisabled: {
    opacity: 0.4,
  },
});
