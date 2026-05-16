const  registermodel =require("../model/registermodel");


const paymentMethod = async(req,res)=>{

    const  {name,email,phone,paymentMethod}=req.body;


    if(!name || !email || !phone || !paymentMethod){

        res.stats(400).json({message:"All field are required"});
    }

    try{

        const payment=new registermodel({

            name,
            email,
            phone,
            paymentMethod
        })


        await payment.save();
    }

    catch(error)
    {
        res.staus(500).json({message:"Failed to save "});
    }


    res.status(201).json({
        message:"payment  completed sucessfully",
        paymentMethod:paymentMethod,
        message:"pathu drive pannu pa tambi",
    })

}

module.exports=paymentMethod;