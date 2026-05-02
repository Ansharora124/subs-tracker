import { Router } from "express";
const authRouter=Router();

authRouter.post('sigh-up',(req,res)=> res.send({title:'sign up'}));
authRouter.post('sigh-in',(req,res)=> res.send({title:'sign in'}));
authRouter.post('sigh-out',(req,res)=> res.send({title:'sign out'}));
 export default authRouter;
 