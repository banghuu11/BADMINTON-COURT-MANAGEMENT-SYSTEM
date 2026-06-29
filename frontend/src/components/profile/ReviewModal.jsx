import { MessageSquare, X, Star } from "lucide-react";

const ReviewModal = ({
  isOpen,
  onClose,
  reviewForm,
  setReviewForm,
  onSubmit,
  submittingReview,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#00272C]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-[#00272C]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl text-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="text-primary w-6 h-6" /> Đánh giá Cơ sở
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/15 p-1.5 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="text-center">
            <p className="text-sm font-bold text-slate-300 mb-3">
              Bạn cảm thấy trải nghiệm thế nào?
            </p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${star <= reviewForm.rating ? "text-yellow-400 fill-yellow-400" : "text-white/10"}`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-bold mb-1.5">
              Chia sẻ thêm (Tùy chọn)
            </label>
            <textarea
              rows="4"
              value={reviewForm.comment}
              onChange={(e) =>
                setReviewForm({ ...reviewForm, comment: e.target.value })
              }
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary text-white resize-none placeholder-slate-500"
              placeholder="Sân sạch đẹp, nhân viên nhiệt tình..."
            ></textarea>
          </div>

          <div className="pt-4 border-t border-white/5 flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-300 bg-white/10 hover:bg-white/20 border border-white/5 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submittingReview}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm text-[#00272C] bg-primary hover:bg-[#C6D632] transition-colors shadow-lg shadow-primary/20 flex items-center gap-2 ${submittingReview ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ReviewModal;

