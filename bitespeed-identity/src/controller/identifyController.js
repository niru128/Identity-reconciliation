import { reconcileIdentity } from "../service/identityService.js";

export const identifyContact = async (req , res)=>{
    try{

        const {email = null , phoneNumber = null} = req.body;

        if(!email && !phoneNumber){
            res.status(400).json({error : "Phone number and email is required"})
        }

        const result = await reconcileIdentity(email , phoneNumber);

        res.status(200).json(result)

    }catch(error){
        res.status(500).json({error: 'An error occurred while reconciling identity.'});
        console.log(error);
    }
}