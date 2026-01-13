const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugMovies() {
  console.log("--- DEBUGGING MOVIES ---");
  try {
    // 1. Check Genres
    const genres = await prisma.genre.findMany();
    console.log(`Found ${genres.length} genres.`);
    const genreIds = new Set(genres.map(g => g.id));

    // 2. Check Movies (Raw-ish)
    // We try to fetch without include first to see if basic fetch works
    const movies = await prisma.movies.findMany();
    console.log(`Found ${movies.length} movies.`);

    // 3. Check for Data Integrity
    const invalidMovies = [];
    const nullFields = [];

    movies.forEach(m => {
      // Check Genre Relation
      if (!genreIds.has(m.genreId)) {
        invalidMovies.push({
            id: m.id, 
            title: m.title, 
            invalidGenreId: m.genreId
        });
      }

      // Check Non-Nullable Fields (based on Schema)
      // Title, Desc, Year, Url, BannerUrl are required strings/ints
      if (!m.title) nullFields.push(`${m.id}: title is null`);
      if (!m.year) nullFields.push(`${m.id}: year is null`);
      if (!m.url) nullFields.push(`${m.id}: url is null`);
      if (!m.bannerUrl) nullFields.push(`${m.id}: bannerUrl is null`);
    });

    if (invalidMovies.length > 0) {
      console.error("\nCRITICAL: Found movies with INVALID Genre IDs (Foreign Key Mismatch):");
      console.table(invalidMovies);
    } else {
        console.log("\n✅ All movies have valid Genre IDs.");
    }

    if (nullFields.length > 0) {
        console.error("\nCRITICAL: Found movies with NULL required fields:");
        console.log(nullFields);
    } else {
        console.log("\n✅ All movies have required fields.");
    }

    // 4. Test the problematic query (with include)
    console.log("\nTesting 'viewAllMovies' query (findMany with include genre)...");
    try {
        const fullMovies = await prisma.movies.findMany({
            include: { genre: true }
        });
        console.log(`✅ Query successful. Retrieved ${fullMovies.length} movies with genre.`);
    } catch (err) {
        console.error("❌ Query FAILED:", err.message);
    }

  } catch (err) {
    console.error("❌ FATAL ERROR:", err);
  } finally {
    await prisma.$disconnect();
  }
}

debugMovies();