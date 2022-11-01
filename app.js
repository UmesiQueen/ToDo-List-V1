const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const { mongoose, Schema } = require("mongoose");
const _ = require("lodash");
require("dotenv").config();

const date = require(__dirname + "/date.js");
const day = date.getDate();

const app = express();

//to use the ejs file
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const user = process.env.DB_USER;
const psw = process.env.DB_PASSWORD;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose
  .connect(
    "mongodb+srv://" +
      user +
      ":" +
      psw +
      "@cluster0.ctjpt9c.mongodb.net/todoListDB?retryWrites=true&w=majority",
    options
  )
  .then(() => {
    console.log("DB connected successfully!");
  })
  .catch((err) => {
    console.log("Error occurred while connecting to DB.");
    console.log(err);
  });

//FIRST SCHEMA
const itemsSchema = new Schema({
  name: String,
});

const Item = mongoose.model("Item", itemsSchema);

//SECOND SCHEMA
const listSchema = new Schema({
  name: String,
  items: [itemsSchema],
});

const List = mongoose.model("List", listSchema);

//CREATING NEW MODEL OBJECT
const item1 = new Item({
  name: "Welcome to your todoList!",
});

const item2 = new Item({
  name: "Hit the + to button to add a new item.",
});

const item3 = new Item({
  name: "<-- Hit this to delete an item.",
});

const defaultItems = [item1, item2, item3];

//insert documents
const insertManyDocument = (arr) => {
  Item.insertMany(arr).catch((err) => {
    console.log("Error while inserting Data.");
    console.log(err);
  });
};

app.get("/", (req, res) => {
  //Retrieve list items from database
  Item.find()
    .then((result) => {
      if (result.length === 0) {
        insertManyDocument(defaultItems);
        res.redirect("/");
      } else {
        res.render("list", {
          listTitle: "Today",
          date: day,
          newListItems: result,
        });
      }
    })
    .catch((err) => {
      console.log("Error while retrieving Data");
      console.log(err);
    });
});

app.post("/", (req, res) => {
  const newItem = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: newItem,
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName })
      .then((result) => {
        result.items.push(item);
        result.save();
      })
      .catch((err) => {
        console.log(err);
      });
    res.redirect("/" + listName);
  }
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId).catch((err) => {
      console.log("Error while deleting Data.");
      console.log(err);
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } }
    ).catch((err) => {
      console.log(err);
    });

    res.redirect("/" + listName);
  }
});

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName })
    .then((result) => {
      if (!result) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });

        list.save();

        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: result.name,
          date: day,
          newListItems: result.items,
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
  // res.render("list", { listTitle: customListName, newListItems: workItems });
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server is listening on port 3000");
});
