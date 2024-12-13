/*
const asyncHandler = async function (req,res,next) {

    try{

     const result = await func(req,res,next);
      return result

    }catch(error){
        res.status(err.code || 500).json({
            success:false,
            message: err.message
        })
    }
    
}
    */


const asyncHandler = (func) => { 
    
   return (req,res,next) =>{

    Promise
      .resolve(func(req,res,next))
      .catch((err) => next(err))
  }

}


export {asyncHandler}