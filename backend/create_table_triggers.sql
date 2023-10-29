USE `dolcemika`;

DELIMITER //

CREATE TRIGGER set_group_id_to_id_if_null_parent
BEFORE INSERT ON menu_item
FOR EACH ROW
BEGIN
	IF NEW.parent_id IS NULL THEN
		SET NEW.group_id = LAST_INSERT_ID() + 1;
	END IF;
END;
//

CREATE TRIGGER register_user_by_role
AFTER INSERT
ON user
FOR EACH ROW
BEGIN
	DECLARE client_role_id TINYINT DEFAULT -1;

	SELECT ur.id INTO client_role_id FROM user_roles AS ur WHERE ur.role = 'client';

	IF NEW.role_id = client_role_id THEN
		INSERT INTO user_client (user_id) VALUES (NEW.id);
	ELSE
		INSERT INTO user_admin (user_id) VALUES (NEW.id);
	END IF;
END;
//

DELIMITER ;


