import { View, Text } from "react-native";
import { useNavigate } from "react-router";
import { HomeScreen } from "./HomeScreen";

export function OnboardingModal() {
  const navigate = useNavigate();

  return (
    <View className="relative h-full w-full">
      <HomeScreen />
      
      {/* Overlay */}
      <View className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
        <View className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
          <View className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Text className="text-4xl">🎓</Text>
          </View>
          
          <Text className="text-2xl font-bold text-gray-900 mb-2">Welcome to BlacApp!</Text>
          <Text className="text-gray-500 mb-8 leading-relaxed">
            Connect with your campus, discover events, and meet new friends instantly.
          </Text>

          <View className="flex flex-col gap-3 w-full">
            <button 
              className="w-full bg-black text-white font-semibold py-4 rounded-xl active:scale-95 transition-transform"
              onClick={() => navigate("/profile")}
            >
              Complete Profile
            </button>
            <button 
              className="w-full bg-transparent text-gray-500 font-semibold py-4 rounded-xl hover:bg-gray-50 active:scale-95 transition-all"
              onClick={() => navigate("/home")}
            >
              Skip for now
            </button>
          </View>
        </View>
      </View>
    </View>
  );
}
