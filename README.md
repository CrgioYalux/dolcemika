# DolceMika Monorepo  

### TODO  
- [ ] (Optional) Admin can see a list of clients and how many orders they have had
- [ ] (Optional) Birthday event for client
- [ ] (Optional) Trending menu options - as in a new tab
    - If selected one, push to menu
- [ ] (Required) Finish project
- [X] (Required) Don't allow to change user's description
- [X] (Required) Require the user's description to create an user so don't have to create more pages
- [X] (Required) MenuOption might not be needed if MenuItem has a 'is_available' attribute
- [ ] (Required) If authed, send all required user info to the client.
    - If don't do, I think there's going to be a problem with the middleware pipeline flow
    because those routes that require an authentication token (like /api/users/:id)
    might have to be explicitly defined before the auth middleware to work.
    Let's say you authed, you get your user id which you use to query /api/users/:id
    for your client info. But /api/users/auth has to be before the auth middleware, and
    /api/users/:id has to be after in order to only be queryable by an authenticated user.
    - This whole way of thinking it seems wrong.
    - Token could transport the id.


### Ideas for later  

- For trending orders

Table ClientOrder (
    body '1-4-5'
)

SELECT body, COUNT(*) FROM ClientOrder JOIN ClientOrder ON id = id;

GetMenuSequence([1, 4, 5]) => 'Torta Bizcochuelo Chocolate'
[
{ name: 1-4-5, count: 10 }
{ name: 1-4-2, count: 10 }
{ name: 1-4-10, count: 10 }
]

### Rutas  

- Pedidos
    - **GET**  /api/orders/ : Trae todos los pedidos
    - **GET**  /api/orders/:id/ : Trae un pedido según su id
    - **GET**  /api/orders/states : Trae todos los posibles estados de un pedido
    - **GET**  /api/orders/:id/states/ : Trae todos los estados por los que pasó un pedido según su id
    - **GET**  /api/orders/users/ : Trae los usuarios que hicieron pedidos y la cantidad de pedidos hechos para cada uno
    - **GET**  /api/orders/:id/comments/ : Trae los comentarios de un pedido hechos post-creación
    - **POST** /api/orders/:id/comments/ : Crea un comentario post-creación en el pedido
    - **POST** /api/orders/ : Crea un pedido
    - **POST** /api/orders/:id/states/:id/ : Crea el último estado de un pedido según su id
    - **DEL**  /api/orders/:id/comments/:id : Elimina un comentario post-creación en el pedido
    - **GET**  /api/orders/trending/ : Trae los tres items del menu más pedidos

- Menu
    - **GET**  /api/menu/ : Trae el menu
    - **POST** /api/menu/ : Crea un item del menu
    - **PUT**  /api/menu/ : Modifica un item del menu
    - **DEL**  /api/menu/:id/ : Elimina un item del menu

- Clientes
    - **GET**  /api/users/:id/ : Trae un usuario según su id
    - **POST** /api/users/ : Crea un usuario 
    - **POST** /api/users/auth/ : Autentica un usuario

- Inventario
    - **GET**  /api/inventory/ : Trae el inventario
    - **POST** /api/inventory/ : Crea un item del inventario
    - **PUT**  /api/inventory/:id/ : Modifica un item del inventario
    - **DEL**  /api/inventory/:id/ : Elimina un item del inventario

### [Stuff learned](/docs/an_unnecessary_fix.md)
