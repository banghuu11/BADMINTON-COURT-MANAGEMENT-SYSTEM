import { useState, useEffect, useRef } from "react";
import {
  Image as ImageIcon,
  X,
  Upload,
  Trash2,
  Loader2,
  Star,
} from "lucide-react";
import { apiFetch } from "../../services/api";

const VenueImageModal = ({ isOpen, onClose, venue }) => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !venue) return undefined;

    let active = true;

    apiFetch(`/venues/${venue.venueid}/images`)
      .then((data) => {
        if (active) setImages(data.images || []);
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      active = false;
    };
  }, [isOpen, venue]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file); // Phải khớp với tên biến upload.single("image") ở backend

    setUploading(true);
      try {
        await apiFetch(`/venues/${venue.venueid}/images`, {
          method: "POST",
          body: formData,
        });
        const data = await apiFetch(`/venues/${venue.venueid}/images`);
        setImages(data.images || []);
    } catch (error) {
      alert(error.message || "Lỗi tải ảnh lên.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (imageId) => {
    if (!window.confirm("Xóa ảnh này khỏi cơ sở?")) return;
    try {
      await apiFetch(`/venues/images/${imageId}`, { method: "DELETE" });
      setImages(images.filter((img) => img.imageid !== imageId));
    } catch (error) {
      alert(error.message);
    }
  };

  if (!isOpen || !venue) return null;

  return (
    <div className="fixed inset-0 bg-[#00272C]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-3xl shadow-2xl animate-fade-in max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ImageIcon className="text-primary w-6 h-6" /> Quản lý ảnh cơ sở (
            {venue.venuename})
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto mb-6 pr-2">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="aspect-video bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:bg-primary/5 hover:border-primary hover:text-primary transition-colors"
            >
              {uploading ? (
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
              ) : (
                <Upload className="w-8 h-8 mb-2" />
              )}
              <span className="font-bold text-sm">
                {uploading ? "Đang tải lên..." : "Tải ảnh lên"}
              </span>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            {images.map((img) => (
              <div
                key={img.imageid}
                className="relative aspect-video rounded-2xl overflow-hidden group shadow-sm border border-slate-200"
              >
                <img
                  src={img.imageurl}
                  alt="Venue"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {img.ismain && (
                  <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-white" /> Ảnh bìa
                  </div>
                )}
                <button
                  onClick={() => handleDelete(img.imageid)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all shadow-md"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default VenueImageModal;
