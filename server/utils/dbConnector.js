const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()

const ConnectDB = async ()=>{
    try{
    const check = await prisma.$connect();
    console.log('DB connected');
    }catch(err){
        console.log(err);
    }
}
module.exports ={prisma,ConnectDB};