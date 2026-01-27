const validator = require('validator');
const validate = (data)=>{
    
 const mandatoryFields = ['FirstName','EmailId','password'];
 const Isallowed = mandatoryFields.every((k)=> Object.keys(data).includes(k));
 
 if(!Isallowed){
    throw new Error(`Missing mandatory fields: ${mandatoryFields.join(', ')}`);
 }
 if(!validator.isEmail(data.EmailId)){
    throw new Error('Invalid EmailId format');
 }      
 if(!validator.isStrongPassword(data.password)){
    throw new Error('Password is not strong enough');
 }
}
module.exports = validate;