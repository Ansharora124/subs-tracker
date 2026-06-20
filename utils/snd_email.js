import { emailTemplates } from "./email.templates.js";
import transporter,{ accountEmail } from '../config/nodemailer.js';
import dayjs from 'dayjs';

export const sendReminderEmail= async({to,type,subscription,subject})=>{
if(!to||!type||!subscription) throw new Error("missing req parameter");

const template=emailTemplates.find((t)=>t.label===type);

if(!template) throw new Error("invalid email type");

const mailInfo={
    userName:subscription.user.name,
    subscriptionName:subscription.name,
    renewalDate:dayjs(subscription.renewalDate).format('MMMM D, YYYY'),
    planName:subscription.name,
    price:`${subscription.currency} ${subscription.price} (${subscription.frequency})`,
    paymentMethod:subscription.paymentMethod,



}
const message =template.generateBody(mailInfo);
const emailSubject=subject ?? template.generateSubject(mailInfo);

const mailOptions={
    from:accountEmail,
    to:to,
    subject:emailSubject,
    html:message,
}


transporter.sendMail(mailOptions,(error,info)=>{
    if(error) return console.error('Error sending email:',error);
    console.log('Email sent:'+info.response);
})
}
