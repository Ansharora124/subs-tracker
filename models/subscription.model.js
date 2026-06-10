import mongoose from "mongoose";
const subscriptionSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'subscription name is req'],
        trim:true,
        minLength:2,
        maxLength:50,
    },
    price:{
        type:Number,
        required:[true,'subscription price is req'],
        min:[0,'price must be positive number'],



    },
   
    currency:{
        type:String,
        enum:['USD','EUR','GBP','INR'],
        default:'USD',

         
    },

    frequency:{
        type:String,
        enum:['daily','weekly','monthly','yearly'],
       
    },

    category:{
        type:String,
        enum:['entertainment','education','health','fitness','other'],
        required:true,
    },

    paymentMethod:{
        type:String,
        required:true,
        trim:true,

    },
    status:{
        type:String,
        enum:['active','inactive','cancelled'],
        default:'active',
    },
    startDate:{
        type:Date,
        required:true,
        validate:{
            validator:(value) =>value <=new Date(),
            message:'start date cannot be in the future',
        }

    },
    
     renewalDate:{
        type:Date,
        required:true,
        validate:{
            validator:function (value) {
                return value > this.startDate;
            },
            message:'renewal date must be after start date ',
        }

    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
        index:true,
    }


},{timestamps:true} );
subscriptionSchema.pre('save',function () {
if(!this.renewalDate){
    const renewalPeriods={
        daily:1,
        weekly:7,
        monthly:30,
        yearly:365,

    };
    this.renewalDate=new Date(this.startDate);
    this.renewalDate.setDate(this.renewalDate.getDate()+renewalPeriods[this.frequency]);

    }
    if(this.renewalDate < new Date()){
this.status='inactive';


    }
});
const Subscription=mongoose.model('Subscription',subscriptionSchema);
export default Subscription;
