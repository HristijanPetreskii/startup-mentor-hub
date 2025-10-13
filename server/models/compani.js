const mongoose=require('mongoose')


const CompanySchema=new mongoose.Schema({
    name: String,
    email : String,
    password : String,
    representative : String,
    address : String
})

const CompanyModel=mongoose.model('compani',CompanySchema)
module.exports=CompanyModel