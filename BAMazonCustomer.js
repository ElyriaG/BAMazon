const mysql = require("mysql");
const colors = require("colors/safe");
const inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "bamazon_db"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log(colors.rainbow("connected as id " + connection.threadId));
    afterConnection();
});

function afterConnection() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        console.table(res)
        productInquiry();
    });
}

function productInquiry() {
    connection.query("SELECT * FROM products", function (error, results) {
        inquirer.prompt([{
            message: "What is the item id of the product you'd wish to purchase?",
            name: "itemID",
            type: "list",
            choices: results.map(item => item.item_id)
        },
        {
            message: "How many units do you wish to purchase?",
            name: "units",
            type: "number"
        }])
            .then(answers => {
                let itemToBuy = results.find(item => item.item_id == answers.itemID);
                let stockDeduction = (itemToBuy.stock_quantity - answers.units);
                if (itemToBuy.stock_quantity < answers.units) {
                    console.log("We do not currently have enough in stock. Sorry.");
                } else {
                    connection.query("UPDATE products SET ? WHERE ?", [{
                        stock_quantity: stockDeduction
                    }, {
                        item_id: itemToBuy.item_id
                    }], (error, response) => {
                        if(error) console.log(error);
                        // console.log(response);
                        console.log(`Yay! You bought ${answers.units} units!`);
                        // console.table(results)
                        console.log(`Your price: $${answers.units * itemToBuy.price}`);
                    })
                };
            })
    })
}