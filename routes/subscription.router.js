import { Router } from "express";

const subsRouter=Router();


subsRouter.get('/',(req,res)=>res.send({title:'get all subscription'}));

subsRouter.get('/:id',(req,res)=>res.send({title:'get subs detail'}));

subsRouter.post('/',(req,res)=>res.send({title:'create subscription'}));

subsRouter.put('/:id',(req,res)=>res.send({title:'update subscription'}));

subsRouter.delete('/:id',(req,res)=>res.send({title:'delete subscription'}));

subsRouter.get('/user/:id',(req,res)=>res.send({title:'get all user subscription '}));

subsRouter.put('/:id/cancel',(req,res)=>res.send({title:'cancel subscription'}));

subsRouter.get('/upcoming-renewels',(req,res)=>res.send({title:'tell subscription renewels'}));


export default subsRouter;