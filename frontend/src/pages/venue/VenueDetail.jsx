import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin,
  Star,
  Clock,
  Phone,
  ShieldCheck,
  Dumbbell,
  Coffee,
  MessageSquare,
} from "lucide-react";
import { apiFetch } from "../../services/api";

const VenueDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("courts"); // courts, services, reviews

  const [venue, setVenue] = useState(null);
  const [courts, setCourts] = useState([]);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVenueDetails = async () => {
      try {
        setLoading(true);
        // Gọi 5 API đồng thời để giảm thời gian chờ
        const [venueData, courtsData, servicesData, reviewsData, imagesData] =
          await Promise.all([
            apiFetch(`/venues/${id}`),
            apiFetch(`/courts/venue/${id}`),
            apiFetch(`/services/venue/${id}`),
            apiFetch(`/reviews/venue/${id}`),
            apiFetch(`/venues/${id}/images`),
          ]);

        setVenue(venueData.venue);
        setCourts(courtsData.courts || []);
        setServices(servicesData.services || []);
        setReviews(reviewsData.reviews || []);
        setImages(imagesData.images || []);
      } catch (err) {
        setError(err.message || "Không thể tải thông tin cơ sở.");
      } finally {
        setLoading(false);
      }
    };

    fetchVenueDetails();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
        Đang tải dữ liệu...
      </div>
    );
  if (error || !venue)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-red-500">
        {error || "Không tìm thấy cơ sở"}
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Hero Cover */}
      <div className="relative h-64 md:h-80 bg-slate-900 overflow-hidden">
        {images.length > 0 ? (
          <img
            src={images[0].imageurl}
            alt="Cover"
            className="absolute inset-0 w-full h-full object-cover opacity-70"
          />
        ) : (
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/40 via-[#0b1c30] to-[#0b1c30]"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-900/20 to-transparent"></div>
      </div>

      <div className="max-w-5xl mx-auto px-5 -mt-32 relative z-10">
        {/* Venue Info Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-md">
                  Đối tác xác thực
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900">
                {venue.venuename}
              </h1>
            </div>
            <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-2xl border border-yellow-100">
              <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              <div>
                <p className="text-lg font-bold text-slate-900 leading-none">
                  {venue.rating}
                </p>
                <p className="text-[10px] text-slate-500 font-medium">
                  ({venue.reviewscount} đánh giá)
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600 mb-6">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />{" "}
              <span>{venue.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />{" "}
              <span>
                Mở cửa: {venue.opentime && venue.opentime.slice(0, 5)} -{" "}
                {venue.closetime && venue.closetime.slice(0, 5)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" />{" "}
              <span>{venue.phonenumber || "Đang cập nhật"}</span>
            </div>
          </div>
          <p className="text-slate-600 leading-relaxed border-t border-slate-100 pt-6">
            {venue.description || "Chưa có mô tả cho cơ sở này."}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-slate-200 mb-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("courts")}
            className={`pb-4 px-2 font-bold text-sm flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 ${activeTab === "courts" ? "border-primary text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"}`}
          >
            <Dumbbell className="w-4 h-4" /> Danh sách Sân
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`pb-4 px-2 font-bold text-sm flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 ${activeTab === "services" ? "border-primary text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"}`}
          >
            <Coffee className="w-4 h-4" /> Dịch vụ & Nước
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-4 px-2 font-bold text-sm flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 ${activeTab === "reviews" ? "border-primary text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"}`}
          >
            <MessageSquare className="w-4 h-4" /> Đánh giá
          </button>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === "courts" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courts.length > 0 ? (
                courts.map((court) => (
                  <div
                    key={court.courtid}
                    className="bg-white border border-slate-200 p-5 rounded-2xl flex justify-between items-center hover:border-primary/50 transition-colors group"
                  >
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">
                        {court.courtname}
                      </h3>
                      <p className="text-slate-500 text-sm">
                        {court.surfacetype}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 font-medium mb-1">
                        Theo khung giờ
                      </p>
                      <Link
                        to={`/booking/${court.courtid}`}
                        className="inline-block bg-slate-100 hover:bg-primary text-slate-700 hover:text-[#0b1c30] px-4 py-2 rounded-lg text-xs font-bold transition-colors"
                      >
                        Chọn giờ
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 col-span-full text-center py-8">
                  Cơ sở này chưa cập nhật danh sách sân.
                </p>
              )}
            </div>
          )}

          {activeTab === "services" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {services.length > 0 ? (
                services.map((service) => (
                  <div
                    key={service.serviceid}
                    className="bg-white border border-slate-100 p-4 rounded-2xl flex justify-between items-center shadow-sm"
                  >
                    <span className="font-semibold text-slate-700">
                      {service.servicename}
                    </span>
                    <span className="font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg text-sm">
                      {Number(service.unitprice).toLocaleString()}đ
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 col-span-full text-center py-8">
                  Cơ sở này chưa bán dịch vụ nào.
                </p>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div
                    key={review.reviewid}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold overflow-hidden">
                          {review.revieweravatar ? (
                            <img src={review.revieweravatar} alt="avatar" />
                          ) : (
                            review.reviewername.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">
                            {review.reviewername}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(review.createdat).toLocaleDateString(
                              "vi-VN",
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                        <span className="font-bold text-yellow-600 text-xs">
                          {review.rating}
                        </span>
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm mt-3">
                      {review.comment}
                    </p>
                    {review.ownerreply && (
                      <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <p className="text-xs font-bold text-primary mb-1">
                          Chủ sân phản hồi:
                        </p>
                        <p className="text-sm text-slate-600">
                          {review.ownerreply}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-slate-900 font-bold mb-2">
                    Chưa có đánh giá nào
                  </h3>
                  <p className="text-slate-500 text-sm">
                    Hãy là người đầu tiên trải nghiệm và đánh giá cơ sở này nhé!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VenueDetail;
