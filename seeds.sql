drop database if exists bamazon;
create database bamazon;

use bamazon;

create table products (
	item_id integer(10) not null auto_increment,
    product_name varchar(30) not null,
    department_name varchar(30) not null,
    price decimal(20,2) not null,
    stock_quantity integer(10) not null,
    primary key(item_id)
    );


insert into products (product_name,department_name,price,stock_quantity) values ("Toilet Paper","Home Goods",9.99,100);
select * from products;
insert into products (product_name,department_name,price,stock_quantity) values ("Chloroquine","Cure All",999.99,1000);
insert into products (product_name,department_name,price,stock_quantity) values ("Don Lewis's Skull","Souvenirs",10000,1);

create table users (
	user_id integer(10) auto_increment,
    user_name varchar(10) not null,
    user_password varchar(10) not null,
    account_balance decimal(10,2) default 0,
    primary key (user_id)
    );
select * from users;
create table transactions (
	transaction_id integer auto_increment,
    transaction_type varchar(10) not null,
    amount decimal(10,2),
    items varchar(30),
    account_balance decimal(10,2) not null,
    transaction_date datetime,
    primary key (transaction_id)
    );
    