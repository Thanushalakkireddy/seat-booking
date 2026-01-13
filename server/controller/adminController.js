const {prisma} = require('../utils/dbConnector');
exports.getAllUsers = async(req,res) =>{
    try{
        const Data = await prisma.User.findMany({where:{role:'user'}});
        res.status(200).send({status:true,data:Data});
    }catch(err){
         
         res.status(400).send({status:false,message:err});
    }

}
exports.addGenre=async (req,res)=>{
    const {name}=req.body;
    try{
        const genreData=await prisma.genre.create({data:{name}})
        res.status(200).send({data:genreData,status:true,message:"genre created"})
    }
    catch(err){
        res.status(400).send({message:err,status:false});
    }
}
exports.addMovie=async(req,res)=>{
    try{
        const {title,desc,year,url,bannerUrl,genreId, duration, language, releaseDate}=req.body;
        console.log("Received Add Movie Request:", req.body);

        // 1. Validate Required Fields
        if(!title || !year || !genreId || !url || !bannerUrl) {
            return res.status(400).send({status:false, message: "Missing required fields: title, year, genreId, url, bannerUrl"});
        }

        // 2. Type Conversion & Validation
        const parsedYear = parseInt(year);
        if(isNaN(parsedYear)) {
            return res.status(400).send({status:false, message: "Year must be a number"});
        }

        const parsedDuration = duration ? parseInt(duration) : 120;
        if(isNaN(parsedDuration)) {
             return res.status(400).send({status:false, message: "Duration must be a number"});
        }

        let parsedDate = new Date(); // Default to now
        if(releaseDate) {
            parsedDate = new Date(releaseDate);
            if(isNaN(parsedDate.getTime())) { // Check for Invalid Date
                return res.status(400).send({status:false, message: "Invalid Release Date format"});
            }
        }

        // 3. Create Movie
        const movieData=await prisma.Movies.create({data:{
            title,
            desc: desc || "",
            year: parsedYear,
            url,
            bannerUrl,
            genreId, // Prisma will throw error if this is not a valid ObjectID format, which is fine (400)
            duration: parsedDuration,
            language: language || "English",
            releaseDate: parsedDate
        }})
        res.status(200).send({data:movieData,status:true,message:"Movie added Successfully"})
    }
    catch(err){
        console.error("Add Movie Error:", err);
        res.status(400).send({status:false,message:err.message})
    }
    
}

exports.viewGenre=async(req,res)=>{
    try{
        const genreData=await prisma.Genre.findMany();
        res.status(200).send({data:genreData,status:true})
    }
    catch(err){
        res.status(400).send({status:false,message:err})
    }
}

exports.viewMovies=async(req,res)=>{
    try{
        const movieData=await prisma.Movies.findMany({
            include: { genre: true},
        });
        
        // Safety map
        const safeData = movieData.map(m => ({
             ...m,
             duration: m.duration ?? 120,
             language: m.language ?? "English",
             releaseDate: m.releaseDate ?? new Date(),
             genre: m.genre || { name: "Unknown" } // Handle missing genre relation if possible (though Prisma might throw before this)
        }));

        res.status(200).send({data:safeData,status:true})
    }
    catch(err){
        console.error("View Movies Error:", err);
        res.status(400).send({status:false,message:err.message})
    }
}

//edit movie controller 
exports.editMovies = async (req,res)=>{
    const movieId = req.params.id;
    
    if(!movieId || !/^[0-9a-fA-F]{24}$/.test(movieId)) {
         return res.status(400).send({status:false, message: "Invalid Movie ID"});
    }

    const {title,desc, duration, language, releaseDate, url, bannerUrl} = req.body;
    try{
        const updateMovie = await prisma.Movies.update({
            where: {id: movieId},
            data:{
                title,
                desc,
                duration: duration ? parseInt(duration) : undefined,
                language,
                releaseDate: releaseDate ? new Date(releaseDate) : undefined,
                url,
                bannerUrl
            }
        });
        res.status(200).send({status:true,data: updateMovie});
    }catch(err){
        res.status(400).send({status:false,message:err.message});
    }

}

exports.deleteMovie = async (req,res)=>{
    const movieId = req.params.id;

    // Validate ID format
    if (!movieId || !/^[0-9a-fA-F]{24}$/.test(movieId)) {
         return res.status(400).send({status:false, message: "Invalid Movie ID"});
    }

    try{
        // Use transaction to ensure all related data is cleaned up
        // This handles cases where MongoDB Cascade might fail or be inconsistent
        await prisma.$transaction(async (tx) => {
            // 1. Find all shows for this movie
            const shows = await tx.Show.findMany({
                where: { movieId: movieId },
                select: { id: true }
            });
            
            const showIds = shows.map(s => s.id);
            
            if (showIds.length > 0) {
                // 2. Delete all Bookings for these shows
                await tx.Booking.deleteMany({
                    where: { showId: { in: showIds } }
                });
                
                // 3. Delete all Seats for these shows
                await tx.Seat.deleteMany({
                    where: { showId: { in: showIds } }
                });
                
                // 4. Delete the Shows
                await tx.Show.deleteMany({
                    where: { id: { in: showIds } }
                });
            }
            
            // 5. Finally, delete the Movie
            await tx.Movies.delete({
                where: { id: movieId }
            });
        });

        res.status(200).send({status:true, message:'Movie and related data deleted successfully'});
    }
    catch(err){
        console.error("Delete Movie Error:", err);
        res.status(500).send({status:false, message: "Failed to delete movie", error: err.message});
    }
}
exports.deleteGenre = async (req,res)=>{
    console.log(req.params.id);
    const genreId = req.params.id;
    try{
        await prisma.Movies.deleteMany({where:{genreId:genreId}});
        const deleteData = await prisma.Genre.delete({
         where:{id:genreId}
        })
         res.status(201).send({status:true,message:'Deleted Successfully'});
    }catch(err){
         res.status(200).send({status:false,message:err});
    }
}
exports.editGenre = async (req,res)=>{
    const genreId = req.params.id;
    const {name} = req.body;
    try{
        const updateData = await prisma.Genre.update({
         where:{id:genreId},
         data:{name}
        })
         res.status(201).send({data:{status:true,message:"Updated Successfully"}});
    }catch(err){
         res.status(200).send({status:false,message:err});
    }
}

// Theatre Controllers
exports.addTheatre = async (req, res) => {
    try {
        const { name, location, totalSeats, rows, cols } = req.body;
        console.log("Received Add Theatre Request:", req.body);

        if (!name || !location) {
            return res.status(400).send({ status: false, message: "Missing required fields: name, location" });
        }

        const parsedRows = rows ? parseInt(rows) : 10;
        const parsedCols = cols ? parseInt(cols) : 10;
        
        if (isNaN(parsedRows) || isNaN(parsedCols)) {
            return res.status(400).send({ status: false, message: "Rows and Columns must be numbers" });
        }

        // Auto-calculate total seats if not provided, or validate it
        let parsedTotalSeats = totalSeats ? parseInt(totalSeats) : (parsedRows * parsedCols);
        if (isNaN(parsedTotalSeats)) {
             parsedTotalSeats = parsedRows * parsedCols;
        }

        const theatre = await prisma.Theatre.create({
            data: {
                name,
                location,
                totalSeats: parsedTotalSeats,
                rows: parsedRows,
                cols: parsedCols
            }
        });
        res.status(200).send({ status: true, data: theatre, message: "Theatre added successfully" });
    } catch (err) {
        console.error("Add Theatre Error:", err);
        res.status(400).send({ status: false, message: err.message });
    }
};

exports.viewTheatre = async (req, res) => {
    try {
        const theatres = await prisma.Theatre.findMany();
        res.status(200).send({ status: true, data: theatres });
    } catch (err) {
        res.status(400).send({ status: false, message: err.message });
    }
};

exports.editTheatre = async (req, res) => {
    const { id } = req.params;
    const { name, location, totalSeats, rows, cols } = req.body;
    try {
        const theatre = await prisma.Theatre.update({
            where: { id },
            data: {
                name,
                location,
                totalSeats: totalSeats ? parseInt(totalSeats) : undefined,
                rows: rows ? parseInt(rows) : undefined,
                cols: cols ? parseInt(cols) : undefined
            }
        });
        res.status(200).send({ status: true, data: theatre, message: "Theatre updated successfully" });
    } catch (err) {
        res.status(400).send({ status: false, message: err.message });
    }
};

exports.deleteTheatre = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.Theatre.delete({ where: { id } });
        res.status(200).send({ status: true, message: "Theatre deleted successfully" });
    } catch (err) {
        res.status(400).send({ status: false, message: err.message });
    }
};

// Show Controllers
exports.addShow = async (req, res) => {
    try {
        const { movieId, theatreId, startTime } = req.body;
        console.log("Received Add Show Request:", req.body);

        if(!movieId || !theatreId || !startTime) {
            return res.status(400).send({status: false, message: "Missing required fields: movieId, theatreId, startTime"});
        }

        const start = new Date(startTime);
        if(isNaN(start.getTime())) {
             return res.status(400).send({status: false, message: "Invalid Start Time format"});
        }
        
        const movie = await prisma.Movies.findUnique({where: {id: movieId}});
        if(!movie) return res.status(404).send({status: false, message: "Movie not found"});
        
        const theatre = await prisma.Theatre.findUnique({where: {id: theatreId}});
        if(!theatre) return res.status(404).send({status: false, message: "Theatre not found"});
        
        const show = await prisma.Show.create({
            data: {
                movieId,
                theatreId,
                startTime: start
            }
        });

        // Generate Seats
        const seats = [];
        const rows = theatre.rows || 10;
        const cols = theatre.cols || 10;
        const rowLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        
        for(let r=0; r<rows; r++){
            for(let c=1; c<=cols; c++){
                seats.push({
                    showId: show.id,
                    seatNumber: `${rowLabels[r % 26]}${c}`,
                    row: rowLabels[r % 26],
                    col: c,
                    status: 'available'
                });
            }
        }
        
        if(seats.length > 0){
             await prisma.Seat.createMany({data: seats});
        }

        res.status(200).send({ status: true, data: show, message: "Show created and seats generated" });
    } catch (err) {
        console.error("Add Show Error:", err);
        // Better Prisma Error Handling
        if (err.code === 'P2002') {
             return res.status(400).send({ status: false, message: "A show already exists at this time for this theatre and movie." });
        }
        res.status(400).send({ status: false, message: err.message });
    }
};

exports.viewShows = async (req, res) => {
    try {
        const shows = await prisma.Show.findMany({
            include: {
                movie: true,
                theatre: true
            }
        });
        res.status(200).send({ status: true, data: shows });
    } catch (err) {
        res.status(400).send({ status: false, message: err.message });
    }
};

exports.editShow = async (req, res) => {
    const { id } = req.params;
    const { movieId, theatreId, startTime } = req.body;
    try {
        const data = {};

        if (movieId) {
            data.movieId = movieId;
        }

        if (theatreId) {
            data.theatreId = theatreId;
        }

        if (startTime) {
            const start = new Date(startTime);
            if (isNaN(start.getTime())) {
                return res.status(400).send({ status: false, message: "Invalid Start Time format" });
            }
            data.startTime = start;
        }

        const show = await prisma.Show.update({
            where: { id },
            data
        });

        res.status(200).send({ status: true, data: show, message: "Show updated successfully" });
    } catch (err) {
        res.status(400).send({ status: false, message: err.message });
    }
};

exports.deleteShow = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.Show.delete({ where: { id } });
        res.status(200).send({ status: true, message: "Show deleted successfully" });
    } catch (err) {
        res.status(400).send({ status: false, message: err.message });
    }
};
