import mongoose from "mongoose";
const connectToDataBase = async () => {
    try {
        const { connection } = await mongoose.connect(process.env.URI);
        console.log(`Server started with ${connection.host}`);
    }
    catch (error) {
        if (error instanceof Error)
            console.log(error.message);
        else
            console.log(error);
    }
};
export default connectToDataBase;
