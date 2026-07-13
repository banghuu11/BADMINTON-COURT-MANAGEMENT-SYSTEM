import { Building2, MapPin, Clock, Image as ImageIcon, Edit2, Trash2 } from "lucide-react";

const VenueCard = ({ venue, onManageImages, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center mb-4">
        <Building2 className="w-6 h-6" />
      </div>
      <h3
        className="text-xl font-bold text-slate-900 mb-2 truncate"
        title={venue.venuename}
      >
        {venue.venuename}
      </h3>
      <div className="space-y-2 text-sm text-slate-600 mb-4 flex-grow">
        <p className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />{" "}
          <span className="line-clamp-2">
            {venue.address} {venue.district ? `, ${venue.district}` : ""}{" "}
            {venue.city ? `, ${venue.city}` : ""}
          </span>
        </p>
        <p className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />{" "}
          <span>
            {venue.opentime?.slice(0, 5)} - {venue.closetime?.slice(0, 5)}
          </span>
        </p>
      </div>
      <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${
            venue.status === "Active"
              ? "bg-emerald-50 text-emerald-600 border-emerald-200"
              : "bg-slate-50 text-slate-500 border-slate-200"
          }`}
        >
          {venue.status === "Active" ? "Hoạt động" : "Tạm ngưng"}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(venue)}
            className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200 flex items-center gap-1.5"
            title="Sửa cơ sở"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(venue.venueid)}
            disabled={venue.status === 'Inactive'}
            className={`p-2 rounded-lg transition-colors border flex items-center gap-1.5 ${venue.status === 'Inactive' ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed' : 'bg-red-50 text-red-600 hover:bg-red-100 border-red-200'}`}
            title="Xóa cơ sở"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onManageImages(venue)}
            className="p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors border border-primary/20 flex items-center gap-1.5"
            title="Quản lý ảnh"
          >
            <ImageIcon className="w-4 h-4" />{" "}
            <span className="text-xs font-bold hidden sm:inline">Ảnh</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VenueCard;
