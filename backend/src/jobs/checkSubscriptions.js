const cron = require('node-cron');
const pool = require('../config/db');
const { createNotification } = require('../utils/notificationHelper');

const initCronJobs = (app) => {
  // Chạy mỗi ngày vào lúc 00:00 (nửa đêm)
  cron.schedule('0 0 * * *', async () => {
    console.log('[CronJob] Bắt đầu quét kiểm tra Gói Dịch Vụ...');
    const client = await pool.connect();
    
    try {
      await client.query("BEGIN");

      const today = new Date();
      // Loại bỏ giờ/phút/giây để so sánh chính xác ngày
      today.setHours(0, 0, 0, 0);

      const in3Days = new Date(today);
      in3Days.setDate(in3Days.getDate() + 3);

      const in1Day = new Date(today);
      in1Day.setDate(in1Day.getDate() + 1);

      // 1. Quét các gói Sắp hết hạn (Còn 3 ngày hoặc 1 ngày)
      const expiringQuery = `
        SELECT os.*, sp.PlanName 
        FROM OwnerSubscription os
        JOIN SubscriptionPlan sp ON os.PlanId = sp.PlanId
        WHERE os.Status = 'Active'
      `;
      const activeSubs = await client.query(expiringQuery);

      for (const sub of activeSubs.rows) {
        const endDate = new Date(sub.enddate);
        endDate.setHours(0, 0, 0, 0);
        
        const diffTime = endDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 3 || diffDays === 1) {
          // Nhắc nhở sắp hết hạn
          await createNotification(
            app,
            sub.ownerid,
            "Gói dịch vụ sắp hết hạn",
            `Gói dịch vụ ${sub.planname} của bạn sẽ hết hạn sau ${diffDays} ngày nữa (${endDate.toLocaleDateString('vi-VN')}). Vui lòng gia hạn để không bị gián đoạn.`,
            "System"
          );
        } else if (diffDays < 0) {
          // 2. Quét các gói Đã hết hạn (EndDate < Today)
          await client.query("UPDATE OwnerSubscription SET Status = 'Expired' WHERE SubscriptionId = $1", [sub.subscriptionid]);
          
          await createNotification(
            app,
            sub.ownerid,
            "Gói dịch vụ đã hết hạn",
            `Gói dịch vụ ${sub.planname} của bạn đã hết hạn. Hệ thống đã tạm khóa một số tính năng quản lý. Vui lòng gia hạn ngay!`,
            "System"
          );
          console.log(`[CronJob] Đã khóa gói ID: ${sub.subscriptionid} của Owner: ${sub.ownerid}`);
        }
      }

      await client.query("COMMIT");
      console.log('[CronJob] Hoàn thành quét kiểm tra Gói Dịch Vụ.');
    } catch (error) {
      await client.query("ROLLBACK");
      console.error('[CronJob] Lỗi quét Gói Dịch Vụ:', error);
    } finally {
      client.release();
    }
  });
};

module.exports = initCronJobs;
