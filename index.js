const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const ObjectsToCsv = require('objects-to-csv');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const db = require('./DBConfig');


app.get("/", (req, res) => {
    res.json("everything is working fine")
})

app.post('/login', (req, res) => {
    const { ID, Password } = req.body;
    db.select("*").from("users").where({
        id: ID,
        password: Password
    })
        .then(users => {
            
            if (users.length) {
                res.json(users[0]);
            }
            else {
                res.status(400).json("invalid credentials");
            }

        })
        .catch(err => res.status(400).json("invalid"));
})

app.post('/password', (req, res) => {
    const { mobileno, newpass, cnfnewpass } = req.body
    db.select("*").from("users").where({
        mobileno: mobileno
    })
        .then(users => {
            if (users.length && newpass === cnfnewpass) {
                db('users').where('mobileno', mobileno)
                    .update({
                        password: newpass
                    })
                    .then(res.json("password updated successfully"))
                    .catch(err => res.status(400).json("something went wrong"))
            }
            else {
                res.json("invalid enteries");
            }
        })
        .catch(err => res.json("invali enteries"))
})

app.post('/order', (req, res) => {
    const { date, comp, owner, item, count, weight, requ } = req.body;

    db('orders').returning("*").insert({
        order_date: date,
        company: comp,
        owner: owner,
        item_product: item,
        count: count,
        weight: weight,
        requests: requ
    })
        .then(res.json("order placed successfully"))
        .catch(err => res.json("invalid order details"))

})

app.post('/view/orders', (req, res) => {
    const { id } = req.body;
    db.select("*").from("orders").where({
        company: id
    })
        .then(users => {
            if (users) {
                res.json(users);
            }
            else {
                res.json("no orders found");
            }
        })
        .catch(err => console.log(err));
})

app.post('/download', (req, res) => {
    const { id } = req.body;
    db.select("*").from("orders").where({
        company: id
    })
        .then(users => {
            if (users) {
                console.log(users);
                new ObjectsToCsv(users).toDisk('Downloads/test.csv');
                res.json(users);
            }
            else {
                res.json("no orders found");
            }
        })
        .catch(err => res.json("something went wrong"));
})

app.listen(3000, () => {
    console.log("app is running on port 3000");
})