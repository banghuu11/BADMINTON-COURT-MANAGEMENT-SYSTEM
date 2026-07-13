import { useState, useEffect } from "react";
import { Star, MessageCircle, Clock, CheckCircle2, User } from "lucide-react";
import { apiFetch } from "../../services/api";

const OwnerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyText, setReplyText] = useState({});
  const [submittingReply, setSubmittingReply] = useState(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/reviews/owner");
      setReviews(data.reviews || []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách đánh giá.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleReplyChange = (reviewId, text) => {
    setReplyText((prev) => ({ ...prev, [reviewId]: text }));
  };

  const submitReply = async (reviewId) => {
    const text = replyText[reviewId];
    if (!text || !text.trim()) return alert("Vui lòng nhập nội dung trả lời.");
    
    setSubmittingReply(reviewId);
    try {
      await apiFetch(`/reviews/${reviewId}/reply`, {
        method: "PATCH",
        body: JSON.stringify({ reply: text.trim() }),
      });
      alert("Đã gửi câu trả lời thành công!");
      fetchReviews(); // Refresh danh sách
    } catch (err) {
      alert(err.message || "Không thể gửi câu trả lời.");
    } finally {
      setSubmittingReply(null);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500 font-bold">Đang tải danh sách đánh giá...</div>;
  }

  if (error) {
    return <div className="p-12 text-center text-red-500 font-bold">{error}</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-12 text-center">
        <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-900 mb-2">Chưa có đánh giá nào</h3>
        <p className="text-slate-500">Các đánh giá của khách hàng về cơ sở của bạn sẽ xuất hiện tại đây.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.reviewid} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Customer Review Side */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden">
                    {review.revieweravatar ? (
                      <img src={review.revieweravatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-slate-500 text-lg">
                        {review.reviewername.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{review.reviewername}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(review.createdat).toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>
                <div className="bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 flex items-center gap-1">
                  <Star className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                  <span className="font-bold text-emerald-700">{review.rating}/5</span>
                </div>
              </div>

              <div className="mb-2">
                <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-md mb-2">
                  Cơ sở: {review.venuename}
                </span>
              </div>
              
              <h5 className="font-bold text-slate-900 text-lg mb-1">{review.title}</h5>
              <p className="text-slate-600">{review.comment}</p>
              
              <div className="flex gap-4 mt-4 text-xs font-medium text-slate-500">
                <span>Sân bãi: <span className="font-bold text-slate-700">{review.courtrating || 5}/5</span></span>
                <span>Dịch vụ: <span className="font-bold text-slate-700">{review.servicerating || 5}/5</span></span>
                <span>Nhân viên: <span className="font-bold text-slate-700">{review.staffrating || 5}/5</span></span>
              </div>
            </div>

            {/* Owner Reply Side */}
            <div className="flex-1 md:border-l md:border-slate-100 md:pl-6">
              {review.ownerreply ? (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 h-full">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span className="font-bold text-slate-900">Phản hồi của bạn</span>
                    <span className="text-xs text-slate-500 ml-auto">
                      {new Date(review.ownerrepliedat).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm italic">"{review.ownerreply}"</p>
                </div>
              ) : (
                <div className="h-full flex flex-col justify-between">
                  <textarea
                    placeholder="Viết phản hồi cho đánh giá này..."
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm h-24 resize-none focus:outline-none focus:border-[#00272C] focus:ring-1 focus:ring-[#00272C]"
                    value={replyText[review.reviewid] || ""}
                    onChange={(e) => handleReplyChange(review.reviewid, e.target.value)}
                  ></textarea>
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={() => submitReply(review.reviewid)}
                      disabled={submittingReply === review.reviewid}
                      className="bg-[#00272C] text-primary px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#003840] transition-colors disabled:opacity-70 flex items-center gap-2"
                    >
                      {submittingReply === review.reviewid ? "Đang gửi..." : "Gửi phản hồi"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OwnerReviews;
