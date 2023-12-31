DROP SCHEMA `dolcemika`;

CREATE SCHEMA `dolcemika`;

USE `dolcemika`;

CREATE TABLE user_roles (
	id TINYINT(1) NOT NULL UNIQUE AUTO_INCREMENT,
	role VARCHAR(50) NOT NULl,
	PRIMARY KEY (id)
);

CREATE TABLE order_states (
	id TINYINT(1) NOT NULL UNIQUE AUTO_INCREMENT,
	state VARCHAR(50) NOT NULL,
	PRIMARY KEY (id)
);

CREATE TABLE user (
	id INT NOT NULL UNIQUE AUTO_INCREMENT,
	role_id TINYINT(1) NOT NULL,
	email VARCHAR(100) NOT NULL UNIQUE,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (id),
	CONSTRAINT fk__user__user_roles
	FOREIGN KEY (role_id)
	REFERENCES user_roles (id)
);

CREATE TABLE user_description (
	user_id INT NOT NULL,
	fullname VARCHAR(100) NOT NULL,
	cellphone VARCHAR(20) NOT NUll,
	birthdate DATE NOT NULL,
	CONSTRAINT fk__user_information__user
	FOREIGN KEY (user_id)
	REFERENCES user (id)
);

CREATE TABLE user_auth (
	user_id INT NOT NULL,
	hash VARCHAR(100) NOT NULL,
	salt VARCHAR(100) NOT NULL,
	CONSTRAINT fk__user_auth__user
	FOREIGN KEY (user_id)
	REFERENCES user (id)
);

CREATE TABLE user_client (
	id INT NOT NULL UNIQUE AUTO_INCREMENT,
	user_id INT NOT NULL,
	PRIMARY KEY (id),
	CONSTRAINT fk__user_client__user
	FOREIGN KEY (user_id)
	REFERENCES user (id)
);

CREATE TABLE user_admin (
	id INT NOT NULL UNIQUE AUTO_INCREMENT,
	user_id INT NOT NULL,		
	PRIMARY KEY (id),
	CONSTRAINT fk__user_admin__user
	FOREIGN KEY (user_id)
	REFERENCES user (id)
);

CREATE TABLE menu_item (
	id INT NOT NULL UNIQUE AUTO_INCREMENT,
	parent_id INT DEFAULT NULL,
    is_available BIT(1) NOT NULL,
	PRIMARY KEY (id),
	CONSTRAINT fk__menu_item__menu_item
	FOREIGN KEY (parent_id)
	REFERENCES menu_item (id)
    ON DELETE CASCADE
);

CREATE TABLE menu_item_description (
	menu_item_id INT NOT NULL UNIQUE AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    detail VARCHAR(100) DEFAULT NULL,
    price FLOAT DEFAULT NULL,
    image LONGBLOB DEFAULT NULL,
    CONSTRAINT fk__menu_item_description__menu_item
    FOREIGN KEY (menu_item_id)
    REFERENCES menu_item (id)
    ON DELETE CASCADE
);

CREATE TABLE ingredient (
	id INT NOT NULL UNIQUE AUTO_INCREMENT,
	title VARCHAR(100) NOT NULL,
	detail VARCHAR(100) DEFAULT NULL,
	PRIMARY KEY (id)
);

CREATE TABLE ingredient_stock (
	ingredient_id INT NOT NULL,
	stock INT NOT NULL,
	CONSTRAINT fk__ingredient_stock__ingredient
	FOREIGN KEY (ingredient_id)
	REFERENCES ingredient (id)
    ON DELETE CASCADE
);

CREATE TABLE client_order (
	id INT NOT NULL UNIQUE AUTO_INCREMENT, -- use this for allowing the use to retrieve the order's state or to make changes in it
	client_id INT NOT NULL,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_finished BIT(1) NOT NULL DEFAULT 0,
	PRIMARY KEY (id),
	CONSTRAINT fk__client_order__user_client
	FOREIGN KEY (client_id)
	REFERENCES user_client (id)
);

CREATE TABLE client_order_description (
	order_id INT NOT NULL,
    total_price FLOAT NOT NULL,
    detail VARCHAR(250) DEFAULT NULL,
    estimated_for DATETIME DEFAULT NULL,
    updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk__client_order_description__client_order
    FOREIGN KEY (order_id)
    REFERENCES client_order (id)
);

CREATE TABLE order_comment (
	id INT NOT NULL UNIQUE AUTO_INCREMENT,
	order_id INT NOT NULL,
	detail VARCHAR(250) NOT NULL,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk__order_comment__client_order
	FOREIGN KEY (order_id)
	REFERENCES client_order (id)
);

CREATE TABLE order_current_state (
	order_id INT NOT NULL,
	order_state_id TINYINT(1) NOT NULL,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk__order_current_state__client_order
	FOREIGN KEY (order_id)
	REFERENCES client_order (id),
	CONSTRAINT fk__order_current_state__order_states
	FOREIGN KEY (order_state_id)
	REFERENCES order_states (id)
);

CREATE TABLE order_menu (
	id INT NOT NULL UNIQUE AUTO_INCREMENT,
	order_id INT NOT NULL,
	price FLOAT NOT NULL,
	detail VARCHAR(200) DEFAULT NULL,
    body VARCHAR(250) NOT NULL,
	CONSTRAINT fk__order_menu__client_order
	FOREIGN KEY (order_id)
	REFERENCES client_order (id)
);