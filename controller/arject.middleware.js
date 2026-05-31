import aj from "../config/arject.js";

const arjectMiddleware=async (req,res,next)=>{
try{
    const decision =await aj.protect(req,{requested:1});
if(decision.isdenied){
    if(decision.reason.isRateLimit()){
      return res.status(429).json({error:'Too many requests. Please try again later.'});  

}
if(decision.reason.isBot()){
    return res.status(403).json({error:'Forbidden: Bot traffic is not allowed'});

}
return res.status(500).json({error:'access denied'});
}
next();

}catch(error){
    console.log(`arject error: ${error}`);
    next(error);


}

}

export default arjectMiddleware;