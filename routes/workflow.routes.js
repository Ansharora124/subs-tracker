import { Router} from 'express';
import { sendReminders, testReminderEmail } from '../controller/workflow.controler.js'

const workflowRouter = Router();

workflowRouter.post('/subscription/reminder', sendReminders);
workflowRouter.post('/test-email', testReminderEmail);

export default workflowRouter;
