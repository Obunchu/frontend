import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type BookmarkMode = "list" | "map";

const bookmarks = [
  {
    id: "1",
    name: "덕수궁 돌담길",
    address: "서울 중구 세종대로19길 24 영국대사관",
  },
  {
    id: "2",
    name: "북서울꿈의숲",
    address: "서울 강북구 월계로 173",
  },
  {
    id: "3",
    name: "반포한강공원",
    address: "서울 서초구 신반포로11길 40",
  },
];

export default function BookmarkScreen() {
  const [mode, setMode] = useState<BookmarkMode>("list");

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 상단 */}
        <View style={styles.topArea}>
          <View style={styles.logoArea}>
            <Image
              source={require("../assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>나의 북마크</Text>

          <View style={styles.profileArea}>
            <Ionicons name="person-circle-outline" size={44} color="#263A56" />
            <Text style={styles.profileName}>수정님</Text>
          </View>
        </View>

        {/* 리스트형 / 지도형 탭 */}
        <View style={styles.modeTabs}>
          <TouchableOpacity onPress={() => setMode("list")}>
            <Text
              style={[
                styles.modeText,
                mode === "list" && styles.activeModeText,
              ]}
            >
              리스트형v
            </Text>
          </TouchableOpacity>

          <Text style={styles.divider}>|</Text>

          <TouchableOpacity onPress={() => setMode("map")}>
            <Text
              style={[
                styles.modeText,
                mode === "map" && styles.activeModeText,
              ]}
            >
              지도형
            </Text>
          </TouchableOpacity>
        </View>

        {mode === "list" ? <BookmarkList /> : <BookmarkMap />}
      </ScrollView>

      {/* 하단 네비게이션 */}
      <View style={styles.bottomNav}>
        <NavButton icon="home-outline" onPress={() => router.push("/home")} />
        <NavButton icon="location-outline" onPress={() => router.push("/map")} />
        <NavButton icon="heart-outline" active />
        <NavButton icon="chatbubbles-outline" />
      </View>
    </View>
  );
}

function BookmarkList() {
  return (
    <View style={styles.listArea}>
      {bookmarks.map((item) => (
        <View key={item.id} style={styles.bookmarkCard}>
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imageText}>장소 이미지</Text>
          </View>

          <TouchableOpacity style={styles.heartButton}>
            <Ionicons name="heart" size={34} color="#F28C2E" />
          </TouchableOpacity>

          <View style={styles.cardBottom}>
            <View style={styles.placeNameRow}>
              <Ionicons name="location" size={28} color="#F28C2E" />
              <Text style={styles.placeName}>{item.name}</Text>
            </View>

            <View style={styles.addressBadge}>
              <Text style={styles.addressText}>{item.address}</Text>
            </View>

            <TouchableOpacity style={styles.arrowButton}>
              <Ionicons name="arrow-forward" size={30} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}

function BookmarkMap() {
  return (
    <View style={styles.mapModeArea}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapText}>북마크 지도 API 영역</Text>

        <View style={[styles.marker, { top: "24%", left: "60%" }]} />
        <View style={[styles.marker, { top: "58%", left: "22%" }]} />
        <View style={[styles.marker, { top: "70%", left: "72%" }]} />
      </View>

      <View style={styles.mapCard}>
        <View style={styles.mapCardImage}>
          <Text style={styles.mapCardTitle}>덕수궁 돌담길</Text>
          <View style={styles.mapAddressBadge}>
            <Text style={styles.addressText}>서울 중구 세종대로19길 24 영국대사관</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.mapHeartButton}>
          <Ionicons name="heart" size={34} color="#F28C2E" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.mapArrowButton}>
          <Ionicons name="arrow-forward" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function NavButton({
  icon,
  active = false,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.navButton, active && styles.activeNavButton]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={34} color="#F28C2E" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDE8",
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 70,
    paddingHorizontal: 26,
    paddingBottom: 130,
  },

  topArea: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  logoArea: {
    width: 105,
    height: 86,
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    width: 105,
    height: 86,
  },

  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
    color: "#333333",
  },

  profileArea: {
    width: 58,
    alignItems: "center",
  },

  profileName: {
    marginTop: 2,
    fontSize: 12,
    color: "#333333",
  },

  modeTabs: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  modeText: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "600",
  },

  activeModeText: {
    color: "#F28C2E",
  },

  divider: {
    marginHorizontal: 8,
    color: "#333333",
  },

  listArea: {
    gap: 28,
  },

  bookmarkCard: {
    height: 245,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#D9D9D9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 5,
  },

  imagePlaceholder: {
    flex: 1,
    backgroundColor: "#9EA8AF",
    alignItems: "center",
    justifyContent: "center",
  },

  imageText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#69747C",
  },

  heartButton: {
    position: "absolute",
    top: 24,
    right: 20,
  },

  cardBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },

  placeNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  placeName: {
    marginLeft: 8,
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  addressBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFD957",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 7,
  },

  addressText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333333",
  },

  arrowButton: {
    position: "absolute",
    right: 18,
    bottom: 14,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(80,80,80,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },

  mapModeArea: {
    position: "relative",
  },

  mapPlaceholder: {
    width: "100%",
    height: 540,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#E2E2E2",
    alignItems: "center",
    justifyContent: "center",
  },

  mapText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#8C8C8C",
  },

  marker: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#F28C2E",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },

  mapCard: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 28,
    height: 210,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#9EA8AF",
  },

  mapCardImage: {
    flex: 1,
    justifyContent: "flex-end",
    paddingLeft: 22,
    paddingBottom: 18,
  },

  mapCardTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 8,
  },

  mapAddressBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFD957",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 7,
  },

  mapHeartButton: {
    position: "absolute",
    top: 20,
    right: 18,
  },

  mapArrowButton: {
    position: "absolute",
    right: 18,
    bottom: 14,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(80,80,80,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },

  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 105,
    backgroundColor: "#FFFDE8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 32,
    paddingBottom: 22,
  },

  navButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#FFE08A",
    alignItems: "center",
    justifyContent: "center",
  },

  activeNavButton: {
    backgroundColor: "#FFC928",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
    elevation: 5,
  },
});