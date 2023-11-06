# DolceMika Monorepo  

### Rutas  

- Pedidos
    - **GET**  (Admin|Client) /api/orders/                 : Trae todos los pedidos
    - **GET**  (Admin|Client) /api/orders/:id/             : Trae un pedido según su id
    - **GET**  (Admin)        /api/orders/states           : Trae todos los posibles estados de un pedido (Admin)
    - **GET**  (Admin|Client) /api/orders/:id/states/      : Trae todos los estados por los que pasó un pedido según su id 
    - **GET**  (Admin)        /api/orders/users/           : Trae los usuarios que hicieron pedidos y la cantidad de pedidos hechos para cada uno
    - **GET**  (Admin|Client) /api/orders/:id/comments/    : Trae los comentarios de un pedido hechos post-creación
    - **POST** (Client)       /api/orders/:id/comments/    : Crea un comentario post-creación en el pedido
    - **POST** (Client)       /api/orders/                 : Crea un pedido
    - **POST** (Admin)        /api/orders/:id/states/:id/  : Crea el último estado de un pedido según su id
    - **DEL**  (Client)       /api/orders/:id/comments/:id : Elimina un comentario post-creación en el pedido
    - **GET**  (Client)       /api/orders/trending/        : Trae los tres items del menu más pedidos

- Menu
    - **GET**  (Admin|Client) /api/menu/     : Trae el menu
    - **POST** (Admin)        /api/menu/     : Crea un item del menu
    - **PUT**  (Admin)        /api/menu/     : Modifica un item del menu
    - **DEL**  (Admin)        /api/menu/:id/ : Elimina un item del menu

- Clientes
    - **GET**  (Admin)  /api/users/:id/  : Trae un usuario según su id
    - **POST** (Client) /api/users/      : Crea un usuario 
    - **POST** (Client) /api/users/auth/ : Autentica un usuario

- Inventario
    - **GET**  (Admin) /api/inventory/     : Trae el inventario
    - **POST** (Admin) /api/inventory/     : Crea un ingrediente del inventario
    - **PUT**  (Admin) /api/inventory/:id/ : Modifica un ingrediente del inventario
    - **DEL**  (Admin) /api/inventory/:id/ : Elimina un item del inventario

### Ideas for later  
- Closed, come by later

### TODO  
- [ ] Required - Differentiate route handling based on role
- [ ] Admin can see a list of clients and how many orders they have had
- [ ] Birthday event for client
- [ ] Trending menu options - as in a new tab - If selected one, push to menu.
- [X] GET /api/menu should be accesible even when not authed
- [ ] Add the expected body structure to all routes defined in this readme
- [ ] Users authed as clients can't access to admin-level-required routes
- [ ] GET /api/menu for admin has to include those not available items
- [ ] Fix +3 hours date offset MySQL is adding
- [X] Route for next state, pause and end order
- [ ] GET /api/order/:id has in its returning data structure the menu of the order, but the body property must be parsed from 'x-y-z-t' to the actual menu

### [Stuff learned](/docs/an_unnecessary_fix.md)
