var mysql = require("mysql");
var inquirer = require("inquirer");
var moment = require('moment');
var Table = require('cli-table');
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
                choices: ["View Departments","Add New Department","Exit"],
                name: "action"
            }
        ]).then(function(answer){
            switch (answer.action) {
                case "View Departments":
                    viewDepartments();
                    break;
                case "Add New Department":
                    addNewDepartment();
                    break;
                case "Exit":
                    connection.end();
                break;  
            }
        })
    }
    function addNewDepartment() {
        
            inquirer.prompt([

                {
                    type: "input",
                    message: "Department:",
                    name: "department"
                    
                },
            ]).then(function(answer){
                
                connection.query("insert into departments set ?",
                {
                    department_name: answer.department,
                },
                function (err,res) {
                    if (err) throw err;
                    console.log("\n" + answer.department + " was added to Departments\n")
                })
                setTimeout(chooseAction,500);
            })

            
    }
    function viewDepartments() {
        
        connection.query("select departments.department_id,products.department_name, sum(products.product_sales) sales,sum(products.product_costs) costs,sum(products.product_sales-products.product_costs) profits from departments inner join products on departments.department_name=products.department_name group by department_name order by departments.department_id asc", function(err,res){
            if (err) throw err
            printDepartments(res)
            chooseAction()
        })

    }
    function printDepartments(res) {
        var table = new Table({
            head: ["Department Id","Department Name","Department Sales","Department Costs","Department Profits"]
          , colWidths: [20,20,20,20,20]
        });
        for (var i = 0; i < res.length; i++) {
            table.push([res[i].department_id,res[i].department_name,res[i].sales,res[i].costs,res[i].profits]);
        }
        console.log(table.toString());
    }
    
})