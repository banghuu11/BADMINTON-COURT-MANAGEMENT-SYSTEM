import { useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";
import {
  MapPin,
  Star,
  Clock,
  Phone,
  ShieldCheck,
  Dumbbell,
  Coffee,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";
import { apiFetch } from "../../services/api";
import fallbackImage from "../../assets/hero.png";

const VenueDetail = () => {
  const user = useAuthStore((state) => state.user);
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("courts"); // courts, services, reviews

  const [venue, setVenue] = useState(null);
  const [courts, setCourts] = useState([]);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const roleId = Number(user?.roleid || user?.roleId || user?.RoleId);

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

  if (roleId === 1) {
    return <Navigate to="/" replace />;
  }

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 dark:bg-background dark:text-slate-300">
        Đang tải dữ liệu...
      </div>
    );
  if (error || !venue)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-red-500 dark:bg-background">
        {error || "Không tìm thấy cơ sở"}
      </div>
    );

  const coverImage = images[0]?.imageurl || venue.mainimage || fallbackImage;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 dark:bg-background">
      <div className="relative h-[360px] overflow-hidden bg-slate-950 md:h-[430px]">
        <img
          src={coverImage}
          alt={venue.venuename}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/45"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-950/20 to-transparent dark:from-background"></div>
      </div>

      <div className="relative z-10 mx-auto -mt-44 max-w-6xl px-5 lg:px-8">
        <Link
          to="/courts"
          className="mb-5 inline-flex items-center gap-2 rounded-md bg-white/95 px-3 py-2 text-sm font-bold text-slate-950 shadow-sm transition-colors hover:bg-primary dark:bg-white dark:text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </Link>

        <div className="mb-8 rounded-lg border border-slate-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-white/95 md:p-8">
          <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded bg-primary px-3 py-1 text-xs font-extrabold uppercase text-on-primary">
                  <ShieldCheck className="h-4 w-4" />
                  Đối tác xác thực
                </span>
              </div>
              <h1 className="max-w-3xl text-3xl font-extrabold tracking-normal text-slate-950 md:text-5xl">
                {venue.venuename}
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
                {venue.description || "Cơ sở đang cập nhật mô tả, thông tin sân và dịch vụ."}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 rounded-md border border-yellow-100 bg-yellow-50 px-4 py-3">
              <Star className="h-6 w-6 fill-yellow-500 text-yellow-500" />
              <div>
                <p className="text-lg font-extrabold leading-none text-slate-950">
                  {venue.rating || "5.0"}
                </p>
                <p className="text-xs font-medium text-slate-500">
                  {venue.reviewscount || 0} đánh giá
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-5 text-sm text-slate-600 md:grid-cols-3">
            <div className="flex items-start gap-2 rounded-md bg-slate-50 p-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{venue.address}</span>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-slate-50 p-3">
              <Clock className="h-4 w-4 shrink-0 text-primary" />
              <span>
                {venue.opentime?.slice(0, 5) || "06:00"} - {venue.closetime?.slice(0, 5) || "23:00"}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-slate-50 p-3">
              <Phone className="h-4 w-4 shrink-0 text-primary" />
              <span>{venue.phonenumber || "Đang cập nhật"}</span>
            </div>
          </div>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto rounded-lg border border-slate-200 bg-white p-1 shadow-sm dark:border-white/10 dark:bg-white/5">
          <button
            onClick={() => setActiveTab("courts")}
            className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-3 text-sm font-bold transition-colors ${activeTab === "courts" ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "text-slate-500 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/10"}`}
          >
            <Dumbbell className="h-4 w-4" /> Danh sách sân
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-3 text-sm font-bold transition-colors ${activeTab === "services" ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "text-slate-500 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/10"}`}
          >
            <Coffee className="h-4 w-4" /> Dịch vụ
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-3 text-sm font-bold transition-colors ${activeTab === "reviews" ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "text-slate-500 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/10"}`}
          >
            <MessageSquare className="h-4 w-4" /> Đánh giá
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
                    className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-slate-300 dark:border-white/10 dark:bg-white/5"
                  >
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-950 dark:text-white">
                        {court.courtname}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {court.surfacetype}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="mb-1 text-xs font-medium text-slate-400">
                        Theo khung giờ
                      </p>
                      <Link
                        to={`/booking/${court.courtid}`}
                        className="inline-block rounded-md bg-slate-950 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-primary hover:text-on-primary dark:bg-white dark:text-slate-950"
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
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5"
                  >
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {service.servicename}
                    </span>
                    <span className="rounded bg-slate-100 px-3 py-1 text-sm font-bold text-slate-950 dark:bg-white dark:text-slate-950">
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
                    className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-200 font-bold text-slate-500">
                          {review.revieweravatar ? (
                            <img src={review.revieweravatar} alt="avatar" />
                          ) : (
                            review.reviewername.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-950 dark:text-white">
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
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                      {review.comment}
                    </p>
                    {review.ownerreply && (
                      <div className="mt-4 rounded-md border border-slate-100 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/10">
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
