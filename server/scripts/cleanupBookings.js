const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupBadBookings() {
  console.log("🧹 Starting Booking Cleanup...");

  try {
    // 1. Use raw MongoDB command to delete bookings with null showId
    // note: In Prisma + MongoDB, the collection name is typically the model name. 
    // If you haven't used @@map, it's likely "Booking".
    
    console.log("🔍 Deleting bookings with showId = null...");
    const resultNull = await prisma.$runCommandRaw({
      delete: "Booking",
      deletes: [
        { q: { showId: null }, limit: 0 }
      ]
    });
    console.log("✅ Deleted (null):", resultNull);

    // 2. Delete bookings where showId is missing completely
    console.log("🔍 Deleting bookings with missing showId...");
    const resultMissing = await prisma.$runCommandRaw({
        delete: "Booking",
        deletes: [
          { q: { showId: { $exists: false } }, limit: 0 }
        ]
      });
      console.log("✅ Deleted (missing):", resultMissing);

    console.log("🎉 Cleanup Complete. API should now be stable.");

  } catch (error) {
    console.error("❌ Cleanup Failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupBadBookings();
