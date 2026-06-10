import Subscription from '../models/subscription.model.js';
import {workflowClient} from '../config/upstash.js';
import {serverURL} from '../config/env.js';

export const createSubscription=async (req,res,next)=>{
try{
    const subscription=await Subscription.create({
        ...req.body,
        user:req.user._id,
         
    });

    let workflowRunId = null;
    let workflowErrorMessage = null;

    try {
        const triggerResult = await workflowClient.trigger({
            url: `${serverURL}/api/v1/workflow/subscription/reminders`,
            body: { subscriptionId: subscription._id.toString() },
        });
        workflowRunId = triggerResult.workflowRunId;
        console.log(`Workflow triggered for subscription ${subscription._id}. Run ID: ${workflowRunId}`);
    } catch (workflowError) {
        // Keep subscription creation successful even if workflow trigger fails.
        workflowErrorMessage = workflowError.message;
        console.error(`Workflow trigger failed for subscription ${subscription._id}:`, workflowError.message);
    }

res.status(201).json({
    success:true,
    data:subscription,
    workflow:{
        triggered:Boolean(workflowRunId),
        workflowRunId,
        error:workflowErrorMessage,
    },
}); 
}catch(e){
 next(e);


}
}

export const getUserSubscriptions=async (req,res,next)=>{
try{
if(req.user.id!==req.params.id){
   const error =new Error('Unauthorized');
    error.statusCode=401;
   throw error;


}
const subscriptions=await Subscription.find({user:req.params.id});
res.status(200).json({success:true,data:subscriptions});

}catch(e){
next(e);
}



}