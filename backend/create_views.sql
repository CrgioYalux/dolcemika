CREATE VIEW LastOrderCurrentStatesView AS
SELECT
		ocs.order_id,
		ocs.created_at AS last_created_at,
		ocs.order_state_id
	FROM order_current_state ocs
    JOIN (
		SELECT
			order_id,
			MAX(created_at) AS max_created_at
		FROM order_current_state
        GROUP BY order_id
    ) max_created
    ON ocs.order_id = max_created.order_id AND ocs.created_at = max_created.max_created_at;

CREATE VIEW ClientOrdersAtLastState AS
SELECT
	co.id as order_id, co.total_price, co.created_at, co.updated_at, co.estimated_for, co.detail,
    locsv.last_created_at AS last_state_change_at,
	os.state,
    u.email,
    ud.fullname, ud.cellphone
FROM client_order co
JOIN LastOrderCurrentStatesView locsv ON locsv.order_id = co.id
JOIN order_states os ON os.id = locsv.order_state_id
JOIN user_client uc ON uc.id = co.client_id
JOIN user u ON u.id = uc.user_id
JOIN user_description ud ON u.id = ud.user_id;
