import mongoose from "mongoose";
// db connect
export const connectDb: () => Promise<void> = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI environment variable is not defined");
        }
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log("Connection to DB established");
        
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log(`Error connecting to DB ${error.message}`)
        } else {
            console.log(`Unknown errror connecting to DB ${error}`); 
        }
        process.exit(1);
    }
} 