//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-nikhil:test098@cluster0-coazq.mongodb.net/todolistDB",{useNewUrlParser : true});

const itemSchema = {
  name : {
    type :String,
    required : [true,"Please Insert An Item"]}
};

const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});
const item2 = new Item({
  name: "Hit the + button to add new item"
});
const item3 = new Item({
  name: "<--- Hit this to delete an item"
});

const defaultItems = [item1,item2,item3];
const listSchema = {
  name : String,
  items : [itemSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {
  
  Item.find({},function(err,item){

    if(item.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);}
          else{
            console.log("successfully uploaded default items");
          }
        res.redirect("/");
      });
    }else{
        res.render("list", {listTitle: "Today", newListItems: item});
        }
  });
  

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const newItem = new Item({
    name : itemName
  });
  const listTitle = req.body.list;
    List.findOne({name:listTitle},function(err,listItem){
      if(!err){
        if(listTitle==="Today"){
          newItem.save();
          res.redirect("/");
        }else{
        listItem.items.push(newItem);
        listItem.save();
        res.redirect("/"+listTitle);
      }
    }
    });
  
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkBox;
  const listName = req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
          console.log("successfully deleted item!");
          res.redirect("/");
        }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items : {_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }
  
});

app.get("/:listName", function(req,res){
  const listName = _.capitalize(req.params.listName);
  
  List.findOne({name:listName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list = new List ({
        name : listName,
        items : defaultItems
        });
        list.save();
        res.redirect("/"+listName);
      }else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
  
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT||3000, function() {
  console.log("Server started succesfully!");
});
