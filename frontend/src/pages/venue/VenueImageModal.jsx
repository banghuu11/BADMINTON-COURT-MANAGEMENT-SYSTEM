import { useState, useEffect } from "react";
import { Image as ImageIcon, X, Trash2, Upload } from "lucide-react";
import { apiFetch } from "../../services/api";

const VenueImageModal = ({ isOpen, onClose, venue }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isOpen && venue) {
      const fetchImages = async () => {
        try {
          setLoading(true);
          const data = await apiFetch(`/venues/${venue.venueid}/images`);
          setImages(data.images || []);
        } catch (err) {
          console.error("Lỗi lấy ảnh:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchImages();
    }
  }, [isOpen, venue]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(
        `http://localhost:8080/api/venues/${venue.venueid}/images`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (!response.ok) throw new Error("Upload thất bại");

      const data = await response.json();
      setImages([data.image, ...images]);
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId) => {
    if (!window.confirm("Bạn có chắc muốn xóa ảnh này?")) return;
    try {
      await apiFetch(`/venues/images/${imageId}`, { method: "DELETE" });
      setImages(images.filter((img) => img.imageid !== imageId));
    } catch (err) {
      alert(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0b1c30]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-2xl shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ImageIcon className="text-primary w-6 h-6" />
            Quản lý ảnh: {venue?.venuename}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <label className="flex items-center justify-center w-full h-32 px-4 transition bg-slate-50 border-2 border-slate-300 border-dashed rounded-xl appearance-none cursor-pointer hover:border-primary focus:outline-none">
            <div className="flex flex-col items-center space-y-2">
              <Upload className="w-8 h-8 text-slate-400" />
              <span className="font-medium text-slate-600">
                {uploading ? "Đang tải lên..." : "Nhấn để chọn ảnh tải lên"}
              </span>
            </div>
            <input
              type="file"
              name="file_upload"
              className="hidden"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {loading ? (
            <p className="col-span-full text-center text-slate-500 py-4">
              Đang tải ảnh...
            </p>
          ) : images.length > 0 ? (
            images.map((img) => (
              <div
                key={img.imageid}
                className="relative group rounded-xl overflow-hidden aspect-video bg-slate-100 border border-slate-200"
              >
                <img
                  src={img.imageurl}
                  alt="Venue"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleDelete(img.imageid)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-slate-500 py-4">
              Cơ sở này chưa có ảnh nào.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
export default VenueImageModal;
