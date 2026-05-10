import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { router } from "expo-router";
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.78;
const CARD_SPACING = 18;

const recommendedPlaces = [
  {
    id: "1",
    name: "달맞이근린공원",
    address: "서울특별시 성동구 금호동4가 산27",
  },
  {
    id: "2",
    name: "한강공원",
    address: "서울특별시 영등포구 여의동로 330",
  },
  {
    id: "3",
    name: "남산공원",
    address: "서울특별시 중구 삼일대로 231",
  },
];

export default function HomeScreen() {
    const [activeIndex, setActiveIndex] = useState(0);

const handleCardScroll = (
  event: NativeSyntheticEvent<NativeScrollEvent>
) => {
  const scrollX = event.nativeEvent.contentOffset.x;
  const index = Math.round(scrollX / (CARD_WIDTH + CARD_SPACING));
  setActiveIndex(index);
};

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 상단 영역 */}
        <View style={styles.header}>
          <View style={styles.logoArea}>
            <Image
              source={require("../assets/images/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.speechBubble}>
            <Text style={styles.speechText}>
              저녁에 날씨도 좋으니 산책할 만한 분위기에 맞는{"\n"}
              전망 좋은 장소를 추천해드려요!
            </Text>
          </View>

          <View style={styles.profileArea}>
            <Ionicons name="person-circle-outline" size={48} color="#263A56" />
            <Text style={styles.profileName}>수정님</Text>
          </View>
        </View>

        {/* 추천 제목 */}
        <View style={styles.sectionTitleRow}>
          <MaterialCommunityIcons name="cable-car" size={28} color="#2C2C2C" />
          <Text style={styles.sectionTitle}>오늘의 분위기 여행지 추천</Text>
        </View>

        {/* 장소 카드 */}
<View style={styles.recommendWrapper}>
  <FlatList
    data={recommendedPlaces}
    keyExtractor={(item) => item.id}
    horizontal
    showsHorizontalScrollIndicator={false}
    snapToInterval={CARD_WIDTH + CARD_SPACING}
    decelerationRate="fast"
    bounces={false}
    onScroll={handleCardScroll}
    scrollEventThrottle={16}
    contentContainerStyle={styles.cardList}
    renderItem={({ item }) => (
      <View style={styles.card}>
        <View style={styles.imageBox}>
          <Text style={styles.imagePlaceholder}>장소 이미지</Text>

          <TouchableOpacity style={styles.arrowButton}>
            <Ionicons name="arrow-forward" size={34} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.placeInfoRow}>
          <View style={styles.placeLeft}>
            <View style={styles.placeNameRow}>
              <Ionicons name="location-sharp" size={28} color="#F28C2E" />
              <Text style={styles.placeName}>{item.name}</Text>
            </View>

            <View style={styles.addressBox}>
              <Text style={styles.addressText}>{item.address}</Text>
            </View>
          </View>

          <TouchableOpacity>
            <Ionicons name="heart-outline" size={42} color="#FFD75E" />
          </TouchableOpacity>
        </View>
      </View>
    )}
  />

  <View style={styles.dotsContainer}>
    {recommendedPlaces.map((_, index) => (
      <View
        key={index}
        style={[
          styles.dot,
          activeIndex === index && styles.activeDot,
        ]}
      />
    ))}
  </View>
</View>

        {/* 직접 검색하기 */}
        <View style={styles.searchTitleRow}>
          <Ionicons name="search" size={31} color="#2C2C2C" />
          <Text style={styles.searchTitle}>직접 검색하기</Text>
        </View>

        <SearchButton text="이미지로 검색하기"
        onPress={() => router.push("/image-search")} />
        <SearchButton text="키워드로 검색하기" 
        onPress={() => router.push("/keyword-search")}/>
        <SearchButton text="개인 맞춤 추천" />
      </ScrollView>

      {/* 하단 네비게이션 */}
      <View style={styles.bottomNav}>
        <NavButton icon="home-outline" active />
        <NavButton icon="location-outline" />
        <NavButton icon="heart-outline" />
        <NavButton icon="chatbubbles-outline" />
      </View>
    </View>
  );
}

function SearchButton({
  text,
  onPress,
}: {
  text: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.searchButton} onPress={onPress}>
      <Text style={styles.searchButtonText}>{text}</Text>
      <Ionicons
        name="arrow-forward-circle-outline"
        size={28}
        color="#F49A36"
        style={styles.searchButtonArrow}
      />
    </TouchableOpacity>
  );
}

function NavButton({
  icon,
  active = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  active?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.navButton, active && styles.activeNavButton]}
    >
      <Ionicons name={icon} size={36} color="#F28C2E" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FEFDDF",
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

  logoArea: {
    width: 95,
    alignItems: "center",
    justifyContent: "center",
  },

  logoImage: {
    width: 95,
    height: 75,
  },

  speechBubble: {
    flex: 1,
    backgroundColor: "#FFD96B",
    borderRadius: 7,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginHorizontal: 8,
  },

  speechText: {
    fontSize: 11,
    lineHeight: 20,
    color: "#333333",
    textAlign: "center",
    fontWeight: "600",
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

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 30,
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2D2D2D",
  },

  recommendWrapper: {
  marginHorizontal: -28,
},

cardList: {
  paddingLeft: 28,
  paddingRight: 80,
  paddingVertical: 8,
},

card: {
  width: CARD_WIDTH,
  backgroundColor: "#FFFFF4",
  borderRadius: 34,
  padding: 18,
  marginRight: CARD_SPACING,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.18,
  shadowRadius: 5,
  elevation: 6,
},

imageBox: {
  width: "100%",
  height: 230,
  borderRadius: 24,
  backgroundColor: "#DDE7EC",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  overflow: "hidden",
},

imagePlaceholder: {
  fontSize: 18,
  fontWeight: "700",
  color: "#5D6B73",
},

dotsContainer: {
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  marginTop: 10,
},

dot: {
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: "#E5DDB8",
  marginHorizontal: 4,
},

activeDot: {
  width: 22,
  backgroundColor: "#FFD75E",
},

  arrowButton: {
    position: "absolute",
    top: 22,
    right: 18,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(80, 94, 104, 0.75)",
    alignItems: "center",
    justifyContent: "center",
  },

  placeInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 18,
  },

  placeLeft: {
    flex: 1,
  },

  placeNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  placeName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#202020",
    marginLeft: 6,
  },

  addressBox: {
    backgroundColor: "#FFD75E",
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: "flex-start",
  },

  addressText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333333",
  },

  searchTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 58,
    marginBottom: 18,
  },

  searchTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2C2C2C",
  },

  searchButton: {
    height: 58,
    backgroundColor: "#FFF0B8",
    borderRadius: 30,
    marginBottom: 26,
    paddingHorizontal: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },

  searchButtonText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#333333",
  },

  searchButtonArrow: {
    position: "absolute",
    right: 24,
  },

  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 95,
    backgroundColor: "#FEFDDF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 28,
    paddingBottom: 18,
  },

  navButton: {
    width: 60,
    height: 60,
    borderRadius: 33,
    backgroundColor: "#FFDC74",
    alignItems: "center",
    justifyContent: "center",
  },

  activeNavButton: {
    backgroundColor: "#FFC928",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
    elevation: 5,
  },
});