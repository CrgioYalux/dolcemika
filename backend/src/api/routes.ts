const USERS = {
    GET: /^\/api\/users\/(\d+)\/?$/,
    AUTH: /^\/api\/users\/auth\/?$/,
    POST_CLIENT: /^\/api\/users\/clients\/?$/,
};

const MENU = {
    GET: /^\/api\/menu\/?$/,
};

const ORDERS = {
    GET: /^\/api\/orders\/?$/,
    GET_BY_ID: /^\/api\/orders\/(\d+)\/?$/,
    POST: /^\/api\/orders\/?$/,
    POST_STATE: /^\/api\/orders\/(\d+)\/states\/(\d+)?$/,
    GET_STATES: /^\/api\/orders\/states\/?$/,
    GET_STATE_HISTORY: /^\/api\/orders\/(\d+)\/states\/?$/,
};

const ROUTES = { 
    USERS,
    MENU,
    ORDERS,
};

export { ROUTES };

