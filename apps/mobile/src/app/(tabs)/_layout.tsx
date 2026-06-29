import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, View, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";

/** Glowing house icon shown on the Discover tab when focused */
function GlowingHouseIcon({ focused, size }: { focused: boolean; size: number }) {
  return (
    <View style={styles.glowWrapper}>
      {/* Outermost glow ring */}
      {focused && (
        <View
          style={[
            styles.glowRing,
            {
              width: size + 28,
              height: size + 28,
              borderRadius: (size + 28) / 2,
              backgroundColor: "rgba(59,130,246,0.12)",
            },
          ]}
        />
      )}
      {/* Middle glow ring */}
      {focused && (
        <View
          style={[
            styles.glowRing,
            {
              width: size + 14,
              height: size + 14,
              borderRadius: (size + 14) / 2,
              backgroundColor: "rgba(59,130,246,0.22)",
            },
          ]}
        />
      )}
      {/* Inner bright ring */}
      {focused && (
        <View
          style={[
            styles.glowRing,
            {
              width: size + 4,
              height: size + 4,
              borderRadius: (size + 4) / 2,
              backgroundColor: "rgba(99,163,255,0.18)",
            },
          ]}
        />
      )}
      {/* The icon itself */}
      <Ionicons
        name={focused ? "home" : "home-outline"}
        size={size}
        color={focused ? "#60A5FA" : "rgba(148,163,184,0.6)"}
        style={focused ? styles.iconGlow : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  glowWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  glowRing: {
    position: "absolute",
  },
  iconGlow: {
    // shadowColor drives the glow on iOS; on Android use elevation on a wrapper
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
});

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "rgba(148,163,184,0.6)",
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.OS === "ios" ? "transparent" : "rgba(15,23,42,0.97)",
          borderTopColor: "rgba(59,130,246,0.15)",
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 85 : 65,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
          paddingTop: 8,
          elevation: 0,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              tint="dark"
              intensity={80}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
          ) : null,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          letterSpacing: 0.2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Discover",
          tabBarIcon: ({ size, focused }) => (
            <GlowingHouseIcon focused={focused} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: "center" }}>
              <Ionicons
                name={focused ? "document-text" : "document-text-outline"}
                size={size}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: "center" }}>
              <Ionicons
                name={focused ? "bookmark" : "bookmark-outline"}
                size={size}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: "center" }}>
              <Ionicons
                name={focused ? "person-circle" : "person-circle-outline"}
                size={size}
                color={color}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
