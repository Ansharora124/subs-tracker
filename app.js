import express from 'express';
import {PORT} from './config/env.js';
import errorMiddleware from './middleware/error.middleware.js';
import cookieParser from 'cookie-parser';
import connectToDatabase from './database/mongodb.js';
import arjectMiddleware from './controller/arject.middleware.js';

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
app.use(errorMiddleware);
app.use(arjectMiddleware);

app.get('/',(req,res)=>{
    res.send({body: "welcome to subs api "});
});

const startServer = async () => {
  await connectToDatabase();

  app.listen(PORT, () => {
    console.log(`subs tracker api is running on http://localhost:${PORT}`);
  });
};

startServer();
export default app;