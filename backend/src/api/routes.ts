const USERS = {
    GET: /^\/api\/users\/(\d+)\/?$/,
    AUTH: /^\/api\/users\/auth\/?$/,
    POST_CLIENT: /^\/api\/users\/clients\/?$/,
};

const MENU = {
    GET: /^\/api\/menu\/?$/,
    POST_ITEM: /^\/api\/menu\/?$/,
    PUT_ITEM_AVAILABILITY: /^\/api\/menu\/(\d+)\/?$/,
    PUT_ITEM_DESCRIPTION: /^\/api\/menu\/(\d+)\/?$/,
    DELETE_ITEM: /^\/api\/menu\/(\d+)\/?$/,
};

const ORDERS = {
    GET: /^\/api\/orders\/?$/,
    GET_BY_ID: /^\/api\/orders\/(\d+)\/?$/,
    POST: /^\/api\/orders\/?$/,
    POST_STATE: /^\/api\/orders\/(\d+)\/states\/(\d+)\/?$/,
    GET_STATES: /^\/api\/orders\/states\/?$/,
    GET_STATE_HISTORY: /^\/api\/orders\/(\d+)\/states\/?$/,
};

const INVENTORY = {
    GET: /^\/api\/inventory\/?$/,
    POST_INGREDIENT: /^\/api\/inventory\/?$/,
    PUT_INGREDIENT_STOCK: /^\/api\/inventory\/(\d+)\/?$/,
    PUT_INGREDIENT_DESCRIPTION: /^\/api\/inventory\/(\d+)\/?$/,
    DELETE_INGREDIENT: /^\/api\/inventory\/(\d+)\/?$/,
};

const ROUTES = { 
    USERS,
    MENU,
    ORDERS,
    INVENTORY,
};

export { ROUTES };

