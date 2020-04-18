var mysql = require("mysql");
var inquirer = require("inquirer");
var moment = require('moment');
var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "password",
    database: "bamazon"
});
connection.connect(function (err) {
    if (err) throw err;
    logIn()
    function logIn() {
        inquirer.prompt([
            {
                type: "input",
                message: "Manager:",
                name: "username"
            },
            {
                type: "password",
                message: "Password",
                name: "password",
            }
        ]).then(function (answer) {
            if (answer.username==="admin" && answer.password=="password") {
                chooseAction()
            } else {
                console.log("Either password or username was entered incorrectly");
                logIn()
            }

        })
    }
    function chooseAction() {
        inquirer.prompt([
            {
                type: "list",
                message: "Choose action:",
                choices: ["Search Transactions","Add to inventory","Add new product","Delete product","Exit"],
                name: "action"
            }
        ]).then(function(answer){
            switch (answer.action) {
            case "Search Transactions":
                searchTransactions();
                break;
            case "Add to inventory":
                addToInventory();
                break;
            case "Add new product":
                addNewProduct();
                break;
            case "Delete product":
                deleteProduct();
                break;
            case "Exit":
                connection.end();
                break;  
            }
        })
    }
    function searchTransactions() {
        inquirer.prompt([
            {
                type: "list",
                message: "Search:",
                choices: ["All","by Item","by Department","by User Id"],
                name: "action"
            }
        ]).then(function(answer) {
            switch (answer.action) {
                case "All":
                    searchAll();
                    break;
                case "by Item":
                    searchByItem();
                    break;
                case "by Department":
                    searchByDeparment();
                    break;
                case "by User Id":
                    searchByUser();
                    break;  
                }
      
        })
    }
    function searchAll() {
        connection.query("SELECT * from transactions", function (err, res) {
            if (err) throw err;
            for (var i = 0; i < res.length; i++) {
                console.log(res[i].transaction_id + " | " + res[i].user_name + " | " + res[i].transaction_type + " | " + res[i].amount + "|" + res[i].items+ "|" + res[i].account_balance + "|" + moment(res[i].transaction_date).format("YYYY-MM-DD HH:mm:ss"));
            }
            chooseAction();
        })
        
    }
    function  searchByItem() {
        inquirer.prompt([
            {
                type: "input",
                message: "What item would you like to search for?",
                name: "item"
            }
        ]).then(function(answer) {
        connection.query("SELECT * from transactions where items=?",[answer.item], function (err, res) {
            if (err) throw err;
            for (var i = 0; i < res.length; i++) {
                console.log(res[i].transaction_id + " | " + res[i].user_name + " | " + res[i].transaction_type + " | " + res[i].amount + "|" + res[i].items+ "|" + res[i].account_balance + "|" + moment(res[i].transaction_date).format("YYYY-MM-DD HH:mm:ss"));
            }
            chooseAction();
        })
    })
    }
    function  searchByUser() {
        inquirer.prompt([
            {
                type: "input",
                message: "Search transactions of which user?",
                name: "user"
            }
        ]).then(function(answer) {
        connection.query("SELECT * from transactions where user_name=?",[answer.user], function (err, res) {
            if (err) throw err;
            for (var i = 0; i < res.length; i++) {
                console.log(res[i].transaction_id + " | " + res[i].user_name + " | " + res[i].transaction_type + " | " + res[i].amount + "|" + res[i].items+ "|" + res[i].account_balance + "|" + moment(res[i].transaction_date).format("YYYY-MM-DD HH:mm:ss"));
            }
            chooseAction();
        })
    })
    }
    function addNewProduct(){
        inquirer.prompt([
            {
                type: "input",
                message: "Product to add:",
                name: "product"
            },
            {
                type: "input",
                message: "Department:",
                name: "department"
                
            },
            {
                type: "input",
                message: "Price",
                name: "price"
            },
            {
                type: "input",
                message: "Number Acquired:",
                name: "stock"
            }
        ]).then(function(answer){
            connection.query("insert into products set ?",
            {
                product_name: answer.product,
                department_name: answer.department,
                price: answer.price,
                stock_quantity: answer.stock 
            },
            function (err,res) {
                if (err) throw err;
                console.log("Product added" + res)
            })
            printProducts();
            chooseAction();
        })
    }
    function addToInventory(){
        inquirer.prompt([
            {
                type: "input",
                message: "Product number to add to:",
                name: "product"
            },
            {
                type: "input",
                message: "Set inventory to:",
                name: "inventory",
                validate: function(value) {
                    if (isNaN(value)===false) {
                        return true
                    }
                    return false
                }
            }
        ]).then(function(answer){
            
            connection.query("update products set ? where ?",
            [{ stock_quantity:answer.inventory},{item_id:answer.product}],
            function (err,res) {
                if (err) throw err;
                printProducts()
                chooseAction()
            }
            )
        })
    }
    function deleteProduct() {
        printProducts()
        inquirer.prompt([
            {
                type: "input",
                message: "What product would you like deleted?",
                name: "item"
            }
        ]).then(function(answer) {
        connection.query("Delete from products where item_id=?",[answer.item], function (err, res) {
            if (err) throw err;
            printProducts();
            setTimeout(chooseAction,500);
        })
    })
    }
    function printProducts() {
        connection.query("SELECT * from products", function (err, res) {
            if (err) throw err;
            for (var i = 0; i < res.length; i++) {
                console.log(res[i].item_id + " | " + res[i].product_name + " | " + res[i].department_name + " | " + res[i].price + "|" + res[i].stock_quantity);
            }

        })

    }
})
