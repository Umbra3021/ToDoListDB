const express= require("express");
const bodyPaser =require("body-parser");
const _=require("lodash");
const app =express();
app.set('view engine', 'ejs');
app.use(bodyPaser.urlencoded({extended:true}));
app.use(express.static(__dirname+'/public'));

const mongoose = require('mongoose');                              //required fr connections
 
main().catch(err => console.log(err));
 
async function main()  {
  await mongoose.connect('mongodb+srv://gam3rsw0rd:gam3rsw0rd@cluster0.aqnothn.mongodb.net/?retryWrites=true&w=majority');
  console.log("Connected");

  const itemsSchema={                                           //schema for home route
    name:String
  };

  const Item=mongoose.model("Item",itemsSchema);                //model for home route
  const item1=new Item({                                        
    name:"John"
  });
  const item2=new Item({
    name:"Rosa"                                                  //default items 
  });
  const item3=new Item({
    name:"Jasmine"
  });

  const defaultItems= [item1,item2,item3];

  const ListSchema ={                                              //schema for custom route
    name:String,
    items:[itemsSchema]
  };

  const List =mongoose.model("List",ListSchema);

  app.get("/",function(req,res){                                    //saving for home route

    Item.find()
    .then(function(foundItems){
      if(foundItems.length===0){

        Item.insertMany(defaultItems)
          .then(function(){
            console.log("Successfully saved into our DB.");
          })
          .catch(function(err){
            console.log(err);
          });
          res.redirect("/");
      }
      else{
        console.log("Successfully Saved");
      }


      res.render("lists",{ex1: "Today", newList: foundItems});  
    })
  
    .catch(err => {
      console.error(err);
    })

  });


  app.get("/:custom",function(req,res){                      //creating or locating in custom route
    const customName =_.capitalize(req.params.custom);

    List.findOne({name:customName})
    .then(function(foundList){
      if(!foundList){
        const list =new List({
          name:customName,
          items:defaultItems
        });
        list.save();
        console.log("Saved");
        res.redirect("/"+custom);
      }
      else{
        res.render("lists",{ex1:foundList.name,newList:foundList.items});
      }
      })
      .catch(function(err){});
      });
    
      
    
      

  app.post("/", (req, res) => {
    let itemName = req.body.newItem
    let listName = req.body.list.trim()  // Remove leading/trailing spaces
    const item = new Item({
        name: itemName,
    })

    if(listName === "Today")
    {
      item.save()
      res.redirect("/")
    } 
      else 
      {            
        List.findOne({ name: listName }).exec()
        .then(foundList => {
          if (foundList) 
          {
          foundList.items.push(item)
          foundList.save()
          res.redirect("/" + listName) 
          } 
          else
          {
          const newList = new List({
            name: listName,
            items: [item],
            })
            newList.save()
            res.redirect("/" + listName)
            }
        })
        .catch(err => {
                console.log(err);
            });
  
        }
  
      })
  
  
 
      app.post("/delete", function(req,res){
        const checkedItemID = req.body.checkbox;
        const listName = req.body.listName;
       
        if ( listName === "Today"){
          Item.findByIdAndRemove(checkedItemID).then(function(){
            console.log("Sucessful removed");
          }) .catch(function(err){
            console.log("err");
          }); 
        
          res.redirect("/");
        } 
        
        else {
          List.findOneAndUpdate({name: listName}, {$pull:{ items:{_id:checkedItemID }}}, {new: true}).then(function(foundlist){
            res.redirect("/" + listName);
          }).catch( err => console.log(err));
          
      }        
      });
      





}


app.listen(3000,function(){
    console.log("Server started");
}); 
