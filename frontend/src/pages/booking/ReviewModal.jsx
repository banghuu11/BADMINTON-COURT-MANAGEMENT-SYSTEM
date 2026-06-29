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
    <div className="fixed inset-0 bg-[#00272C]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="text-primary w-6 h-6" /> Đánh giá Cơ sở
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="text-center">
            <p className="text-sm font-bold text-slate-700 mb-3">
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
                    className={`w-10 h-10 ${star <= reviewForm.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200"}`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-bold mb-1.5">
              Chia sẻ thêm (Tùy chọn)
            </label>
            <textarea
              rows="4"
              value={reviewForm.comment}
              onChange={(e) =>
                setReviewForm({ ...reviewForm, comment: e.target.value })
              }
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900 resize-none"
              placeholder="Sân sạch đẹp, nhân viên nhiệt tình..."
            ></textarea>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 bg-slate-200 hover:bg-slate-300 transition-colors"
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
