const { VNPay, ignoreLogger } = require("vnpay");

const getVNPayClient = () => {
  const { VNPAY_TMN_CODE, VNPAY_HASH_SECRET } = process.env;

  if (!VNPAY_TMN_CODE || !VNPAY_HASH_SECRET) {
    throw new Error("Chưa cấu hình VNPAY_TMN_CODE và VNPAY_HASH_SECRET.");
  }

  return new VNPay({
    tmnCode: VNPAY_TMN_CODE,
    secureSecret: VNPAY_HASH_SECRET,
    vnpayHost: process.env.VNPAY_HOST || "https://sandbox.vnpayment.vn",
    testMode: true,
    hashAlgorithm: "SHA512",
    enableLog: false,
    loggerFn: ignoreLogger,
  });
};

const createVNPayPaymentUrl = ({ amount, transactionRef, ipAddress }) => {
  const returnUrl = process.env.VNPAY_RETURN_URL;
  if (!returnUrl) {
    throw new Error("Chưa cấu hình VNPAY_RETURN_URL.");
  }

  return getVNPayClient().buildPaymentUrl({
    vnp_Amount: Number(amount),
    vnp_IpAddr: ipAddress,
    vnp_ReturnUrl: returnUrl,
    vnp_TxnRef: transactionRef,
    vnp_OrderInfo: `Thanh toan dat san ${transactionRef}`,
  });
};

const verifyVNPayReturn = (query) => getVNPayClient().verifyReturnUrl(query);

module.exports = { createVNPayPaymentUrl, verifyVNPayReturn };
