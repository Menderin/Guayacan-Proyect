import express from 'express';
import { connectMongoDB, seedDatabase } from '../database/mongodb/init';

const app = express();
const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await connectMongoDB();

        await seedDatabase();

        app.listen(PORT, () =>{
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);

        });   
    } catch (error) {
        console.error('❌ Error iniciando el servidor:', error);
        process.exit(1);
    }
}

startServer();