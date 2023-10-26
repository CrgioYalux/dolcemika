CREATE SCHEMA `dolcemika`;

USE `dolcemika`;

CREATE TABLE user_roles (
	id TINYINT(1) NOT NULL UNIQUE AUTO_INCREMENT,
	role VARCHAR(50) NOT NULl,
	PRIMARY KEY (id)
);

INSERT INTO user_roles (role) VALUES ('admin');
INSERT INTO user_roles (role) VALUES ('client');
INSERT INTO user_roles (role) VALUES ('god');

CREATE TABLE client_order_states (
	id TINYINT(1) NOT NULL UNIQUE AUTO_INCREMENT,
	state VARCHAR(50) NOT NULL,
	PRIMARY KEY (id)
);
 
INSERT INTO client_order_states (state) VALUES ('just arrived'); -- client sends order
INSERT INTO client_order_states (state) VALUES ('accepted'); -- admin accepts it
INSERT INTO client_order_states (state) VALUES ('started'); -- bro started cooking
INSERT INTO client_order_states (state) VALUES ('paused'); -- bro stopped cooking
INSERT INTO client_order_states (state) VALUES ('revising'); -- client might have added a post-ordered detail => admin reviews it
INSERT INTO client_order_states (state) VALUES ('canceled'); -- both client or admin can cancel - client before 'to be delivered', admin anytime
INSERT INTO client_order_states (state) VALUES ('to be delivered'); -- bro finished cooking
INSERT INTO client_order_states (state) VALUES ('finished'); -- the order was either delivered or just ended for any other reason - no need to take care of


CREATE TABLE user (
	id INT NOT NULL UNIQUE AUTO_INCREMENT,
	role_id TINYINT(1) NOT NULL,
	username VARCHAR(100) NOT NULL UNIQUE,
	email VARCHAR(100) NOT NULL UNIQUE,
	fullname VARCHAR(100) NOT NULL,
	PRIMARY KEY (id),
	CONSTRAINT fk__user__user_roles
	FOREIGN KEY (role_id)
	REFERENCES user_roles (id)
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
	user_id INT NOT NULL,
	cellphone VARCHAR(20) NOT NULL,
	birthdate DATE NOT NULL,
	CONSTRAINT fk__user_client__user
	FOREIGN KEY (user_id)
	REFERENCES user (id)
);

CREATE TABLE user_admin ( -- this might not be needed, but it feels weird to only have an user_client so I'd try to find some data worth saving here
	user_id INT NOT NULL,
	CONSTRAINT fk__user_admin__user
	FOREIGN KEY (user_id)
	REFERENCES user (id)
);

CREATE TABLE menu_item (
	id INT NOT NULL UNIQUE AUTO_INCREMENT,
	group_id INT NOT NULL,
	parent_id INT DEFAULT NULL,
	title VARCHAR(100) NOT NULL,
	detail VARCHAR(100) DEFAULT NULL,
	price FLOAT NOT NULL,
	PRIMARY KEY (id),
	CONSTRAINT fk__menu_item__menu_item
	FOREIGN KEY (parent_id)
	REFERENCES menu_item (id)
);

CREATE TABLE menu_option (
	id INT NOT NULL UNIQUE AUTO_INCREMENT,
	menu_item_id INT NOT NULL UNIQUE, -- should be only all parent_id=null rows from menu_item table
	is_available BIT(1) NOT NULL,
	price FLOAT NOT NULL,
	PRIMARY KEY (id),
	CONSTRAINT fk__menu__menu_item
	FOREIGN KEY (menu_item_id)
	REFERENCES menu_item (id)
);

CREATE TABLE menu_option_stock (
	menu_option_id INT NOT NULL UNIQUE,
	stock INT NOT NULL,
	CONSTRAINT fk__menu_option_stock__menu_option
	FOREIGN KEY (menu_option_id)
	REFERENCES menu_option (id)
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
);

CREATE TABLE client_order (
	id INT NOT NULL UNIQUE AUTO_INCREMENT, -- use this for allowing the use to retrieve the order's state or to make changes in it
	client_id INT NOT NULL,
	total_price FLOAT NOT NULL,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
	estimated_for DATETIME DEFAULT NULL,
	detail VARCHAR(200) DEFAULT NULL,
	PRIMARY KEY (id),
	CONSTRAINT fk__client_order__client
	FOREIGN KEY (client_id)
	REFERENCES client (id)
);

CREATE TABLE client_order_comment (
	id INT NOT NULL UNIQUE AUTO_INCREMENT,
	client_order_id INT NOT NULL,
	detail VARCHAR(300) NOT NULL,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk__client_order_comment__client_order
	FOREIGN KEY (client_order_id)
	REFERENCES client_order (id)
);

CREATE TABLE client_order_current_state (
	client_order_id INT NOT NULL,
	client_order_state_id TINYINT(1) NOT NULL,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk__client_order_current_state__client_order
	FOREIGN KEY (client_order_id)
	REFERENCES client_order (id),
	CONSTRAINT fk__client_order_current_state__client_order_states
	FOREIGN KEY (client_order_state_id)
	REFERENCES client_order_states (id)
);

CREATE TABLE client_order_menu_selected (
	id INT NOT NULL UNIQUE AUTO_INCREMENT,
	client_order_id INT NOT NULL,
	price FLOAT NOT NULL,
	detail VARCHAR(200) DEFAULT NULL,
	CONSTRAINT fk__menu_selected__client_order
	FOREIGN KEY (client_order_id)
	REFERENCES client_order (id)
);

CREATE TABLE client_order_menu_selected_description (
	client_order_menu_selected_id INT NOT NULL,
	menu_item_id INT NOT NULL,
	CONSTRAINT fk__menu_selected_description__menu_selected
	FOREIGN KEY (menu_selected_id)
	REFERENCES menu_selected (id),
	CONSTRAINT fk__menu_selected_description__menu_item
	FOREIGN KEY (menu_item_id)
	REFERENCES menu_item (id)
);

DELIMITER //
CREATE TRIGGER set__menu_item__group_id__before_insert
BEFORE INSERT ON menu_item
FOR EACH ROW
BEGIN
	IF NEW.parent_id IS NULL THEN
		SET NEW.group_id = LAST_INSERT_ID() + 1;
	END IF;
END;
//
DELIMITER ;
