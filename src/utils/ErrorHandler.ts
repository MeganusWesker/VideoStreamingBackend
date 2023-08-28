class ErrorHandler extends Error{

    constructor( message:string,public statusCode:number,public code?:number){
        super(message);
    }
}

export default ErrorHandler;