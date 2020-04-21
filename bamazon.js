var mysql = require("mysql");
var inquirer = require("inquirer");
var moment = require('moment');
var Table = require('cli-table');
var user = "";
var userID = "";
var userBalance = parseFloat(0);
var productList = [];
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
    getProducts()
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
                    
                    
                    
                    checkPassword(res[0].user_password,res[0].user_name,res[0].user_id,res[0].account_balance)                 
                } else {
                    console.log("User does not exist")
                    initializeStore();
                    
                }
            })
    }
    function checkPassword(password,username,userid,balance) {
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
                userID = userid;
                printUser();
                chooseAction()
            } else {
                console.log("The password you have entered is incorrect");
                initializeStore();

            }
        })
    }
    function printUser() {
        console.log("\nLogged in as: "+ user)
        console.log("Balance: $" + userBalance+"\n")
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
                console.log("Welcome to the store  " + username)
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
            var table = new Table({
                head: ['Item ID', 'Product',"Department","Price","Stock Quantity"]
              , colWidths: [10,15,15,10,15]
            });
            for (var i = 0; i < res.length; i++) {
                table.push([res[i].item_id,res[i].product_name, res[i].department_name,res[i].price,res[i].stock_quantity]);
            }
            console.log(table.toString());
        })

    }

    function buyProduct() {
        inquirer.prompt([
            {
                name: "product",
                message: "What product would you like to buy?",
                type: "list",
                choices: productList
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

    function checkStock(product, quantity) {
        var sql = "select * from products where product_name=?"
        connection.query(sql,
            [product],
            function (err, res) {
                if (err) throw err;
                if (!( typeof res[0] === 'undefined')) {
                    stockQuantity = res[0].stock_quantity;
                    price = parseFloat(res[0].price * quantity);
                    itemID = res[0].item_id;
                    sales = res[0].product_sales;
                    if (quantity > stockQuantity) {
                        console.log("There are not enough in stock")
                        chooseAction();
                    } else if (userBalance<price) {
                        console.log("There is not enough money in your account, please add funds")
                        chooseAction();
                    } else {
                        userBalance = userBalance - price;
                        allowSale(itemID, quantity, stockQuantity, price, product,sales);
                    }
                } else {
                    console.log("Item does not exist")
                    chooseAction();
                }
            })
    }

    function allowSale(itemID, quantity, stockQuantity, price, product,sales) {
        connection.query("update products set ? where ?",
            [{ stock_quantity: stockQuantity - quantity,product_sales:sales+price }, { product_name: product }],
            function (err, res) {
                if (err) throw err;
                console.log(user + "bought " + quantity + " x " + product +" for $" + price)
                printProducts();
                changeBalance();
                recordTransaction("purchase",-price,product,itemID)
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
            console.log("\n$"+answer.funds + " was added to " + user +"'s account\n")
            changeBalance();
            recordTransaction("deposit",answer.funds,"none")
            setTimeout(chooseAction,500)
        })
    }
    function recordTransaction(type,amount,items,itemID){
        connection.query("insert into transactions set ?",
        {
            user_name: user,
            user_id: userID,
            transaction_type: type,
            amount: amount,
            items: items,
            item_id: itemID,
            account_balance: userBalance,
            transaction_date: moment().format("YYYY-MM-DD HH:mm:ss")

        })
    }
    function printTransactions() {
        connection.query("select * from transactions where user_name=?",
        [user],
        function (err, res) {
        if (err) throw err;
        console.log(user + "'s transaction history\n")
        var table = new Table({
            head: ['Type', 'Amount',"Item","Account Balance","Date/Time"]
          , colWidths: [10,15,15,20,20]
        });
        for (var i = 0; i < res.length; i++) {
            table.push([res[i].transaction_type, res[i].amount,res[i].items,res[i].account_balance,moment(res[i].transaction_date).format("YYYY-MM-DD HH:mm:ss")]);
        }
        console.log(table.toString());
        chooseAction()
        })

    }
    function getProducts () {
        connection.query("select * from products",function(err,res){
            if (err) throw err;
            for (var i=0; i<res.length; i++) {
                productList.push(res[i].product_name)
            }
        })
    }
})

