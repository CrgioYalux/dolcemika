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

CREATE TRIGGER create_client_from_user
AFTER INSERT
ON user
FOR EACH ROW
BEGIN
	INSERT INTO user_client (user_id) VALUES (NEW.id);
END;
//

CREATE TRIGGER create_admin_from_user
AFTER INSERT
ON user
FOR EACH ROW
BEGIN
	INSERT INTO user_admin (user_id) VALUES (NEW.id);
END;
//

DELIMITER ;