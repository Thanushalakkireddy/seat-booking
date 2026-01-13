const cron = require('node-cron');
const { prisma } = require('../utils/dbConnector');

const cleanupExpiredTempBookings = async () => {
  try {
    const now = new Date();
    // Release expired locks
    // We only target 'locked' seats that have passed their expiration time
    const result = await prisma.Seat.updateMany({
      where: {
        status: 'locked',
        lockExpiresAt: { lt: now }
      },
      data: {
        status: 'available',
        lockedBy: null,
        lockExpiresAt: null
      }
    });
    
    if (result.count > 0) {
      console.log(`[Cron] Released ${result.count} expired seats at ${now.toISOString()}`);
    }
  } catch (err) {
    console.error('[Cron] Error cleaning up expired temporary bookings:', err);
  }
};

// Schedule the task
const startSeatCleanupJob = () => {
    // Run every 30 seconds: */30 * * * * *
    // Standard cron is 5 fields (minutes), but node-cron supports 6 for seconds optional.
    // Let's use every minute to be safe with standard cron syntax if we ever switch, 
    // but for node-cron specifically, we can do 30s.
    // Let's stick to every minute for "System Design" stability (polling too fast is bad).
    // Or if we want real-time, we use 30s. Let's do 30s as per original code.
    cron.schedule('*/30 * * * * *', cleanupExpiredTempBookings);
    console.log('[Cron] Seat cleanup job scheduled (every 30 seconds).');
};

module.exports = { startSeatCleanupJob, cleanupExpiredTempBookings };
