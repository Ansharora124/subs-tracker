import nodemailer from 'nodemailer';
import './env.js';

export const accountEmail='ansharora13b@gmail.com';
const transporter=nodemailer.createTransport({
    service : 'gmail',
    auth :{
        user:accountEmail
        ,
        pass:process.env.EMAIL_PASSWORD
    }

    
})  

export default transporter;