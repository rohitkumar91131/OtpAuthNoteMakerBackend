
import jwt from 'jsonwebtoken'



const verifyToken = (req , res , next) =>{
    const jwt_token = req.cookies.jwt_token;

    if(!jwt_token ){
        return res.json({
            success : false,
            msg : "No Access found"
        })
    }
    try{
        const jwt_token_decoded = jwt.verify(jwt_token , process.env.JWT_SECRET)
        if(!jwt_token_decoded){
            return res.json({
                success : false,
                msg : "Token expired"
            })
        }
        req.user = jwt_token_decoded;
        next();
    }
    catch(err){
        res.json({
            success : false,
            msg : err.message
        })
    }
}

export default verifyToken