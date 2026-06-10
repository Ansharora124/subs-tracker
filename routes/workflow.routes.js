import {Router} from "express";
import {sendReminders} from "../controller/workflow.controler.js";
const workflowRouter = Router();

workflowRouter.use("/subscription/reminders",sendReminders);


export default workflowRouter;