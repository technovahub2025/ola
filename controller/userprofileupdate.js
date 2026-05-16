const  profile=require('../model/registermodel')

const userprofile= async(req ,res)=>{
    try {
        const {name,email,phone}=req.body;

        if(!name || !email || !phone){
            return res.status(400).json({message:"All field are required"});
        }

        const profileupdate =await profile.findByIdAndUpdate(
            req.params.id,
            {name,email,phone},
            {new:true}
        )

        if(!profileupdate){
            return res.status(404).json({message:"user not found"});
        }

        res.status(200).json({
            message:"profile updated successfully",
        })
    } catch(error){
        res.status(500).json({
            message:"profile update failed",
        });
    }
}

exports.userprofile=userprofile;