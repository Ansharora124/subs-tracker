import mongoose from "mongoose";
import {DB_URI,NODE_ENV} from '../config/env.js';

if(!DB_URI){
    throw new Error('please define mondo db uri');

}

const connectToDatabase=async()=>{
    try{
        await mongoose.connect(DB_URI);

        console.log(`connected to database in ${NODE_ENV} mode`);

    }
    catch(error){
        console.log('error in connecting database: ',error );

        process.exit(1);
    }

}