class apiErrors extends Error{

    constructor(statusCode,  errorMessage = "Something went wrong", errors=[] , errorStack){

        super(errorMessage)
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