const crypto = require("crypto");
const { SePayPgClient } = require("sepay-pg-node");

const getConfig = () => {
  const merchantId = process.env.SEPAY_MERCHANT_ID;
  const secretKey = process.env.SEPAY_SECRET_KEY;
  if (!merchantId || !secretKey) {
    throw new Error("Chưa cấu hình SEPAY_MERCHANT_ID và SEPAY_SECRET_KEY.");
  }
  return { merchantId, secretKey };
};

const getClient = () => {
  const { merchantId, secretKey } = getConfig();
  return new SePayPgClient({
    env: process.env.SEPAY_ENV || "sandbox",
    merchant_id: merchantId,
    secret_key: secretKey,
  });
};

const createCheckout = ({
  invoiceCode,
  amount,
  description,
  customerId,
  successUrl,
  errorUrl,
  cancelUrl,
}) => {
  const client = getClient();
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const checkoutUrl = client.checkout.initCheckoutUrl();
  const fields = client.checkout.initOneTimePaymentFields({
    operation: "PURCHASE",
    payment_method: "BANK_TRANSFER",
    order_invoice_number: invoiceCode,
    order_amount: Number(amount),
    currency: "VND",
    order_description: description,
    customer_id: customerId,
    success_url: successUrl || `${frontendUrl}/my-subscription?payment=success`,
    error_url: errorUrl || `${frontendUrl}/my-subscription?payment=error`,
    cancel_url: cancelUrl || `${frontendUrl}/my-subscription?payment=cancel`,
  });
  return { checkoutUrl, fields };
};

const verifyIpnSecret = (receivedSecret) => {
  const { secretKey } = getConfig();
  const received = Buffer.from(String(receivedSecret || ""));
  const expected = Buffer.from(secretKey);
  return received.length === expected.length && crypto.timingSafeEqual(received, expected);
};

module.exports = { createCheckout, verifyIpnSecret };
