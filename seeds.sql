drop database if exists bamazon;
create database bamazon;

use bamazon;

create table products (
	item_id integer(10) not null auto_increment,
    product_name varchar(30) not null,
    department_name varchar(30) not null,
    price decimal(20,2) not null,
    stock_quantity integer(10) not null,
    product_sales decimal(20,2) default 0,
    product_costs decimal (20,2) not null,
    primary key(item_id)
    );
select * from products;
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
    user_id integer not null,
    user_name varchar(10) not null,
    transaction_type varchar(10) not null,
    amount decimal(10,2),
    item_id integer,
    items varchar(30),
    account_balance decimal(10,2) not null,
    transaction_date timestamp,
    primary key (transaction_id)
    );
select * from transactions;
create table departments (
	department_id integer auto_increment,
    department_name varchar(30),
    overhead decimal(10,2),
    primary key (department_id)
    );
select * from departments;