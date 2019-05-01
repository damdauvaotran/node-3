const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const Schema = mongoose.Schema;

const port = process.env.PORT || 8000;
const host = process.env.HOST || "127.0.0.1";
const mongoPath = process.env.MONGO_PATH || 'localhost';
const mongoPort = process.env.MONGO_PORT || '27017';

const app = express();
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded

const mongoDBPath = `mongodb://${mongoPath}:${mongoPort}`;

mongoose.connect(`mongodb://${mongoPath}:${27017}/myapp`, {useNewUrlParser: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Database connected');
});

const {ObjectId} = mongoose.Types;

const todosSchema = new Schema({
    "_id": ObjectId,
    "title": String,
    "completed": Boolean,
    "created": {
        type: Date, default: Date.now()
    }
});


const Todos = mongoose.model('todos', todosSchema);

app.get('/', (req, res) => {
    res.send("Hello, world!");
});

app.post('/todos', (req, res) => {
    const {title} = req.body;
    const newTodo = new Todos({_id: new ObjectId(), title, completed: false});
    newTodo.save().then((e) => {
            res.json({success: true, data: newTodo});
        }
    )
});

app.get('/todos/:id', (req, res) => {
    const id = ObjectId(req.params.id);
    Todos.findOne({_id: id}, (err, docs) => {
        if (err) {
            console.error(err);
            res.json({success: false, message: 'Something happen wrong, please try again'})
        } else {
            if (!docs) {
                res.json({success: false, message: "Data not exist"})
            } else {
                res.json({success: true, data: docs});
            }
        }
    });
});

app.post('/todos/:id', (req, res) => {
    const id = ObjectId(req.params.id);
    const {title} = req.body;

    Todos.findOneAndUpdate({_id: id}, {$set: {title}}, {new: true}, (err, docs) => {
            if (err) {
                console.error(err);
                res.json({success: false, message: "Something happen wrong, please try again"})
            } else {
                if (docs.length === 0) {
                    res.json({success: false, message: "Data not exist"})
                } else {
                    res.json({success: true, data: docs});
                }
            }
        }
    );

});

app.post('/todos/:id/toogle', (req, res) => {


    const id = mongoose.Types.ObjectId(req.params.id);
    Todos.findOne({_id: id}).then((docs) => {

        const completed = docs.completed;
        Todos.findOneAndUpdate({_id: id}, {$set: {completed: !completed}}, {new: true}).then((docs) => {
            res.json({success: true, data: docs});
        });

    }).catch(e => {
        console.log(e);
    });
});

app.delete('/todos/:id', (req, res) => {

    const id = mongoose.Types.ObjectId(req.params.id);
    Todos.findOneAndDelete({_id: id}).then((docs) => {

        const completed = docs.completed;
        Todos.findOneAndUpdate({_id: id}, {$set: {completed: !completed}}).then((docs) => {
            res.json({success: true, data: true});
        });

    }).catch(e => {
        console.log(e);
    });
});


app.listen(port, () => {
    console.log(`This app run at ${port}`)
});


