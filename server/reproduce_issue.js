
const axios = require('axios');
const jwt = require('jsonwebtoken');

// Config
const BASE_URL = 'http://localhost:8060';
const SECRET_KEY = process.env.JWT_SECRET_TOKEN || 'secret_token'; 

// Mock Users
const userA = { email: 'userA@test.com', pass: 'passA' };
const userB = { email: 'userB@test.com', pass: 'passB' };

async function register(user) {
    try {
        await axios.post(`${BASE_URL}/api/user/register`, {
            name: user.email.split('@')[0],
            email: user.email,
            pass: user.pass
        });
        console.log(`Registered ${user.email}`);
    } catch (err) {
        // console.log(`Register error (maybe exists): ${err.message}`);
    }
}

async function login(user) {
    try {
        const res = await axios.post(`${BASE_URL}/api/user/login`, {
            email: user.email,
            pass: user.pass
        });
        console.log(`Logged in ${user.email}, Token length: ${res.data.token.length}`);
        return res.data.token;
    } catch (err) {
        console.error(`Login failed for ${user.email}:`, err.response?.data || err.message);
        throw err;
    }
}

async function runTest() {
    console.log("=== STARTING ISOLATION TEST ===");
    
    // 1. Register Users
    await register(userA);
    await register(userB);
    
    // 2. Login Users
    const tokenA = await login(userA);
    const tokenB = await login(userB);
    
    // 3. Verify Tokens are Different
    if (tokenA === tokenB) {
        console.error("❌ CRITICAL FAIL: Tokens are identical!");
        process.exit(1);
    } else {
        console.log("✅ Tokens are unique.");
    }
    
    // 4. Decode Tokens to verify ID
    const decodedA = jwt.decode(tokenA);
    const decodedB = jwt.decode(tokenB);
    
    console.log(`User A ID: ${decodedA.id}`);
    console.log(`User B ID: ${decodedB.id}`);
    
    if (decodedA.id === decodedB.id) {
        console.error("❌ CRITICAL FAIL: User IDs are identical!");
        process.exit(1);
    } else {
        console.log("✅ User IDs are unique.");
    }
    
    let realMovieId;
    try {
        const moviesRes = await axios.get(`${BASE_URL}/api/user/viewAllMovies`);
        if (moviesRes.data.length > 0) {
            realMovieId = moviesRes.data[0].id;
        } else {
            console.log("No movies found, skipping seat lock test.");
            return;
        }
    } catch (err) {
        console.error("Failed to fetch movies:", err.message);
        return;
    }
    
    console.log(`Using Movie ID: ${realMovieId}`);
    
    // User A locks Seat A1
    try {
        await axios.post(`${BASE_URL}/api/user/temp-booking`, 
            { movieId: realMovieId, seats: ["A1"] },
            { headers: { Authorization: `Bearer ${tokenA}` } }
        );
        console.log("✅ User A locked Seat A1");
    } catch (err) {
        console.error("User A failed to lock:", err.response?.data || err.message);
    }
    
    // User B tries to lock Seat A1 (Should fail)
    try {
        await axios.post(`${BASE_URL}/api/user/temp-booking`, 
            { movieId: realMovieId, seats: ["A1"] },
            { headers: { Authorization: `Bearer ${tokenB}` } }
        );
        console.error("❌ FAIL: User B locked Seat A1 (Should be forbidden)");
    } catch (err) {
        if (err.response?.status === 403) {
            console.log("✅ User B correctly blocked from locking Seat A1 (403 Forbidden)");
        } else {
            console.error(`User B failed with unexpected error: ${err.response?.status}`);
        }
    }
    
    // User B locks Seat A2
    try {
        await axios.post(`${BASE_URL}/api/user/temp-booking`, 
            { movieId: realMovieId, seats: ["A2"] },
            { headers: { Authorization: `Bearer ${tokenB}` } }
        );
        console.log("✅ User B locked Seat A2");
    } catch (err) {
        console.error("User B failed to lock A2:", err.response?.data || err.message);
    }
    
    const seatsRes = await axios.get(`${BASE_URL}/api/user/booked-seats/${realMovieId}`);
    const pending = seatsRes.data.pendingSeats;
    
    const seatA1 = pending.find(s => s.seatId === "A1");
    const seatA2 = pending.find(s => s.seatId === "A2");
    
    console.log("Checking Ownership:");
    console.log(`Seat A1 Owner: ${seatA1?.userId} (Expected: ${decodedA.id})`);
    console.log(`Seat A2 Owner: ${seatA2?.userId} (Expected: ${decodedB.id})`);
    
    if (seatA1?.userId === decodedA.id && seatA2?.userId === decodedB.id) {
        console.log("✅ Backend correctly isolates User A and User B actions.");
    } else {
        console.error("❌ FAIL: Backend ownership mismatch!");
    }

    console.log("=== TEST COMPLETE ===");
}

runTest();
