var mysql = require("mysql");
var inquirer = require("inquirer");
var moment = require('moment');
var user = "";
var userBalance = parseFloat(0);
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

    initializeStore()

    function initializeStore() {
        console.log("Welcome to the store:")
        inquirer.prompt([
            {
                type: "list",
                choices: ["Log in", "Sign Up","Exit"],
                name: "user"

            }
        ]).then(function (answer) {
            if (answer.user === "Log in") {
                logIn()
            } else if(answer.user=== "Sign Up"){
                signUp()
            } else {
                connection.end();
            }
        })
    }
    function signUp() {
        inquirer.prompt([
            {
                type: "input",
                message: "Choose username:",
                name: "username"
            },
            {
                type: "password",
                message: "Choose password",
                name: "password"

            },
            {
                type: "input",
                message: "How much money would you like to deposit in your account?",
                name: "balance"
            }

        ]).then(function (answers) {
            addUser(answers.username, answers.password, answers.balance)
        })
    }
    function logIn() {
        inquirer.prompt([
            {
                type: "input",
                message: "Enter user name:",
                name: "username"
            }
        ]).then(function (answer) {
            checkUser(answer.username);

        })
    }
    function checkUser(username) {
        connection.query("select * from users where user_name=?",
            [username],
            function (err, res) {
                if (err) throw err;
                if (!( typeof res[0] === 'undefined')) {
                    
                    
                    
                    checkPassword(res[0].user_password,res[0].user_name,res[0].account_balance)                 
                } else {
                    console.log("User does not exist")
                    initializeStore();
                    
                }
            })
    }
    function checkPassword(password,username,balance) {
        inquirer.prompt([
            {
                type: "password",
                message: "Please enter password:",
                name: "password"
            }
        ]).then(function(answer){
            if (password===answer.password) {
               
                user = username;
                userBalance = balance;
                printUser()
                chooseAction();
            } else {
                console.warning("The password you have entered is incorrect");
                initializeStore();

            }
        })
    }
    function printUser() {
        console.log("Logged in as:"+ user)
        console.log("Balance: $" + userBalance)
    }


    function addUser(username, password, balance) {
        connection.query("insert into users set ?",
            {
                user_name: username,
                user_password: password,
                account_balance: balance
            },
            function (err, res) {
                if (err) throw err;
                console.log("Welcome to the store " + username)
                initializeStore();
            })
    }
    function chooseAction() {
        inquirer.prompt([
            {
                name: "action",
                type: "list",
                message: "What would like to do?",
                choices: ["Buy","Add Funds","View transaction history","Exit"]
            }

        ]).then(function (answer) {
            if (answer.action === "Buy") {
                printProducts()
                setTimeout(buyProduct,500)
            }
            else if (answer.action === "Add Funds") {
                addFunds()
            } else if (answer.action === "View transaction history") {
                printTransactions();
            } else {
                connection.end();
            }
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

    function buyProduct() {
        inquirer.prompt([
            {
                name: "product",
                message: "What product would you like to buy?",
                type: "input"
            },
            {
                name: "quantity",
                message: "How many?",
                type: "input"
            }
        ]).then(function (answer) {


            checkStock(answer.product, parseInt(answer.quantity));
        })

    }

    function checkStock(itemID, quantity) {
        var sql = "select * from products where item_id=?"
        connection.query(sql,
            [itemID],
            function (err, res) {
                if (err) throw err;
                if (!( typeof res[0] === 'undefined')) {
                    stockQuantity = res[0].stock_quantity;
                    price = parseFloat(res[0].price * quantity);
                    product = res[0].product_name;
                    if (quantity > stockQuantity) {
                        console.log("There are not enough in stock")
                        chooseAction();
                    } else if (userBalance<price) {
                        console.log("There is not enough money in your account, please add funds")
                        chooseAction();
                    } else {
                        userBalance = userBalance - price;
                        allowSale(itemID, quantity, stockQuantity, price, product);
                    }
                } else {
                    console.log("Item does not exist")
                    chooseAction();
                }
            })
    }

    function allowSale(itemID, quantity, stockQuantity, price, product) {
        connection.query("update products set ? where ?",
            [{ stock_quantity: stockQuantity - quantity }, { item_id: itemID }],
            function (err, res) {
                if (err) throw err;
                console.log(user + "bought " + quantity + "" + product +" for $" + price)
                printProducts();
                changeBalance();
                recordTransaction("purchase",-price,product)
                setTimeout(chooseAction, 500)
            }
        )
    }
    function changeBalance() {
        connection.query("update users set ? where ?",
        [{ account_balance:userBalance},{user_name:user}],
        function (err, res) {
            if (err) throw err;
            printUser();
        }
        )
    }
    function addFunds(){
        inquirer.prompt([
            {
                type: "input",
                message: "How much would you like to add to your account?",
                name: "funds",
                validate: function(value) {
                    if (isNaN(value)===false) {
                        return true
                    }
                    return false
                }
            }
        ]).then(function(answer){
            userBalance = userBalance + parseInt(answer.funds);
            console.log("$"+answer.funds + " was added to " + user +"'s account")
            changeBalance();
            recordTransaction("deposit",answer.funds,"none")
            setTimeout(chooseAction,500)
        })
    }
    function recordTransaction(type,amount,items){
        connection.query("insert into transactions set ?",
        {
            user_name: user,
            transaction_type: type,
            amount: amount,
            items: items,
            account_balance: userBalance,
            transaction_date: moment().format("YYYY-MM-DD HH:mm:ss")

        })
    }
    function printTransactions() {
        connection.query("select * from transactions where user_name=?",
        [user],
        function (err, res) {
        if (err) throw err;
        console.log(user + "'s transaction history")
        for (var i = 0; i < res.length; i++) {
            console.log(res[i].transaction_type + " | " + res[i].amount + " | " + res[i].items + " | " + res[i].account_balance + "|" + moment(res[i].transaction_date).format("YYYY-MM-DD HH:mm:ss"));
        }
        chooseAction()
        })

    }
})

