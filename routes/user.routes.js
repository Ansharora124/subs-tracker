import { Router } from "express";

const userRouter =Router();

userRouter.get('/',(req,res)=>res.send({title:'to get all users'}));

userRouter.get('/:id',(req,res)=>res.send({title:'to user details'}));

userRouter.post('/',(req,res)=>res.send({title:'to create new users'}));

userRouter.put('/:id',(req,res)=>res.send({title:'to update user'}));

userRouter.delete('/:id',(req,res)=>res.send({title:'to delete user'}));

export default userRouter;
