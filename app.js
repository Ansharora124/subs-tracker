import express from 'express';
import {PORT} from './config/env.js';
import middleware from './middleware/index.js';
import cookieParser from 'cookie-parser';

import authRouter from './routes/auth.routes.js';
import subsRouter from './routes/subscription.router.js';
import userRouter from './routes/user.routes.js';

const app=express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.use('/api/v1/auth',authRouter);
app.use('/api/v1/users',userRouter);
app.use('/api/v1/subscription',subsRouter);
app.use(middleware.errorMiddleware);

app.get('/',(req,res)=>{
    res.send({body: "welcome to subs api "});
});

app.listen(PORT, () => {
  console.log("subs tracker api is running on http://localhost:${PORT}");
});
export default app;