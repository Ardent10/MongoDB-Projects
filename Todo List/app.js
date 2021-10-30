// jshint esversion:6

// const bodyParser = require("body-parser");
const express    = require("express");
const mongoose   = require("mongoose");
const _          = require("lodash");
const date       = require(__dirname + "/date.js");

mongoose.connect("mongodb+srv://grey:test123@cluster0.eibao.mongodb.net/todoListDB");

const app = express();
app.set('view engine', 'ejs');

app.use(express.urlencoded({
  extended: true
}));
app.use(express.static("public"));

// making the itemsSchema and inserting some initial elements to it
const itemSchema = {
  name: String
};

const Item = mongoose.model("Item",itemSchema);

const Buyfood = new Item({
  name: "Buy Food"
});

const Cookfood = new Item({
  name: "Cook Food"
});

const Eatfood = new Item({
  name: "Eat Food"
});

const defaultItems = [Buyfood,Cookfood,Eatfood];

// making the listSchema
const listSchema = {
  name:String,
  items: [itemSchema]
}

let day = date.getDay();
const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {


  Item.find({},function(err, foundItems){
    if(foundItems.length===0){
          Item.insertMany(defaultItems, function(err){
          if(err){
           console.log(err);
          }
          else
          {
            console.log("Successfully inserted "+defaultItems.length+" items")
          }
          res.redirect("/");
      })
    }
    else
    {
      // console.log(foundItems);  
      res.render("list", {
        listTitle: day,
        newListItems: foundItems
      });
    }
  });

});

app.get("/:CustomListName",function(req,res){
  const customListName = _.capitalize(req.params.CustomListName);

  List.findOne({name: customListName},function(err, foundList){
    if(!err){
      if(!foundList){
        // console.log("It doesn't exist");

        // create a new list
        const list = new List({
          name: customListName,
          items:  defaultItems
        });
      
        list.save();
        res.redirect("/"+customListName)

      }
      else{
        // console.log("Exists");

        // show an existing list
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items})  


      }
    }
  })  
  

}); 


app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });
  if(listName == day)
  {
    item.save();
    res.redirect("/");
  }
  else
  {
    List.findOne({name:listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }
  
  // let item = req.body.newItem;
  // if(req.body.list==="Work"){
    //   workItems.push(item);
    //   res.redirect("/work");
    // }else{
      //     items.push(item);
      //     res.redirect("/");
      // }
});

app.post("/delete", function(req,res){
  
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;
  
  if(listName==day){

    Item.findByIdAndRemove(checkedItem, function(err){
        if(err){
        console.log(err);
        }
        else
        {
          console.log("Successfully deleted the item");
          res.redirect("/");
        }
    });
  }
  else
  {
     List.findOneAndUpdate({name: listName}, {$pull: {items:{_id:checkedItem}}}, function(err,foundList){
        if(!err){
          res.redirect("/"+listName);
        }
     });
  }


}); 




// work route get-post request and rendering
// app.get("/work", function(req, res) {
//   res.render("list", {
//     listTitle: "Work List",
//     newListItems: workItems
//   });
// });

// app.post("/work", function(req, res) {
//   let item = req.body.newItem;
//   workItems.push(item);
//   res.redirect("/work");
// });

// app.get("/about",function(req,res){
//   res.render("about");
// });
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on PORT 3000");
});
