# Grocery Price Tracker Web Application

This web application is a simple crowd-sourced grocery price tracker. Thus, it relies on its users to keep the database updated. Non-registered users can only view the data. Registered users gain the ability to add, modify, and delete data. Check out a running test version of the web app [here](https://dlgrocery-price-tracker.herokuapp.com). Use the provided login credentials in step 5 below if you do not wish to make an account.

## Instructions to run locally
1. Enter credentials to MySQL database in `main.js` and `dbcon.js`.
2. Run `final_grocery_db.sql` in `db` using your preferred method of database administration to set up tables and populate them with sample starter data. For example, if using a MySQL command line client,
```
mysql> source db/final_grocery_db.sql
```
3. Install dependencies and start server. Supply a port number when starting server. Port 3000 is shown in the example below.
```
$ npm install
$ node main.js 3000
```
4. Your app should now be running on [localhost:3000](http://localhost:3000/).
5. To be able to make changes, sign up for an account. Or use the following credentials,  
   username: `default@example.com`  
   password: `default`

## Database ER Diagram
![](/db/db_er_diagram.png)

## Acknowledgements
Web app created in collaboration with [Juan Du](https://github.com/Juan313).