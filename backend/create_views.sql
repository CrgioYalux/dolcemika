CREATE VIEW OrderCurrentStateInMaxCreatedAtView AS
	SELECT
		ocs.order_id,
        MAX(ocs.created_at) AS max_created_at
	FROM order_current_state ocs
    GROUP BY ocs.order_id;

CREATE VIEW OrdersInLastStateView AS
	SELECT
		ocs.order_id,
		ocs.created_at AS last_state_at,
        ocs.order_state_id AS state_id,
        os.state
	FROM order_current_state ocs
	JOIN OrderCurrentStateInMaxCreatedAtView max
	ON ocs.order_id = max.order_id AND ocs.created_at = max.max_created_at
	JOIN order_states os
	ON ocs.order_state_id = os.id;

CREATE VIEW OrdersDescribedInLastStateView AS
	SELECT
		co.client_id,
        oilsv.*
	FROM client_order co
    JOIN OrdersInLastStateView oilsv
    ON co.id = oilsv.order_id;

CREATE VIEW ClientOrdersAtLastState AS
SELECT
	cod.*,
    locsv.last_state_at,
	locsv.state,
    u.email,
    ud.fullname, ud.cellphone
FROM client_order co
JOIN client_order_description cod ON co.id = cod.order_id
JOIN OrdersInLastStateView locsv ON locsv.order_id = co.id
JOIN user_client uc ON uc.id = co.client_id
JOIN user u ON u.id = uc.user_id
JOIN user_description ud ON u.id = ud.user_id;

CREATE VIEW MenuItemsDescribed AS
	SELECT
		IF(mi.is_available = 1, TRUE, FALSE) AS is_available,
		mi.id,
		mi.parent_id,
		mid.title,
		mid.detail,
		mid.price,
		mid.image
	FROM menu_item mi
	JOIN menu_item_description mid ON mi.id = mid.menu_item_id;
    
DROP VIEW OrderCurrentStateInMaxCreatedAtView;
DROP VIEW OrdersInLastStateView;
DROP VIEW OrderDescribedInLastStateView;
DROP VIEW ClientOrdersAtLastState;
DROP VIEW MenuItemsDescribed;