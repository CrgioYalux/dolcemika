const USERS = {
    GET: /\/api\/users\/?(\d+)?\/?/,
    AUTH: /\/api\/users\/auth\/?/,
    POST: /\/api\/users\/?/,
    PUT_DESCRIPTION: /\/api\/users\/(\d+)\/description\/?/,
};

const MENU = {
    GET: /\/api\/menu\/?/,
};

const ROUTES = { 
    USERS,
    MENU,
};

export { ROUTES };

