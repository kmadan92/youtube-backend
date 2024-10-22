const asyncHandler = (func) = async (req,res,next) => {

    try{

        await func(req,res,next);

    }catch(error){
        res.status(err.code || 500).json({
            success:false,
            message: err.message
        })
    }
    
}

/*-----Alternate way using Promise
const asyncHandler = (func) = (req,res,next) =>{

    Promise
    .resolve(func(req,res,next))
    .catch(next(err))
}
---------------------*/

export {asyncHandler}