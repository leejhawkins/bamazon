# Store Front

### Overview

Store Front is a command line interface node.js and mySQL application that allows "users" to purchase products, view their transactions and add funds to their account. It then allows "managers" to add new products, add to inventories and search all transactions or by item or user.  Finally it  allows "supervisors" to view department costs, sales and profits and create new departments.  The data for the application is stored in 4 tables for products, user, transactions and departments. Data tables are created using the CLI table NPM and mySQL queries.   

## User Level
![User Log In](Images/userloginbuy.jpg)
<i><b>"User Log In/Product Table"</b></i>


The user is first prompted to "Log In" or "Sign In" for a new account.  If the user does not have an account they can create a user name, a password and then add money to their account.  The user may then "Log In" with their account, where they may choose to "Buy", "Add Funds" or "View Transactions".  

If a user chooses to "Buy" a list of available products with prices are displayed in a table.  They can then scroll through a list using an inquirer prompt to choose the product and quantity they would like to buy.  If the stock quantity of the product is lower than the quantity they would like to buy the transaction is not allowed.  If the total price of the transaction is higher than the amount of money in the user's account the purchase is not allowed.  If both of those conditions are met, the transaction is allowed the total price is deducted from the user's balance and  the transaction is recorded.  The transaction includes: transaction number, the user's name and ID number, the product name and ID number, transaction type, total amount, current balance and date and time of the transaction.  

If the user needs more money their account they may "Add Funds" which allows them to deposit money into their account.  When the money is added the amount of money is added to the user's balance and  transaction is recorded as transaction type "deposit".


![View Transactions](Images/usertransactions.jpg)
<i><b>"User Transactions"</b></i>

If the user would like to "View Transactions", a list of their transactions will be listed in a table with transaction type, amount, item purchased, current balance and datetime of the transaction.

## Manager

![Manager Home](Images/managerhomepage.jpg)
<i><b>"Manager Home"</b></i> 

Once the "Manager is logged in a list of current products is listed with additional information for "Product Sales" and "Product Costs".  The "Product Sales" are the revenue made off of sales of the product and the "Product Costs" are the cost per unit to purchase the product from wholesalers. The manager may then choose to: "Search Transactions", "Add to inventory", "Add new product" or "Delete Product". 


![Search by Item](Images/searchbyitem.jpg)
<i><b>"Search by Item"</b></i>

If the manager wants to "Search Transactions" they can search all transactions or by "Item" or "User Id".  Transactions are then printed out in a table with the transaction number, type, user name, amount, items purchased and datetime.

![Add new product](Images/addnewproduct.jpg)
<i><b>"Add new product"</i></b>

If the manager wants to add a new product they must input the product name, choose the department from a list (the department must be created by a supervisor), set a price the produce, input the quantity acquired and the cost per unit to the store.  

If the manager wants to "Add to inventory" they must input the "Item Id" number, input the number to add to the inventory and the cost paid per unit for the new product.  

The manager may "Delete product" by choosing the "Item Id" of the product they would like to delete.

## Supervisor Level 

When the "Supervisor" logs in, they are given the choice to "View Departments" or "Add a New Department".

![View departments](Images/departmentview.jpg)
<i><b>"Department View"</i></b>

The supervisor may "View Departments" and all the departments with their respective total sales, total costs and total profits will be listed.  Total sales are the amount of the item purchased from the user, total costs are the amount paid by the manager for the product per unit times the quantity added and total profit is sales minus the costs.  

The supervisor may also "Add a New Department".  This allows the manager to add new products and inventory to the department.  The department will not be listed under "View Departments" until a product has been added to the department.

![Demo](Images/storefrontdemo.gif)
### [Click for Demo](https://drive.google.com/file/d/1IDjPqhDyDOEMrwowFbuQIc_KTHRuYxWF/view)
