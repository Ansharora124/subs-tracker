import { Router } from "express";

import { getUser, getUsers } from "../controller/user.controller.js";
import  authorized  from "../middleware/auth.middleware.js";


const userRouter =Router();

userRouter.get('/',getUsers);

userRouter.get('/:id',authorized,getUser);

userRouter.post('/',(req,res)=>res.send({title:'to create new users'}));

userRouter.put('/:id',(req,res)=>res.send({title:'to update user'}));

userRouter.delete('/:id',(req,res)=>res.send({title:'to delete user'}));

export default userRouter;
