import { Router } from "express";
import authorized from "../middleware/auth.middleware.js";
import {createSubscription} from "../controller/subscription.controler.js";
import {getUserSubscriptions} from "../controller/subscription.controler.js";
const subsRouter=Router();


subsRouter.get('/',(req,res)=>res.send({title:'get all subscription'}));

subsRouter.get('/:id',(req,res)=>res.send({title:'get subs detail'}));

subsRouter.post('/',authorized,createSubscription);

subsRouter.put('/:id',(req,res)=>res.send({title:'update subscription'}));

subsRouter.delete('/:id',(req,res)=>res.send({title:'delete subscription'}));

subsRouter.get('/user/:id',authorized,getUserSubscriptions);

subsRouter.put('/:id/cancel',(req,res)=>res.send({title:'cancel subscription'}));

subsRouter.get('/upcoming-renewels',(req,res)=>res.send({title:'tell subscription renewels'}));


export default subsRouter;