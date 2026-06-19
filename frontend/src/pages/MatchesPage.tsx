import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useMatches,
  useVenues,
  useCourtsByVenue,
} from "../hooks/booking/useMatches";

const MatchesPage = () => {
  const navigate = useNavigate();
  const { matches, isLoading, joinMatch, createMatch, isJoining, isCreating } =
    useMatches();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    courtId: "",
    playDate: "",
    startTime: "",
    endTime: "",
  });

  // State quản lý việc chọn Cơ sở
  const [selectedVenueId, setSelectedVenueId] = useState("");
  const { data: venues = [] } = useVenues();
  const { data: courts = [], isLoading: isLoadingCourts } =
    useCourtsByVenue(selectedVenueId);

  const handleJoin = (waitId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn tham gia trận đấu này?")) {
      joinMatch(waitId);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMatch({
      courtId: Number(formData.courtId),
      playDate: formData.playDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
    });
    setShowCreateForm(false);
  };

  if (isLoading)
    return (
      <div className="text-center mt-10">Đang tải dữ liệu giao lưu...</div>
    );

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Cộng đồng Giao lưu / Kèo ghép
        </h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          {showCreateForm ? "Hủy tạo" : "+ Đăng tin tìm người"}
        </button>
      </div>

      {/* Form đăng tin (hiện khi bấm nút) */}
      {showCreateForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white p-5 rounded-lg mb-6 shadow-md border"
        >
          <h2 className="text-lg mb-4 font-semibold text-gray-700">
            Tạo kèo ghép mới
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Cơ sở</label>
              <select
                required
                className="w-full border border-gray-300 p-2 rounded bg-white"
                value={selectedVenueId}
                onChange={(e) => {
                  setSelectedVenueId(e.target.value);
                  setFormData({ ...formData, courtId: "" }); // Reset chọn sân khi đổi cơ sở
                }}
              >
                <option value="" disabled>
                  -- Chọn cơ sở --
                </option>
                {venues?.map((v: any) => (
                  <option key={v.VenueId} value={v.VenueId}>
                    {v.VenueName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sân</label>
              <select
                required
                disabled={!selectedVenueId || isLoadingCourts}
                className="w-full border border-gray-300 p-2 rounded bg-white disabled:bg-gray-100 disabled:text-gray-400"
                value={formData.courtId}
                onChange={(e) =>
                  setFormData({ ...formData, courtId: e.target.value })
                }
              >
                <option value="" disabled>
                  -- Chọn sân --
                </option>
                {courts?.map((c: any) => (
                  <option key={c.CourtId} value={c.CourtId}>
                    {c.CourtName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Ngày chơi
              </label>
              <input
                type="date"
                required
                className="w-full border border-gray-300 p-2 rounded"
                value={formData.playDate}
                onChange={(e) =>
                  setFormData({ ...formData, playDate: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Giờ bắt đầu
              </label>
              <input
                type="time"
                required
                className="w-full border border-gray-300 p-2 rounded"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Giờ kết thúc
              </label>
              <input
                type="time"
                required
                className="w-full border border-gray-300 p-2 rounded"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isCreating}
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700 disabled:opacity-50"
          >
            {isCreating ? "Đang xử lý..." : "Xác nhận tạo kèo"}
          </button>
        </form>
      )}

      {/* Danh sách kèo ghép */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!matches || matches.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center py-10 bg-gray-50 rounded-lg">
            Hiện tại chưa có ai tìm người giao lưu. Bạn hãy là người đầu tiên
            tạo kèo!
          </p>
        ) : (
          matches?.map((match: any) => (
            <div
              key={match.waitid}
              className="border border-gray-200 p-5 rounded-xl shadow-sm bg-white hover:shadow-md transition"
            >
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={
                    match.avatarurl ||
                    "https://ui-avatars.com/api/?name=" + match.fullname
                  }
                  alt={match.fullname}
                  className="w-12 h-12 rounded-full border border-gray-300"
                />
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {match.fullname}
                  </h3>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                    Đang tìm đồng đội
                  </span>
                </div>
              </div>
              <div className="text-sm space-y-2 mb-5 text-gray-600">
                <p>
                  <strong className="text-gray-800">Cơ sở:</strong>{" "}
                  {match.venuename}
                </p>
                <p>
                  <strong className="text-gray-800">Địa chỉ:</strong>{" "}
                  {match.address}
                </p>
                <p>
                  <strong className="text-gray-800">Sân:</strong>{" "}
                  {match.courtname}
                </p>
                <p>
                  <strong className="text-gray-800">Ngày:</strong>{" "}
                  {new Date(match.playdate).toLocaleDateString("vi-VN")}
                </p>
                <p>
                  <strong className="text-gray-800">Thời gian:</strong>{" "}
                  <span className="text-green-600 font-medium">
                    {match.starttime?.slice(0, 5)} -{" "}
                    {match.endtime?.slice(0, 5)}
                  </span>
                </p>
                <p>
                  <strong className="text-gray-800">Trình độ:</strong>{" "}
                  <span className="text-gray-600">
                    {match.skilllevel || "Chưa cập nhật"}
                  </span>
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleJoin(match.waitid)}
                  disabled={isJoining}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 font-medium transition disabled:opacity-50"
                >
                  {isJoining ? "Đang xử lý..." : "Tham gia ngay"}
                </button>
                <button
                  onClick={() => navigate(`/booking/${match.courtid}`)}
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 font-medium transition"
                >
                  Đến đặt sân
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MatchesPage;
