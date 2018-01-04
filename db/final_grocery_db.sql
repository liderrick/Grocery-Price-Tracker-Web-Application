-- Create tables and insert sample data.

DROP TABLE IF EXISTS pricing;
DROP TABLE IF EXISTS items_categories;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS stores;
DROP TABLE IF EXISTS chains;
DROP TABLE IF EXISTS users;


CREATE TABLE items(
	id INT NOT NULL AUTO_INCREMENT,
	item_name VARCHAR(255) NOT NULL UNIQUE,
	item_unit VARCHAR(255),
	item_barcode INT(13),
	PRIMARY KEY(id)
)ENGINE=InnoDB;

CREATE TABLE categories(
	id INT NOT NULL AUTO_INCREMENT,
	category_name VARCHAR(255) NOT NULL UNIQUE,
	PRIMARY KEY(id)
)ENGINE=InnoDB;

CREATE TABLE items_categories(
	fk_item_id INT NOT NULL,
	fk_category_id INT NOT NULL,
	PRIMARY KEY(fk_item_id, fk_category_id),
	FOREIGN KEY(fk_item_id) REFERENCES items(id) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY(fk_category_id) REFERENCES categories(id) ON DELETE RESTRICT ON UPDATE CASCADE
)ENGINE=InnoDB;

CREATE TABLE chains(
	id INT NOT NULL AUTO_INCREMENT,
	chain_name VARCHAR(255) NOT NULL UNIQUE,
	PRIMARY KEY(id)
)ENGINE=InnoDB;

CREATE TABLE stores(
	id INT NOT NULL AUTO_INCREMENT,
	fk_chain_id INT NOT NULL,
	store_name VARCHAR(255) NOT NULL UNIQUE,
	store_address_1 VARCHAR(255),
	store_address_2 VARCHAR(255),
	store_address_city VARCHAR(255),
	store_address_state CHAR(2),
	store_address_zipcode INT(9),
	PRIMARY KEY(id),
	FOREIGN KEY(fk_chain_id) REFERENCES chains(id) ON DELETE RESTRICT ON UPDATE CASCADE
)ENGINE=InnoDB;

CREATE TABLE users(
	id INT NOT NULL AUTO_INCREMENT,
	username VARCHAR(100) NOT NULL UNIQUE,
	password VARCHAR(100) NOT NULL,
	email VARCHAR(100) UNIQUE,
	PRIMARY KEY(id)
)ENGINE=InnoDB;

CREATE TABLE pricing(
	fk_item_id INT NOT NULL,
	fk_store_id INT NOT NULL,
	submitted_by INT,
	price DECIMAL(10,2) NOT NULL,
	created_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
	PRIMARY KEY(fk_item_id, fk_store_id),
	KEY(submitted_by),
	FOREIGN KEY(fk_item_id) REFERENCES items(id) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY(fk_store_id) REFERENCES stores(id) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY(submitted_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
)ENGINE=InnoDB;


-- Insert sample data
INSERT INTO items(item_name, item_unit, item_barcode) VALUES
	('Whole milk', 'Gallon', 19874),
	('Large white eggs', 'Dozen', 14525),
	('Large brown eggs', 'Dozen', 14526),
	('Ground beef', 'Lbs', 38421),
	('Apple', 'Lbs', 85822),
	('Carrot', 'Lbs', 33021),
	('Beer', '6-pack', 87653),
	('Water', '12-pack', 98342),
	('Cereal', 'Box', 55421),
	('Steak', 'Lbs', 85264),
	('Salmon', 'Lbs', 78469),
	('French roll', 'Each', 25634),
	('Banana', 'Lbs', 68691),
	('Mayonnaise', '98oz', 58625),
	('Tomato sauce', '105oz', 32582);

INSERT INTO categories(category_name) VALUES ('Breakfast'), ('Dairy'), ('Meat'), ('Dry good'), ('Baked good'), ('Produce'), ('Beverages'), ('Alcohol'), ('Tobacco'), ('Candy/Chocolate'), ('Dessert'), ('Non-GMO'), ('Organic'), ('Vegan'), ('Fish'), ('Seafood'), ('Frozen'), ('Paper good'), ('Canned good'), ('Condiments'), ('Bread/Pasta/Rice'), ('Kosher');

INSERT INTO items_categories(fk_item_id, fk_category_id) VALUES
	((SELECT id FROM items WHERE item_name='Whole milk'), (SELECT id FROM categories WHERE category_name='Dairy')),
	((SELECT id FROM items WHERE item_name='Whole milk'), (SELECT id FROM categories WHERE category_name='Breakfast')),
	((SELECT id FROM items WHERE item_name='Large white eggs'), (SELECT id FROM categories WHERE category_name='Dairy')),
	((SELECT id FROM items WHERE item_name='Large white eggs'), (SELECT id FROM categories WHERE category_name='Breakfast')),
	((SELECT id FROM items WHERE item_name='Ground beef'), (SELECT id FROM categories WHERE category_name='Meat')),
	((SELECT id FROM items WHERE item_name='Apple'), (SELECT id FROM categories WHERE category_name='Produce')),
	((SELECT id FROM items WHERE item_name='Carrot'), (SELECT id FROM categories WHERE category_name='Produce')),
	((SELECT id FROM items WHERE item_name='Beer'), (SELECT id FROM categories WHERE category_name='Beverages')),
	((SELECT id FROM items WHERE item_name='Beer'), (SELECT id FROM categories WHERE category_name='Alcohol')),
	((SELECT id FROM items WHERE item_name='Water'), (SELECT id FROM categories WHERE category_name='Beverages')),
	((SELECT id FROM items WHERE item_name='Cereal'), (SELECT id FROM categories WHERE category_name='Breakfast')),
	((SELECT id FROM items WHERE item_name='Cereal'), (SELECT id FROM categories WHERE category_name='Dry good')),
	((SELECT id FROM items WHERE item_name='Large brown eggs'), (SELECT id FROM categories WHERE category_name='Dairy')),
	((SELECT id FROM items WHERE item_name='Large brown eggs'), (SELECT id FROM categories WHERE category_name='Breakfast')),
	((SELECT id FROM items WHERE item_name='Large brown eggs'), (SELECT id FROM categories WHERE category_name='Non-GMO')),
	((SELECT id FROM items WHERE item_name='Salmon'), (SELECT id FROM categories WHERE category_name='Frozen')),
	((SELECT id FROM items WHERE item_name='Salmon'), (SELECT id FROM categories WHERE category_name='Fish')),
	((SELECT id FROM items WHERE item_name='Tomato sauce'), (SELECT id FROM categories WHERE category_name='Produce')),
	((SELECT id FROM items WHERE item_name='Tomato sauce'), (SELECT id FROM categories WHERE category_name='Canned good')),
	((SELECT id FROM items WHERE item_name='Tomato sauce'), (SELECT id FROM categories WHERE category_name='Condiments')),
	((SELECT id FROM items WHERE item_name='Banana'), (SELECT id FROM categories WHERE category_name='Produce')),
	((SELECT id FROM items WHERE item_name='Banana'), (SELECT id FROM categories WHERE category_name='Organic')),
	((SELECT id FROM items WHERE item_name='Banana'), (SELECT id FROM categories WHERE category_name='Non-GMO')),
	((SELECT id FROM items WHERE item_name='Banana'), (SELECT id FROM categories WHERE category_name='Vegan')),
	((SELECT id FROM items WHERE item_name='French roll'), (SELECT id FROM categories WHERE category_name='Bread/Pasta/Rice')),
	((SELECT id FROM items WHERE item_name='French roll'), (SELECT id FROM categories WHERE category_name='Baked good')),
	((SELECT id FROM items WHERE item_name='Steak'), (SELECT id FROM categories WHERE category_name='Meat')),
	((SELECT id FROM items WHERE item_name='Mayonnaise'), (SELECT id FROM categories WHERE category_name='Condiments')),
	((SELECT id FROM items WHERE item_name='Mayonnaise'), (SELECT id FROM categories WHERE category_name='Canned good'));

INSERT INTO chains(chain_name) VALUES ('Costco'), ("Sam's Club"), ('Restaurant Depot');

INSERT INTO stores(fk_chain_id, store_name, store_address_city, store_address_state) VALUES
	((SELECT id FROM chains WHERE chain_name='Costco'), 'Costco Mission Bay', 'San Diego','CA'),
	((SELECT id FROM chains WHERE chain_name='Costco'), 'Costco Hawkins','Hawkins', 'CA'),
	((SELECT id FROM chains WHERE chain_name="Sam's Club"), "Sam's Club Grantville",'Grantville','GA'),
	((SELECT id FROM chains WHERE chain_name='Restaurant Depot'), 'RD Oak Park','Chicago','IL'),
	((SELECT id FROM chains WHERE chain_name='Restaurant Depot'), 'RD Kensington','Kensington','MD');

INSERT INTO users(username, password, email) VALUES
	('default', 'default', 'default@example.com'),
	('jayjay', 'pword123', 'jay0472@gmail.com'),
	('saving_master', 'notpass987', 'saving_master@gmail.com'),
	('ilovetosave', 'yestosavingmoney1', 'i3tosave@gmail.com');

INSERT INTO pricing(fk_item_id, fk_store_id, submitted_by, price) VALUES
	((SELECT id FROM items WHERE item_name='Large white eggs'), (SELECT id FROM stores WHERE store_name='Costco Mission Bay'), (SELECT id FROM users WHERE username='jayjay'), 2.59),
	((SELECT id FROM items WHERE item_name='Large white eggs'), (SELECT id FROM stores WHERE store_name='Costco Hawkins'), (SELECT id FROM users WHERE username='jayjay'), 2.99),
	((SELECT id FROM items WHERE item_name='Cereal'), (SELECT id FROM stores WHERE store_name='Costco Hawkins'), (SELECT id FROM users WHERE username='jayjay'), 3.59),
	((SELECT id FROM items WHERE item_name='Large white eggs'), (SELECT id FROM stores WHERE store_name="Sam's Club Grantville"), (SELECT id FROM users WHERE username='jayjay'), 3.25),
	((SELECT id FROM items WHERE item_name='Cereal'), (SELECT id FROM stores WHERE store_name="Sam's Club Grantville"), (SELECT id FROM users WHERE username='saving_master'), 4.99),
	((SELECT id FROM items WHERE item_name='Large white eggs'), (SELECT id FROM stores WHERE store_name='RD Oak Park'), (SELECT id FROM users WHERE username='saving_master'), 1.99),
	((SELECT id FROM items WHERE item_name='Beer'), (SELECT id FROM stores WHERE store_name='RD Oak Park'), (SELECT id FROM users WHERE username='saving_master'), 6.99),
	((SELECT id FROM items WHERE item_name='Water'), (SELECT id FROM stores WHERE store_name='RD Oak Park'), (SELECT id FROM users WHERE username='ilovetosave'), 4.25),
	((SELECT id FROM items WHERE item_name='Banana'), (SELECT id FROM stores WHERE store_name='RD Kensington'), (SELECT id FROM users WHERE username='default'), 0.90),
	((SELECT id FROM items WHERE item_name='Banana'), (SELECT id FROM stores WHERE store_name='Costco Hawkins'), (SELECT id FROM users WHERE username='default'), 0.51),
	((SELECT id FROM items WHERE item_name='Banana'), (SELECT id FROM stores WHERE store_name="Sam's Club Grantville"), (SELECT id FROM users WHERE username='default'), 0.65),
	((SELECT id FROM items WHERE item_name='Mayonnaise'), (SELECT id FROM stores WHERE store_name='Costco Mission Bay'), (SELECT id FROM users WHERE username='default'), 17.00),
	((SELECT id FROM items WHERE item_name='Mayonnaise'), (SELECT id FROM stores WHERE store_name='Costco Hawkins'), (SELECT id FROM users WHERE username='default'), 18.59);
