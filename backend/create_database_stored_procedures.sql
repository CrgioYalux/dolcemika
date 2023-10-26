DELIMITER //
CREATE PROCEDURE CreateUserClient(IN email VARCHAR(100))
BEGIN
	-- Create a variable to store the 'client' role id
    DECLARE client_role_id INT DEFAULT -1;
    
    -- Find the role and assign its id to the before-defined variable
    SELECT ur.id INTO client_role_id FROM user_roles AS ur WHERE ur.role = 'client';
    
    -- Use an IF statement to conditionally insert into table B
    IF client_role_id != -1 THEN
        INSERT INTO user (role_id, email) VALUES (client_role_id, email);
    END IF;
END;
//

CREATE PROCEDURE CreateUserAdmin(IN email VARCHAR(100))
BEGIN
	-- Create a variable to store the 'client' role id
    DECLARE admin_role_id INT DEFAULT -1;
    
    -- Find the role and assign its id to the before-defined variable
    SELECT ur.id INTO admin_role_id FROM user_roles AS ur WHERE ur.role = 'admin';
    
    -- Use an IF statement to conditionally insert into table B
    IF admin_role_id != -1 THEN
        INSERT INTO user (role_id, email) VALUES (admin_role_id, email);
    END IF;
END;
//
	--
DELIMITER ;