const express = require('express')
const app = express()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const date = require(__dirname + '/date.js')
let ejs = require('ejs')

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static("public"))

mongoose.connect("mongodb://localhost:27017/todolistDB")

const itemsSchema = {
    name: String
}

const workItemsSchema = {
    name: String
}

const Item = mongoose.model('Item', itemsSchema)
const WorkItem = mongoose.model('WorkItem', workItemsSchema)

const item1 = Item({
    name: 'Welcome to your todolist!'
})

const item2 = Item({
    name: 'Hit the + button to add a new item.'
})

const item3 = Item({
    name: '<-- Hit this to delete an item.'
})

const defaultItems = [item1, item2, item3]
const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model('List', listSchema)


app.get('/', function (req, res) {
    Item.find({})
        .then(items => {
            if (items.length === 0) {
                Item.insertMany(defaultItems)
                    .then(() => {
                        console.log('Successfully saved default items to DB');
                        res.redirect('/'); // Redirect to ensure the list is rendered after insertion
                    })
                    .catch(err => console.log(err));
            } else {
                res.render('list', { listTitle: 'Today', items: items });
            }
        })
        .catch(err => console.log(err)); // Handle errors from Item.find()
});

app.post('/delete', function (req, res) {
    const id = req.body.checkbox;

    Item.findByIdAndDelete(id)
    .then(() => {
        console.log("Deleted");
        res.redirect('/');
    });
});


app.post('/', function(req, res){

    const itemName = req.body.newItem
    const listName = req.body.list

    const item = new Item({
        name: req.body.newItem
    })
    if (listName === 'Today'){
        item.save()
        res.redirect('/')
    } else{
        List.findOne({name: listName})
        .then(foundList => {
            foundList.items.push(item)
            foundList.save()
            res.redirect('/'+listName)
        })

    }
})

app.get('/:customListName', function(req, res){
    const customListName = req.params.customListName
    List.findOne({name: customListName})
    .then(foundList => {
        if (!foundList){
            const list = List({
                name: customListName,
                items: defaultItems
            })
            list.save()
            res.redirect('/'+customListName)
        }else{ 
            res.render('list', {listTitle: foundList.name, items: foundList.items})
        }})
})
    
app.listen(3000, function(){
    console.log('Server is running on http://localhost:3000')
})