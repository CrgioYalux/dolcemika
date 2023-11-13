const USERS = {
    GET: /^\/api\/users\/(\d+)\/?$/,
    AUTH: /^\/api\/users\/auth\/?$/,
    POST_CLIENT: /^\/api\/users\/clients\/?$/,
    POST_ADMIN: /^\/api\/users\/admins\/?$/,
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
    GET_BY_CLIENT_ID: /^\/api\/orders\/clients\/(\d+)\/?$/,
    POST: /^\/api\/orders\/?$/,
    GET_STATES: /^\/api\/orders\/states\/?$/,
    GET_STATE_HISTORY: /^\/api\/orders\/(\d+)\/states\/?$/,
    GET_AMOUNT_BY_CLIENTS: /^\/api\/orders\/clients\/?$/,
    POST_CUSTOM_STATE: /^\/api\/orders\/(\d+)\/states\/(\d+)\/?$/,
    POST_NEXT_STATE: /^\/api\/orders\/(\d+)\/states\/next\/?$/,
    POST_PAUSED_STATE: /^\/api\/orders\/(\d+)\/states\/paused\/?$/,
    POST_REVISING_STATE: /^\/api\/orders\/(\d+)\/states\/revising\/?$/,
    POST_CANCELED_STATE: /^\/api\/orders\/(\d+)\/states\/canceled\/?$/,
    POST_FINISHED_STATE: /^\/api\/orders\/(\d+)\/states\/finished\/?$/,
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

