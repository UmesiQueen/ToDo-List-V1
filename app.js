const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js")

const app = express();

//to use the ejs file
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const items = ["Buy food items", "Cook"];
const workItems = ["Sleep", "Eat", "Code", "Repeat"];

app.get("/", function (req, res) {
  const day = date.getDate();
  res.render("list", { listTitle: day, newListItems: items });

});

app.get("/work", (req, res) => {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.post("/", function (req, res) {
  console.log(req.body);

  if (req.body.list === "Work") {

    const workItem = req.body.newItem;
    workItems.push(workItem);

    res.redirect("/work");
  } else {

    const item = req.body.newItem;
    items.push(item);

    res.redirect("/");
  }
});

app.listen(3000, function () {
  console.log("Server is listening on port 3000");
});
