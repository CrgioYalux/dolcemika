-- Initial required INSERTS

USE `dolcemika`;

INSERT INTO user_roles (role) VALUES ('client');
INSERT INTO user_roles (role) VALUES ('admin');

INSERT INTO order_states (state) VALUES ('just arrived'); -- client sends order
INSERT INTO order_states (state) VALUES ('accepted'); -- admin accepts it
INSERT INTO order_states (state) VALUES ('started'); -- bro started cooking
INSERT INTO order_states (state) VALUES ('paused'); -- bro stopped cooking
INSERT INTO order_states (state) VALUES ('revising'); -- client might have added a post-ordered detail => admin reviews it
INSERT INTO order_states (state) VALUES ('canceled'); -- both client or admin can cancel - client before 'to be delivered', admin anytime
INSERT INTO order_states (state) VALUES ('to be delivered'); -- bro finished cooking
INSERT INTO order_states (state) VALUES ('finished'); -- the order was either delivered or just ended for any other reason - no need to take care of


INSERT INTO menu_item (title) VALUES ('Torta');
INSERT INTO menu_item (group_id, parent_id, title) VALUES (1, 1, 'Bizcochuelo');
INSERT INTO menu_item (group_id, parent_id, title) VALUES (1, 1, 'Chocolate');

CALL CreateUserClient('user@gmail.com');

INSERT INTO client_order (client_id, total_price) VALUES (1, 10.00);
INSERT INTO order_current_state (order_id, order_state_id) VALUES (1, 4);

DROP TRIGGER register_user_by_role;
