class apiErrors extends Error{

    constructor(statusCode,  errors, errorMessage = "Something went wrong", errorStack){

        super(errors)
        this.statusCode=statusCode
        this.data=null
        this.success=false
        this.errors = errors

        if(errorStack){
            this.errorStack= errorStack
        }
        else{
            Error.captureStackTrace(this,this.constructor)
        }
        
    }
}

export {apiErrors}