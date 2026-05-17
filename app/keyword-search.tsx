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

const moodKeywords = [
  "평온한",
  "청량한",
  "낭만적인",
  "활기찬",
  "웅장한",
  "아늑한",
  "고즈넉한",
  "이국적인",
  "세련된",
  "레트로한",
  "신비로운",
];

const regionKeywords = [
  "서울특별시",
  "부산광역시",
  "대구광역시",
  "인천광역시",
  "광주광역시",
  "대전광역시",
  "울산광역시",
  "세종시",
  "경기도",
  "강원도",
  "충청북도",
  "충청남도",
];

export default function KeywordSearchScreen() {
  const [selectedMoods, setSelectedMoods] = useState<string[]>(["신비로운"]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>(["충청북도"]);

  const toggleMood = (keyword: string) => {
    setSelectedMoods((prev) =>
      prev.includes(keyword)
        ? prev.filter((item) => item !== keyword)
        : [...prev, keyword]
    );
  };

  const toggleRegion = (region: string) => {
    setSelectedRegions((prev) =>
      prev.includes(region)
        ? prev.filter((item) => item !== region)
        : [...prev, region]
    );
  };

  const handleSearch = () => {
    router.push({
      pathname: "/keyword-result",
      params: {
        mood: selectedMoods.join(","),
        region: selectedRegions.join(","),
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>키워드 검색</Text>

          <View style={styles.profileArea}>
            <Ionicons name="person-circle-outline" size={48} color="#263A56" />
            <Text style={styles.profileName}>수정님</Text>
          </View>
        </View>

        <View style={styles.filterTitleRow}>
          <Ionicons name="search-outline" size={34} color="#F28C2E" />
          <Text style={styles.filterTitle}>키워드 필터</Text>
        </View>

        <View style={styles.keywordBox}>
          <View style={styles.keywordGrid}>
            {moodKeywords.map((keyword) => {
              const active = selectedMoods.includes(keyword);

              return (
                <TouchableOpacity
                  key={keyword}
                  style={[styles.keywordChip, active && styles.activeChip]}
                  onPress={() => toggleMood(keyword)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.keywordText}>#{keyword}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.selectedPreviewBox}>
          <Text style={styles.selectedPreviewTitle}>선택한 키워드</Text>
          <Text style={styles.selectedPreviewText}>
            {selectedMoods.length > 0
              ? selectedMoods.map((item) => `#${item}`).join(" ")
              : "선택된 키워드 없음"}
          </Text>
        </View>

        <View style={styles.filterTitleRow}>
          <Ionicons name="location-outline" size={34} color="#F28C2E" />
          <Text style={styles.filterTitle}>장소 필터</Text>
        </View>

        <View style={styles.keywordBox}>
          <View style={styles.keywordGrid}>
            {regionKeywords.map((region) => {
              const active = selectedRegions.includes(region);

              return (
                <TouchableOpacity
                  key={region}
                  style={[styles.keywordChip, active && styles.activeChip]}
                  onPress={() => toggleRegion(region)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.keywordText}>{region}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.selectedPreviewBox}>
          <Text style={styles.selectedPreviewTitle}>선택한 지역</Text>
          <Text style={styles.selectedPreviewText}>
            {selectedRegions.length > 0
              ? selectedRegions.join(", ")
              : "선택된 지역 없음"}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.searchSubmitButton,
            (selectedMoods.length === 0 || selectedRegions.length === 0) &&
              styles.disabledButton,
          ]}
          onPress={handleSearch}
          disabled={selectedMoods.length === 0 || selectedRegions.length === 0}
          activeOpacity={0.85}
        >
          <Text style={styles.searchSubmitText}>검색</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomNav}>
        <NavButton icon="home-outline" active onPress={() => router.push("/home")} />
        <NavButton icon="location-outline" onPress={() => router.push("/map")} />
        <NavButton icon="heart-outline" />
        <NavButton icon="chatbubbles-outline" />
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
      activeOpacity={0.85}
    >
      <Ionicons name={icon} size={36} color="#F28C2E" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDE8",
  },

  scrollContent: {
    paddingTop: 70,
    paddingHorizontal: 28,
    paddingBottom: 130,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  logo: {
    width: 95,
    height: 75,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2C2C2C",
  },

  profileArea: {
    width: 58,
    alignItems: "center",
  },

  profileName: {
    fontSize: 12,
    color: "#333333",
    marginTop: 2,
  },

  filterTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 14,
  },

  filterTitle: {
    fontSize: 23,
    fontWeight: "800",
    color: "#2C2C2C",
    marginLeft: 8,
  },

  keywordBox: {
    backgroundColor: "#FFFFF4",
    borderRadius: 34,
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 5,
    elevation: 5,
  },

  keywordGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 20,
  },

  keywordChip: {
    width: "30%",
    height: 45,
    borderRadius: 24,
    backgroundColor: "#FFF0B8",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 3,
    elevation: 4,
  },

  activeChip: {
    backgroundColor: "#FFD75E",
  },

  keywordText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#333333",
  },

  selectedPreviewBox: {
    marginTop: 14,
    backgroundColor: "#FFF7D1",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  selectedPreviewTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#8A6B1D",
    marginBottom: 4,
  },

  selectedPreviewText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333333",
    lineHeight: 20,
  },

  searchSubmitButton: {
    width: 150,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFD75E",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 34,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 4,
  },

  disabledButton: {
    backgroundColor: "#E0D6AA",
  },

  searchSubmitText: {
    fontSize: 19,
    fontWeight: "800",
    color: "#333333",
  },

  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 95,
    backgroundColor: "#FFFDE8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 28,
    paddingBottom: 18,
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