import { X } from "lucide-react";

const AddServiceModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0b1c30]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">Thêm Dịch Vụ</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-slate-500 mb-4">
          Giao diện thêm dịch vụ sẽ hiển thị ở đây.
        </p>
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddServiceModal;
