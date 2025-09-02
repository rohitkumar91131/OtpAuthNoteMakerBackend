
import jwt from 'jsonwebtoken';

const verifyEmailVerification = (req , res , next) =>{
    const email_verified_cookie = req.cookies.email_verified;
    if(!email_verified_cookie){
        return res.json({
            success : false,
            msg : "Verification expired"
        })
    }

    try{
        console.log(process.env.JWT_SECRET)
        const email_verified_cookie_decoded = jwt.verify(email_verified_cookie  , process.env.JWT_SECRET);
        if(!email_verified_cookie_decoded){
            return res.json({
                success : false,
                msg : "Verification expired"
            })
        }
        req.email = email_verified_cookie_decoded
        next();

    }
    catch(err){
        res.json({
            success : false,
            msg : err.message
        })
    }
}

export default verifyEmailVerification