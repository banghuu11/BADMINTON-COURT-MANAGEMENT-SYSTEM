import { useMemo, useState, useEffect } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import {
  Building2,
  Clock,
  Crosshair,
  ExternalLink,
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import { apiFetch } from "../../services/api";
import useAuthStore from "../../store/useAuthStore";
import fallbackImage from "../../assets/hero.png";

const venueMarkerIcon = L.divIcon({
  className: "courtsync-map-marker",
  html: `
    <div class="courtsync-map-pin">
      <svg width="44" height="54" viewBox="0 0 44 54" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M22 52C22 52 40 32.7 40 20.5C40 9.73 31.94 2 22 2C12.06 2 4 9.73 4 20.5C4 32.7 22 52 22 52Z" fill="#10b981" stroke="#ffffff" stroke-width="3"/>
        <circle cx="22" cy="20" r="7" fill="#ffffff"/>
      </svg>
    </div>
  `,
  iconSize: [44, 54],
  iconAnchor: [22, 52],
  popupAnchor: [0, -48],
});

const toRadians = (value) => (value * Math.PI) / 180;

const getVenuePosition = (venue) => {
  const lat = Number(venue.latitude);
  const lng = Number(venue.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
};

const getQueryPosition = (searchParams) => {
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
};

const getDistanceKm = (from, to) => {
  if (!from || !to) return null;
  const earthRadiusKm = 6371;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

const formatDistance = (distanceKm) => {
  if (distanceKm == null) return null;
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${distanceKm.toFixed(1)} km`;
};

const getGoogleMapsUrl = (venue) => {
  const position = getVenuePosition(venue);
  if (position) {
    return `https://www.google.com/maps/search/?api=1&query=${position.lat},${position.lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${venue.venuename || ""} ${venue.address || ""}`.trim(),
  )}`;
};

const FitVenueBounds = ({ venues, userLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (venues.length === 0 && !userLocation) return;

    if (venues.length === 0 && userLocation) {
      map.setView(userLocation, 14);
      return;
    }

    if (venues.length === 1 && !userLocation) {
      map.setView(venues[0].position, 14);
      return;
    }

    const points = venues.map((venue) => venue.position);
    if (userLocation) points.push(userLocation);
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [36, 36] });
  }, [map, venues, userLocation]);

  return null;
};

const VenueLeafletMap = ({ venues, userLocation }) => {
  const venuesWithPosition = useMemo(
    () =>
      venues
        .map((venue) => ({ ...venue, position: getVenuePosition(venue) }))
        .filter((venue) => venue.position),
    [venues],
  );

  const center = venuesWithPosition[0]?.position || [10.7761, 106.6713];

  return (
    <div className="h-full w-full relative overflow-hidden rounded-2xl shadow-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-900 z-10">
      {venuesWithPosition.length > 0 ? (
        <MapContainer
          center={center}
          zoom={12}
          scrollWheelZoom={false}
          className="absolute inset-0 z-0 h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitVenueBounds
            venues={venuesWithPosition}
            userLocation={userLocation}
          />
          {userLocation && (
            <CircleMarker
              center={userLocation}
              radius={9}
              pathOptions={{
                color: "#00272c",
                fillColor: "#38bdf8",
                fillOpacity: 0.95,
                weight: 3,
              }}
            >
              <Popup>
                <div className="text-sm font-bold text-slate-950">
                  Vị trí của bạn
                </div>
              </Popup>
            </CircleMarker>
          )}
          {venuesWithPosition.map((venue) => (
            <Marker
              key={venue.venueid}
              position={venue.position}
              icon={venueMarkerIcon}
            >
              <Popup>
                <div className="min-w-[180px] space-y-2">
                  <p className="font-bold text-slate-950">
                    {venue.venuename || "Sân cầu lông"}
                  </p>
                  <p className="text-xs text-slate-600">
                    {venue.address || "Chưa cập nhật địa chỉ"}
                  </p>
                  <Link
                    to={`/venue/${venue.venueid}`}
                    className="inline-block text-xs font-bold text-slate-950 hover:text-primary transition-colors"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
            <MapPin className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">
            Bản đồ sân cầu lông
          </h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
            Các cơ sở hiện tại chưa có tọa độ để đánh dấu trên bản đồ.
          </p>
        </div>
      )}
    </div>
  );
};

const Courts = () => {
  const user = useAuthStore((state) => state.user);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("location") || "",
  );
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const roleId = Number(user?.roleid || user?.roleId || user?.RoleId);

  const requestUserLocation = ({ syncUrl = true } = {}) => {
    if (!navigator.geolocation) {
      setLocationError("Trình duyệt không hỗ trợ lấy vị trí.");
      return;
    }

    setIsLocating(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(nextLocation);
        if (syncUrl) {
          const params = new URLSearchParams(searchParams);
          params.set("near", "1");
          params.set("lat", String(nextLocation.lat));
          params.set("lng", String(nextLocation.lng));
          setSearchParams(params, { replace: true });
        }
        setIsLocating(false);
      },
      (geoError) => {
        const message =
          geoError.code === geoError.PERMISSION_DENIED
            ? "Bạn chưa cho phép truy cập vị trí. Bấm 'Tìm gần tôi' để thử lại."
            : "Không lấy được vị trí hiện tại của bạn.";
        setLocationError(message);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5 * 60 * 1000,
      },
    );
  };

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setLoading(true);
        const data = await apiFetch("/venues/all");
        setVenues(data.venues || []);
      } catch (err) {
        setError(err.message || "Không thể tải danh sách cơ sở sân.");
      } finally {
        setLoading(false);
      }
    };
    fetchVenues();
  }, []);

  useEffect(() => {
    const queryPosition = getQueryPosition(searchParams);
    if (queryPosition) {
      setUserLocation(queryPosition);
      setLocationError("");
      return;
    }

    if (searchParams.get("near") === "1") {
      requestUserLocation({ syncUrl: true });
    }
  }, [searchParams]);

  useEffect(() => {
    const locationQuery = searchParams.get("location") || "";
    setSearchQuery(locationQuery);
  }, [searchParams]);

  const filteredVenues = useMemo(() => {
    const keyword = searchQuery.toLowerCase();
    return venues
      .filter(
        (venue) =>
          (venue.venuename || "").toLowerCase().includes(keyword) ||
          (venue.address || "").toLowerCase().includes(keyword),
      )
      .map((venue) => {
        const position = getVenuePosition(venue);
        return {
          ...venue,
          distanceKm: getDistanceKm(userLocation, position),
        };
      })
      .sort((a, b) => {
        if (!userLocation) return 0;
        if (a.distanceKm == null && b.distanceKm == null) return 0;
        if (a.distanceKm == null) return 1;
        if (b.distanceKm == null) return -1;
        return a.distanceKm - b.distanceKm;
      });
  }, [searchQuery, userLocation, venues]);

  if (roleId === 1) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="animate-fade-in pb-24 text-slate-950 dark:text-white">
      <section className="border-b border-slate-200 bg-white dark:border-white/10 dark:bg-background">
        <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
          <div className="mb-7 max-w-3xl">
            <p className="mb-3 inline-flex items-center gap-2 rounded bg-primary px-3 py-1 text-xs font-extrabold text-on-primary">
              <Building2 className="h-4 w-4" />
              Tìm kiếm sân
            </p>
            <h1 className="text-4xl font-extrabold tracking-normal text-slate-950 dark:text-white">
              Tìm sân cầu lông phù hợp gần bạn
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Nhập tên sân, quận hoặc địa chỉ. Bật vị trí để CourtLink ưu tiên
              các sân gần bạn nhất.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="grid grid-cols-1 gap-2 lg:grid-cols-[1fr_auto_auto]">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên sân, quận hoặc địa chỉ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-14 w-full rounded-lg border border-transparent bg-white pl-14 pr-4 text-base font-semibold text-slate-950 shadow-sm placeholder:text-slate-400 focus:border-slate-950 focus:outline-none dark:bg-slate-950 dark:text-white dark:focus:border-white"
                />
              </div>

              <button
                type="button"
                onClick={requestUserLocation}
                disabled={isLocating}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 text-sm font-extrabold text-white transition-colors hover:bg-primary hover:text-on-primary disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
              >
                <Crosshair className="h-5 w-5" />
                {isLocating ? "Đang lấy vị trí..." : "Tìm gần tôi"}
              </button>

              <button className="inline-flex h-14 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 transition-colors hover:border-slate-950 hover:text-slate-950 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300">
                <SlidersHorizontal className="h-5 w-5" />
                <span className="lg:hidden xl:inline">Bộ lọc</span>
              </button>
            </div>

            <div className="flex flex-col gap-2 px-2 pb-1 pt-3 text-xs font-semibold sm:flex-row sm:items-center sm:justify-between">
              {userLocation ? (
                <span className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Đã bật vị trí, sân gần nhất được ưu tiên hiển thị.
                </span>
              ) : locationError ? (
                <span className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  {locationError}
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                  Trình duyệt sẽ hỏi quyền vị trí để gợi ý sân gần nhất.
                </span>
              )}
              <span className="text-slate-400">
                {filteredVenues.length} kết quả phù hợp
              </span>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[1400px] px-5 py-8 lg:px-8">
        <div className="flex flex-col-reverse lg:flex-row gap-8 items-start">
          
          {/* Left Side: Venue List */}
          <div className="flex-1 w-full space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                {filteredVenues.length} cơ sở phù hợp
              </p>
              <p className="hidden text-sm text-slate-400 sm:block">
                Cập nhật từ hệ thống CourtLink
              </p>
            </div>

            {loading && (
              <div className="flex flex-col items-center gap-3 py-20 text-center text-slate-500">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-sm font-semibold">Đang tải danh sách sân...</p>
              </div>
            )}

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-4 text-center text-sm font-semibold text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                {error}
              </div>
            )}

            {!loading && !error && filteredVenues.length === 0 && (
              <div className="rounded-lg border border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                Không tìm thấy cơ sở sân nào phù hợp.
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {filteredVenues.map((venue) => (
                <Link
                  to={`/venue/${venue.venueid}`}
                  key={venue.venueid}
                  className="group flex flex-col h-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20"
                >
                  <div className="relative h-44 shrink-0 overflow-hidden bg-slate-200">
                    <img
                      src={venue.mainimage || fallbackImage}
                      alt={venue.venuename}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded bg-white/95 px-2.5 py-1 text-xs font-bold text-slate-950 shadow-sm">
                      {venue.rating || "5.0"}
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-xs font-bold uppercase text-primary">
                        {venue.distanceKm != null
                          ? `Cách bạn ${formatDistance(venue.distanceKm)}`
                          : "Cơ sở đang hoạt động"}
                      </p>
                      <h3 className="mt-1 truncate text-lg font-extrabold text-white">
                        {venue.venuename}
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-col flex-1 p-4">
                    <p className="line-clamp-2 flex min-h-10 items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {venue.address}
                    </p>
                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100 dark:border-white/10">
                      <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <Clock className="h-4 w-4" />
                        {venue.opentime?.slice(0, 5) || "06:00"} - {venue.closetime?.slice(0, 5) || "23:00"}
                      </span>
                      <span className="rounded bg-slate-950 px-3 py-2 text-xs font-bold text-white transition-colors group-hover:bg-primary group-hover:text-white dark:bg-white dark:text-slate-950">
                        Chi tiết
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side: Sticky Map Container */}
          <div className="w-full lg:w-[450px] xl:w-[500px] shrink-0 lg:sticky lg:top-[90px] h-[350px] lg:h-[calc(100vh-120px)]">
            {!loading && !error && filteredVenues.length > 0 ? (
              <VenueLeafletMap venues={filteredVenues} userLocation={userLocation} />
            ) : (
              <div className="h-full w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-8 text-center text-slate-400">
                {loading ? "Đang tải bản đồ..." : "Chưa có dữ liệu bản đồ"}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Courts;
