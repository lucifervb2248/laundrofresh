
const express=require("express")
const app=express()

var bodyParser=require("body-parser")
var mongoose=require("mongoose")
const collection=require("./mongodb")
let alert = require('alert');
const ejs=require("ejs");
const collectio = require("./mongodb")
app.set('view engine', 'ejs');

app.use(bodyParser.json())
app.use(express.static('templates'))
app.use(bodyParser.urlencoded({extended:true}))
var db=mongoose.connection;
app.use(bodyParser.json());
app.get("/",(req,res)=>{
    res.redirect('login.html');
}) 



app.post("/login",async(req,res)=>{
    regno= req.body.regno
    const user = await db.collection('login').findOne({ regno:regno });
    try {
       
        const user = await db.collection('login').findOne({ regno:regno });
        if (user) {
          
          if ( req.body.password == user.password) {
            
            res.render('dashboard',{use:user});

          } else {
            alert( "Password doesn't match" );
          }
        } else {
          alert("User doesn't exist" );
        }
        app.get('/dashboard', async ( req , res) => {
            const user = await db.collection('login').findOne({ regno:regno });
           
            res.render('dashboard',{use:user});
            


        
        });
        app.get('/order', async(req, res) => {
                const user = await db.collection('login').findOne({ regno:regno });
                res.render('order',{use:user});
                app.post('/order',async(req,res)=>{
                    const user = await db.collection('login').findOne({ regno:regno });
                    console.log(user.order);
                    price=16*req.body.text;
                    
const date = new Date();

let currentDay= String(date.getDate()).padStart(2, '0');

let currentMonth = String(date.getMonth()+1).padStart(2,"0");

let currentYear = date.getFullYear();



let currentDate = `${currentDay}-${currentMonth}-${currentYear}`;




                    try{
                        const order=({
                            regno:regno,
                            type:req.body.type,
                            noofclothes:req.body.text,
                            price:price,
                            orderplacedon:currentDate,
                            status:"Not paid",
                            paidon:""
                        });
                    
                        const result=await db.collection('orderhistory').insertOne(order);
                        console.log(
                            `A document was inserted with the _id: ${result.insertedId}`,
                         );
                       
                            const resul=await db.collection("orderhistory").aggregate([{$match:{
                              regno:regno}},{$match:{status:"Not paid"}},
                              
                            ]
                            
                                
                            
                              ).toArray();
                              let amt=0;
                              for(let i=0;i<resul.length;i++){
                                
                                    amt+=parseInt(resul[i].price);
                            
                            }
                              
                            await db.collection("login").updateOne({regno:regno},{$set:{paymentpending:amt,orders:++user.orders}});

                        res.redirect("order_success.html");
                        }catch(error){
                            console.log(error.message);
                        }
                }
                );
                });
                app.get('/history',async (req, res) => {
                    
                    const user = await db.collection('login').findOne({ regno:regno });
                    
                        console.log("hello");
                    const users=await db.collection("orderhistory").find({regno:regno}).toArray();
                       
                      res.render('history', { us:users,use:user});
                  
            
                    
                    });
                    app.get('/profile', async(req, res) => {
                        const user = await db.collection('login').findOne({ regno:regno });
                        res.render('profile',{use:user});
                        
                        
                        app.post("/profile",async(req,res)=>{
                            try{
                                const user=(
                                    {
                                    mobileno:req.body.mobileno,
                                    roomno:req.body.roomno,
                                    block:req.body.block,
                                    password:req.body.password
                        
                                });
                                if(user){
                                    if(req.body.password==req.body.cpassword){
                                        
                                        const result=await db.collection("login").updateOne({regno:regno},{$set:{mobileno:req.body.mobileno,roomno:req.body.roomno,block:req.body.block,password:req.body.password}});
                                        alert("Changed Successfully");
                                        
                                    }
                                    else{
                                        alert("Password is not same");
                                    }
                                }
                            }
                            catch(error){
                                console.log(error.message);
                            }
                            }
                        
                        );
                    });
        } catch (error) {
       
      }
      
   
}
)



app.post('/dashboard',function(req,res){
    const user =  db.collection('login').findOne({ regno:regno });
    
        res.render('payment');
    
   
    
   

});

app.post('/payment',async(req,res)=>{
                   
    const date = new Date();

let currentDay= String(date.getDate()).padStart(2, '0');

let currentMonth = String(date.getMonth()+1).padStart(2,"0");

let currentYear = date.getFullYear();



let currentDate = `${currentDay}-${currentMonth}-${currentYear}`;
await db.collection("login").updateOne({regno:regno},{$set:{paymentpending:"0"}});
const users=await db.collection("orderhistory").find({regno:regno}).toArray();
for(let i=0;i<users.length;i++){
    if(users[i].status!="Paid"){
        console.log("hi");
        await db.collection("orderhistory").updateOne({regno:regno,_id:users[i]._id},{$set:{status:"Paid",paidon:currentDate}});
    }}
res.redirect("pay_success.html");


});
app.post("/signup",async(req,res)=>{

        try{
            const user=({
                regno:req.body.regno,
                name:req.body.name,
                mobileno:req.body.mobileno,
                roomno:req.body.roomno,
                block:req.body.block,
                password:req.body.password,
                orders:"0",
                paymentpending:"0"
            });
            const result=await db.collection("login").insertOne(user);
            console.log(
                `A document was inserted with the _id: ${result.insertedId}`,
             );
            if(user){
                if(req.body.password==req.body.cpassword){
                    
                    alert("Registered Successfully");
                    res.redirect("login.html");
                   
                }
                else{
                    alert("Password is not same");
                }
            
            }

        }
        catch(error){
            console.log(error.message);
        }
    }

)
app.listen(3000,()=>{
    console.log("port connected");


})