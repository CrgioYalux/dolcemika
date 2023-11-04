# DolceMika Monorepo  

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
    - **POST** /api/inventory/ : Crea un ingrediente del inventario
    - **PUT**  /api/inventory/:id/ : Modifica un ingrediente del inventario
    - **DEL**  /api/inventory/:id/ : Elimina un item del inventario

### Ideas for later  

### TODO  
- [ ] Admin can see a list of clients and how many orders they have had
- [ ] Birthday event for client
- [ ] Trending menu options - as in a new tab - If selected one, push to menu.
- [X] GET /api/menu should be accesible even when not authed
- [ ] Agregar la estructura de body esperada por cada ruta en este readme

### [Stuff learned](/docs/an_unnecessary_fix.md)
