import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, Calendar, MapPin, Award, ArrowLeft, Upload, Loader2, Save } from "lucide-react";
import useAuthStore from "../store/useAuthStore";
import { authService } from "../services/auth.service";

const EditProfile = () => {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();

  // Reference for file input
  const fileInputRef = useRef(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [skillLevel, setSkillLevel] = useState("Trung bình");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Load user data into form states
  useEffect(() => {
    if (user) {
      setFullName(user.fullname || "");
      setPhoneNumber(user.phonenumber || "");
      setEmail(user.email || "");
      setAddress(user.address || "");
      setGender(user.gender || "");
      setSkillLevel(user.skilllevel || "Trung bình");
      setAvatarPreview(user.avatarurl || "");

      if (user.dateofbirth) {
        try {
          const d = new Date(user.dateofbirth);
          if (!isNaN(d.getTime())) {
            setDateOfBirth(d.toISOString().substring(0, 10));
          }
        } catch (e) {
          setDateOfBirth("");
        }
      } else {
        setDateOfBirth("");
      }
    }
  }, [user]);

  // Handle avatar image selection
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Kích thước ảnh đại diện không được vượt quá 5MB!");
        return;
      }
      setAvatarFile(file);
      setError("");

      // Create local preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Submit profile updates
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!fullName.trim() || !phoneNumber.trim()) {
      setError("Họ tên và Số điện thoại là bắt buộc!");
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("fullName", fullName.trim());
      formData.append("phoneNumber", phoneNumber.trim());
      formData.append("email", email.trim());
      formData.append("address", address.trim());
      formData.append("gender", gender);
      formData.append("dateOfBirth", dateOfBirth || "");
      formData.append("skillLevel", skillLevel);

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const response = await authService.updateProfile(formData);
      
      // Update local Zustand store user state
      updateUser(response.user);

      setSuccess("Cập nhật thông tin cá nhân thành công!");
      
      // Redirect back to profile page after 1.2s
      setTimeout(() => {
        navigate("/profile");
      }, 1200);

    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi khi lưu thông tin.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-5 py-8 animate-fade-in pb-24 text-slate-950 dark:text-white">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/profile")}
          className="rounded-md border border-slate-200 bg-white p-2.5 text-slate-500 transition-colors hover:border-slate-950 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold tracking-normal text-slate-950 dark:text-white">
            Chỉnh sửa hồ sơ
          </h1>
          <p className="text-slate-400 text-sm mt-1">Cập nhật thông tin tài khoản của bạn</p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 md:p-8">
        {/* Status Alerts */}
        {error && (
          <div className="mb-6 rounded-md border border-red-500/20 bg-red-500/10 p-4 text-sm font-semibold text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-md border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-400">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar upload section */}
          <div className="flex flex-col items-center justify-center pb-6 border-b border-slate-200 dark:border-white/5">
            <div 
              onClick={triggerFileInput}
              className="group relative flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-slate-200 bg-primary/10 transition-all hover:border-primary/50 dark:border-white/20"
            >
              {avatarPreview ? (
                <img 
                  src={avatarPreview} 
                  alt="Avatar Preview" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                />
              ) : (
                <User className="w-10 h-10 text-slate-400 group-hover:text-primary transition-colors" />
              )}
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-xs font-bold text-white">
                <Upload className="w-4 h-4 mb-1 text-primary animate-bounce" />
                <span>Tải ảnh mới</span>
              </div>
            </div>
            
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
            <p className="text-slate-400 text-xs mt-3">Hỗ trợ JPG, PNG, GIF. Tối đa 5MB</p>
          </div>

          {/* Form grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Username (Read-only) */}
            <div>
                <label className="block text-slate-500 dark:text-slate-300 font-bold text-xs uppercase tracking-wider mb-2">
                Tên đăng nhập
              </label>
              <div className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-400 rounded-xl cursor-not-allowed select-none">
                @{user.username}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-slate-500 dark:text-slate-300 font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-1">
                Họ và tên <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Nhập họ và tên"
                className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-primary text-slate-900 dark:text-white transition-colors"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-slate-500 dark:text-slate-300 font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-1">
                Số điện thoại <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  placeholder="Nhập số điện thoại"
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-primary text-slate-900 dark:text-white transition-colors"
                />
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-slate-500 dark:text-slate-300 font-bold text-xs uppercase tracking-wider mb-2">
                Địa chỉ Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-primary text-slate-900 dark:text-white transition-colors"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-slate-500 dark:text-slate-300 font-bold text-xs uppercase tracking-wider mb-2">
                Ngày sinh
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-primary text-slate-900 dark:text-white transition-colors dark:scheme-dark"
                />
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-slate-500 dark:text-slate-300 font-bold text-xs uppercase tracking-wider mb-2">
                Giới tính
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-[#0d1e21] border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-primary text-slate-900 dark:text-white transition-colors"
              >
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            {/* Skill Level */}
            <div>
              <label className="block text-slate-500 dark:text-slate-300 font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-primary" /> Trình độ chơi
              </label>
              <select
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-[#0d1e21] border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-primary text-slate-900 dark:text-white transition-colors"
              >
                <option value="Mới chơi">Mới chơi</option>
                <option value="Trung bình">Trung bình</option>
                <option value="Khá">Khá</option>
                <option value="Chuyên nghiệp">Chuyên nghiệp</option>
              </select>
            </div>

            {/* Address */}
            <div>
              <label className="block text-slate-500 dark:text-slate-300 font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" /> Địa chỉ
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Nhập địa chỉ của bạn"
                className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-primary text-slate-900 dark:text-white transition-colors"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200 dark:border-white/5">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-primary text-[#00272C] hover:bg-[#C6D632] disabled:opacity-50 py-3.5 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/10"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lưu thay đổi</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/profile")}
              disabled={saving}
              className="sm:w-32 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-950 dark:hover:text-white py-3.5 font-bold rounded-xl transition-colors border border-slate-200 dark:border-white/10"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
