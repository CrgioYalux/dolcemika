const USERS = {
    GET: /^\/api\/users\/(\d+)\/?$/,
    AUTH: /^\/api\/users\/auth\/?$/,
    POST: /^\/api\/users\/?$/,
    // PUT_DESCRIPTION: /^\/api\/users\/(\d+)\/description\/?$/,
};

const MENU = {
    GET: /^\/api\/menu\/?$/,
};

const ORDERS = {
    GET: /^\/api\/orders\/?$/,
    GET_BY_ID: /^\/api\/orders\/(\d+)\/?$/,
    POST: /^\/api\/orders\/?$/,
};

const ROUTES = { 
    USERS,
    MENU,
    ORDERS,
};

export { ROUTES };

