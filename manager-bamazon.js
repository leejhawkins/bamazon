var mysql = require("mysql");
var inquirer = require("inquirer");
var moment = require('moment');
var Table = require('cli-table');
var departments = [];
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
    getDepartments()
    getProducts();
    logIn();

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
                printProducts();
                setTimeout(chooseAction,500)
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
                printProducts()
                setTimeout(addToInventory,500);
                break;
            case "Add new product":
                addNewProduct();
                break;
            case "Delete product":
                printProducts()
                setTimeout(deleteProduct,500)
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
                choices: ["All","by Item","by User Id"],
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
                case "by User Id":
                    searchByUser();
                    break;  
                }
      
        })
    }
    function printTransactions(res) {
        var table = new Table({
            head: ["Transaction ID",'Type',"User Name", 'Amount',"Item","Date/Time"]
          , colWidths: [10,15,15,15,20,20]
        });
        for (var i = 0; i < res.length; i++) {
            table.push([res[i].transaction_id,res[i].transaction_type,res[i].user_name, res[i].amount,res[i].items,moment(res[i].transaction_date).format("YYYY-MM-DD HH:mm:ss")]);
        }
        console.log(table.toString());
    }
    function searchAll() {
        connection.query("SELECT * from transactions", function (err, res) {
            if (err) throw err;
            printTransactions(res);
            chooseAction();
        })
        
    }
    function  searchByItem() {
        inquirer.prompt([
            {
                type: "list",
                message: "What item would you like to search for?",
                name: "item",
                choices: productList
            }
        ]).then(function(answer) {
        connection.query("SELECT * from transactions where items=?",[answer.item], function (err, res) {
            if (err) throw err;
            printTransactions(res);
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
        
        connection.query("SELECT * from transactions where user_id=?",[answer.user], function (err, res) {
            if (err) throw err;
            printTransactions(res);
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
                name: "department",
                message: "Department:",
                type: "list",
                choices: departments
                
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
            },
            {
                type: "input",
                message: "Cost per unit:",
                name: "cost"
            },
        ]).then(function(answer){
            var cost = parseFloat(answer.cost)*parseInt(answer.stock);
            connection.query("insert into products set ?",
            {
                product_name: answer.product,
                department_name: answer.department,
                price: answer.price,
                stock_quantity: answer.stock,
                product_costs: cost,
            },
            function (err,res) {
                if (err) throw err;
                console.log("\n" + answer.product + " was added to Products\n")
            })
            printProducts();
            setTimeout(chooseAction,500);
        })
    }
    function addToInventory(){
        
        inquirer.prompt([
            {
                type: "input",
                message: "Product number to add to:",
                name: "product",
            },
            {
                type: "input",
                message: "Add to inventory:",
                name: "inventory",
                validate: function(value) {
                    if (isNaN(value)===false) {
                        return true
                    }
                    return false
                }
            },
            {
                    type: "input",
                    message: "Cost per unit:",
                    name: "cost"
            
            }
        ]).then(function(answer){
            var inventory = parseInt(0);
            var cost = parseFloat(0);
            connection.query("select * from products where item_id=?",[answer.product],function(err,res){
                if (err) throw (err);
                inventory = res[0].stock_quantity;
                cost = res[0].product_costs;
                connection.query("update products set ? where ?",
                [{ stock_quantity:inventory+parseInt(answer.inventory),product_costs:cost+(parseFloat(answer.cost)*parseInt(answer.inventory))},{item_id:answer.product}],
                function (err,res) {
                    if (err) throw err;
                    printProducts()
                    setTimeout(chooseAction,500);
                })
            })
           
        })
    }
    function deleteProduct() {
        
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
            var table = new Table({
                head: ['Item ID', 'Product',"Department","Price","Stock Quantity","Product Sales","Product Costs"]
              , colWidths: [10,15,15,10,15,18,18]
            });
            for (var i = 0; i < res.length; i++) {
                table.push([res[i].item_id,res[i].product_name, res[i].department_name,res[i].price,res[i].stock_quantity,"$"+res[i].product_sales,"-$"+res[i].product_costs]);
            }
            console.log(table.toString());

        })

    }
    function getDepartments() {
        
        connection.query("select * from departments", function (err,res){
            if (err) throw err;
            for (var i=0; i<res.length; i++) {
                departments.push(res[i].department_name)
            }
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
