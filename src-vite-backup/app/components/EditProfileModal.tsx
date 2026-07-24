import { View, Text } from "react-native";
import { useState, useRef, ChangeEvent } from "react";
import { X, MapPin, User, AtSign, Camera, GraduationCap, Layers, Bookmark, Heart, Smile, Phone, Image as ImageIcon, FileSliders as Sliders } from "lucide-react";

// =========================================================================
// CAMPUS DATA PLACEHOLDER
// =========================================================================
const CAMPUS_DATA = {
  universities: [
    "University of Lagos (UNILAG)",
    "University of Ibadan (UI)",
    "Obafemi Awolowo University (OAU)",
    "University of Nigeria, Nsukka (UNN)",
    "Ahmadu Bello University (ABU)",
    "Covenant University",
    "Babcock University",
  ],
  departments: [
    "Computer Science",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Mass Communication",
    "Accounting",
    "Law",
    "Medicine & Surgery",
    "Economics",
  ],
  levels: ["100L", "200L", "300L", "400L", "500L", "600L"],
  genders: ["Male", "Female", "Prefer Not to Say"],
  relationships: [
    "Single",
    "In a Relationship",
    "Engaged",
    "Married",
    "It's Complicated",
    "Focusing on My Books",
  ],
};

// =========================================================================
// PROPS INTERFACE EXTENSION
// =========================================================================
interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName?: string;
  currentUsername?: string;
  currentLocation?: string;
  currentAvatar?: string;
  currentCover?: string;
  currentUniversity?: string;
  currentLevel?: string;
  currentDepartment?: string;
  currentGender?: string;
  currentRelationship?: string;
  currentPhone?: string;
  currentHobbies?: string;
  currentBio?: string;
  // Professional structure: passes all edited fields back in a single clean object
  onSave: (updatedData: {
    name: string;
    username: string;
    location: string;
    avatar: string;
    cover: string;
    university: string;
    level: string;
    department: string;
    gender: string;
    relationship: string;
    phone: string;
    hobbies: string;
    bio: string;
  }) => void;
}

// =========================================================================
// MAIN EDIT PROFILE COMPONENT
// =========================================================================
export function EditProfileModal({
  isOpen,
  onClose,
  currentName = "",
  currentUsername = "",
  currentLocation = "",
  currentAvatar = "",
  currentCover = "",
  currentUniversity = "",
  currentLevel = "",
  currentDepartment = "",
  currentGender = "",
  currentRelationship = "",
  currentPhone = "",
  currentHobbies = "",
  currentBio = "",
  onSave,
}: EditProfileModalProps) {
  // Form States with safe fallbacks
  const [name, setName] = useState(currentName);
  const [username, setUsername] = useState(currentUsername);
  const [location, setLocation] = useState(currentLocation);
  const [avatar, setAvatar] = useState(currentAvatar);
  const [cover, setCover] = useState(currentCover);
  const [university, setUniversity] = useState(currentUniversity);
  const [level, setLevel] = useState(currentLevel);
  const [department, setDepartment] = useState(currentDepartment);
  const [gender, setGender] = useState(currentGender);
  const [relationship, setRelationship] = useState(currentRelationship);
  const [phone, setPhone] = useState((currentPhone || "").replace("234", "")); 
  const [hobbies, setHobbies] = useState(currentHobbies);
  const [bio, setBio] = useState(currentBio);

  // Crop Sub-Modal States
  const [cropTarget, setCropTarget] = useState<"avatar" | "cover" | null>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState(1);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle Phone input formatting (max 10 numbers, no letters)
  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) {
      setPhone(value);
    }
  };

  // Image Selection Handler
  const triggerImageSelect = (target: "avatar" | "cover") => {
    setCropTarget(target);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageToCrop(event.target.result as string);
          setZoomScale(1); 
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const applyCrop = () => {
    if (cropTarget === "avatar" && imageToCrop) setAvatar(imageToCrop);
    if (cropTarget === "cover" && imageToCrop) setCover(imageToCrop);
    setImageToCrop(null);
    setCropTarget(null);
  };

  const handleSave = () => {
    // Package and return every single edited field cleanly
    onSave({
      name,
      username,
      location,
      avatar,
      cover,
      university,
      level,
      department,
      gender,
      relationship,
      phone: phone ? `234${phone}` : "", 
      hobbies,
      bio,
    });
    onClose();
  };

  return (
    <View className="fixed inset-0 z-50 bg-white flex flex-col animate-rise">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Header */}
      <View className="flex items-center justify-between px-4 py-4 border-b border-gray-100 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="font-bold text-gray-900 text-lg">Edit Profile</h2>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 bg-yellow-500 text-yellow-950 text-xs font-bold rounded-full hover:bg-yellow-400 transition-colors"
        >
          Save
        </button>
      </View>

      {/* Form Content */}
      <View className="flex-1 overflow-y-auto p-5 flex flex-col gap-6 pb-12">
        {/* Profile Graphics */}
        <View>
          <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-3">Profile Graphics</Text>
          <View className="relative h-32 w-full bg-gray-100 rounded-2xl overflow-hidden group">
            {cover && <img src={cover} alt="Cover preview" className="w-full h-full object-cover" />}
            <View className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-100 group-hover:bg-black/50 transition-all">
              <button 
                type="button"
                onClick={() => triggerImageSelect("cover")}
                className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all flex items-center gap-1.5 text-xs font-bold"
              >
                <Camera className="w-4 h-4" /> Change Cover
              </button>
            </View>
          </View>

          <View className="flex justify-start px-4 -mt-10 mb-4 relative z-10">
            <View className="relative group w-20 h-20 rounded-full border-4 border-white shadow-md bg-gray-200 overflow-hidden">
              {avatar && <img src={avatar} alt="Avatar preview" className="w-full h-full object-cover" />}
              <button 
                type="button"
                onClick={() => triggerImageSelect("avatar")}
                className="absolute inset-0 bg-black/40 flex items-center justify-center text-white transition-opacity"
              >
                <Camera className="w-4 h-4" />
              </button>
            </View>
          </View>
        </View>

        {/* Account Identifiers */}
        <View className="flex flex-col gap-4">
          <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Account Handles</Text>
          <View className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-500 text-gray-900 font-medium transition-colors"
              placeholder="Enter your name"
            />
          </View>

          <View className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <AtSign className="w-3.5 h-3.5" /> Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-500 text-gray-900 font-medium transition-colors"
              placeholder="Username"
            />
          </View>
        </View>

        {/* Campus Details */}
        <View className="flex flex-col gap-4">
          <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Campus Credentials</Text>
          <View className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" /> University
            </label>
            <select
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              className="w-full border-2 border-gray-100 bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-500 text-gray-900 font-medium transition-colors appearance-none"
            >
              <option value="">Select University</option>
              {CAMPUS_DATA.universities.map((uni) => (
                <option key={uni} value={uni}>{uni}</option>
              ))}
            </select>
          </View>

          <View className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <Bookmark className="w-3.5 h-3.5" /> Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full border-2 border-gray-100 bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-500 text-gray-900 font-medium transition-colors appearance-none"
            >
              <option value="">Select Department</option>
              {CAMPUS_DATA.departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </View>

          <View className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Study Level
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full border-2 border-gray-100 bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-500 text-gray-900 font-medium transition-colors appearance-none"
            >
              <option value="">Select Level</option>
              {CAMPUS_DATA.levels.map((lvl) => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>
          </View>

          <View className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Base Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-500 text-gray-900 font-medium transition-colors"
              placeholder="e.g. Lagos, Nigeria"
            />
          </View>
        </View>

        {/* Bio & Social Info */}
        <View className="flex flex-col gap-4">
          <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Bio & Social Info</Text>
          <View className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <Smile className="w-3.5 h-3.5" /> Bio Description
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-500 text-gray-900 font-medium transition-colors resize-none"
              placeholder="Tell your campus peers about you..."
            />
          </View>

          <View className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> Gender Identity
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full border-2 border-gray-100 bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-500 text-gray-900 font-medium transition-colors appearance-none"
            >
              <option value="">Select Gender</option>
              {CAMPUS_DATA.genders.map((gen) => (
                <option key={gen} value={gen}>{gen}</option>
              ))}
            </select>
          </View>

          <View className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" /> Relationship Status
            </label>
            <select
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              className="w-full border-2 border-gray-100 bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-500 text-gray-900 font-medium transition-colors appearance-none"
            >
              <option value="">Select Status</option>
              {CAMPUS_DATA.relationships.map((rel) => (
                <option key={rel} value={rel}>{rel}</option>
              ))}
            </select>
          </View>

          <View className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" /> WhatsApp / Phone Line
            </label>
            <View className="flex w-full border-2 border-gray-100 rounded-xl overflow-hidden focus-within:border-yellow-500 transition-colors">
              <View className="bg-gray-50 px-4 py-3 text-gray-500 text-sm font-bold border-r border-gray-100 flex items-center select-none">
                +234
              </View>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                className="flex-1 px-4 py-3 text-sm focus:outline-none text-gray-900 font-medium bg-white"
                placeholder="803 123 4567"
              />
            </View>
            <Text className="text-[10px] text-gray-400">Provide the 10 digits omitting the leading 0</Text>
          </View>

          <View className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <Smile className="w-3.5 h-3.5" /> Hobbies & Skills
            </label>
            <input
              type="text"
              value={hobbies}
              onChange={(e) => setHobbies(e.target.value)}
              className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-500 text-gray-900 font-medium transition-colors"
              placeholder="Coding, Football, Music jamming, etc."
            />
          </View>
        </View>
      </View>

      {/* Sub Modal Overlay */}
      {imageToCrop && (
        <View className="fixed inset-0 z-[60] bg-black flex flex-col animate-rise">
          <View className="flex items-center justify-between px-4 py-4 border-b border-white/10 shrink-0">
            <button
              type="button"
              onClick={() => setImageToCrop(null)}
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-white text-base flex items-center gap-1">
              <Sliders className="w-4 h-4 text-yellow-400" /> Adjust Media Canvas
            </h3>
            <button
              type="button"
              onClick={applyCrop}
              className="px-4 py-1.5 bg-yellow-400 text-yellow-950 text-xs font-bold rounded-full hover:bg-yellow-300 transition-colors"
            >
              Apply Adjust
            </button>
          </View>

          <View className="flex-1 flex items-center justify-center p-6 relative overflow-hidden bg-zinc-950">
            <View className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center">
              {cropTarget === "avatar" ? (
                <View className="w-64 h-64 rounded-full border-2 border-dashed border-yellow-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)]" />
              ) : (
                <View className="w-full max-w-sm h-40 border-2 border-dashed border-yellow-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)]" />
              )}
            </View>

            <View 
              style={{ transform: `scale(${zoomScale})` }} 
              className="transition-transform duration-75 max-w-full max-h-full flex items-center justify-center"
            >
              <img 
                src={imageToCrop} 
                alt="Source node adjusting stream" 
                className="max-w-[85vw] max-h-[55vh] object-contain pointer-events-none" 
              />
            </View>
          </View>

          <View className="bg-zinc-900 px-6 py-6 border-t border-white/10 flex flex-col gap-3 shrink-0 pb-8">
            <View className="flex items-center justify-between text-xs text-zinc-400 font-bold">
              <Text>ZOOM RESIZER SCALE</Text>
              <Text className="text-yellow-400 font-mono">{Math.round(zoomScale * 100)}%</Text>
            </View>
            <View className="flex items-center gap-3">
              <ImageIcon className="w-4 h-4 text-zinc-500" />
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoomScale}
                onChange={(e) => setZoomScale(parseFloat(e.target.value))}
                className="flex-1 accent-yellow-400 cursor-pointer h-1.5 bg-zinc-700 rounded-lg appearance-none"
              />
              <ImageIcon className="w-6 h-6 text-zinc-400" />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}