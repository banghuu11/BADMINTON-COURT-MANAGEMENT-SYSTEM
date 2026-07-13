const crypto = require('crypto');

// Cấu hình từ .env
const partnerCode = process.env.MOMO_PARTNER_CODE || "MOMOBKUN20180529";
const accessKey = process.env.MOMO_ACCESS_KEY || "klm05TvNCpe7cgkG";
const secretKey = process.env.MOMO_SECRET_KEY || "at67qH6A1Vu9564P11PWeXqS4h1xM93i";
const momoEndpoint = "https://test-payment.momo.vn/v2/gateway/api/create";
const redirectUrl = process.env.MOMO_REDIRECT_URL || "http://localhost:5173/owner/subscriptions/momo-return";
const ipnUrl = process.env.MOMO_IPN_URL || "http://localhost:3000/api/payment/momo-ipn";

const createMomoPaymentUrl = async (orderId, amount, orderInfo) => {
  const requestId = partnerCode + new Date().getTime();
  const extraData = "";
  const requestType = "payWithMethod"; // Dùng để chọn Momo QR hoặc Momo App

  // Tạo signature
  const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
  
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex');

  const requestBody = {
    partnerCode,
    partnerName: "CourtSync System",
    storeId: "MomoTestStore",
    requestId,
    amount,
    orderId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    lang: "vi",
    requestType,
    autoCapture: true,
    extraData,
    signature
  };

  try {
    const response = await fetch(momoEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    const result = await response.json();
    return result.payUrl;
  } catch (error) {
    console.error("Lỗi khi gọi API MoMo:", error);
    throw new Error("Không thể kết nối đến MoMo");
  }
};

module.exports = {
  createMomoPaymentUrl
};
