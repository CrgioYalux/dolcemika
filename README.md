# DolceMika Monorepo  

## Rutas  

### Pedidos  

| Method   | Roles             | Endpoint                         | Description                                                                             | Body |
|:--------:|:------------------|:---------------------------------|:----------------------------------------------------------------------------------------|:-----|
| **GET**  | Admin / Client    | /api/orders/                     | Trae todos los pedidos                                                                  |      |
| **GET**  | Admin / Client    | /api/orders/:id/                 | Trae un pedido según su id                                                              |      |
| **GET**  | Admin             | /api/orders/states               | Trae todos los posibles estados de un pedido                                            |      |
| **GET**  | Admin / Client    | /api/orders/:id/states/          | Trae todos los estados por los que pasó un pedido según su id                           |      |
| **GET**  | Admin             | /api/orders/clients/             | Trae los usuarios que hicieron pedidos y la cantidad de pedidos hechos para cada uno    |      |
| **GET**  | Admin / Client    | /api/orders/:id/comments/        | Trae los comentarios de un pedido hechos post-creación                                  |      |
| **POST** | Client            | /api/orders/:id/comments/        | Crea un comentario post-creación en el pedido                                           |      |
| **POST** | Client            | /api/orders/                     | Crea un pedido                                                                          |      |
| **POST** | Admin             | /api/orders/:id/states/:id/      | Crea, como el último, un estado custom en un pedido                                     |      |
| **POST** | Admin             | /api/orders/:id/states/next/     | Crea, como el último, el siguiente estado lógico al actual en un pedido                 |      |
| **POST** | Admin             | /api/orders/:id/states/paused/   | Crea, como el último, el estado paused en un pedido                                     |      |
| **POST** | Admin             | /api/orders/:id/states/revising/ | Crea, como el último, el estado revising en un pedido                                   |      |
| **POST** | Admin             | /api/orders/:id/states/canceled/ | Crea, como el último, el estado canceled en un pedido                                   |      |
| **POST** | Admin             | /api/orders/:id/states/finished/ | Crea, como el último, el estado finished en un pedido                                   |      |
| **DEL**  | Client            | /api/orders/:id/comments/:id     | Elimina un comentario post-creación en el pedido                                        |      |
| **GET**  | Client            | /api/orders/trending/            | Trae los tres items del menu más pedidos                                                |      |

### Menu  

| Method   | Roles          | Endpoint       | Description                 | Body |
|:--------:|:---------------|:---------------|:----------------------------|:-----|
| **GET**  | Admin / Client | /api/menu/     | Trae el menu                |      |
| **POST** | Admin          | /api/menu/     | Crea un item del menu       |      |
| **PUT**  | Admin          | /api/menu/     | Modifica un item del menu   |      |
| **DEL**  | Admin          | /api/menu/id/  | Elimina un item del menu    |      |

### Users

| Method   | Roles           | Endpoint                     | Description                 | Body |
|:--------:|:----------------|:-----------------------------|:----------------------------|:-----|
| **GET**  | Admin           | /api/users/:id/              | Trae un usuario según su id |      |
| **POST** | Client          | /api/users/clients/          | Crea un usuario client      |      |
| **POST** | Admin           | /api/users/admins/           | Crea un usuario admin       |      |
| **POST** | Client / Admin  | /api/users/auth/             | Autentica un usuario        |      |

### Inventario  

| Method   | Roles | Endpoint            | Description                             | Body |
|:--------:|:------|:--------------------|:----------------------------------------|:-----|
| **GET**  | Admin | /api/inventory/     | Trae el inventario                      |      |
| **POST** | Admin | /api/inventory/     | Crea un ingrediente del inventario      |      |
| **PUT**  | Admin | /api/inventory/:id/ | Modifica un ingrediente del inventario  |      |
| **DEL**  | Admin | /api/inventory/:id/ | Elimina un item del inventario          |      |

---

#### TODO  
- [ ] **Required** - GET /api/order/:id has in its returning data structure the menu of the order, but the body property must be parsed from 'x-y-z-t' to the actual menu
- [X] **Required** - Admin can see a list of clients and how many orders they have had
- [X] **Required** - GET /api/menu for admin has to include those not available items
- [X] **Required** - Fix +3 hours date offset MySQL is adding
- [ ] Trending menu options - as in a new tab - If selected one, push to menu.
- [ ] Differentiate route handling based on role
- [ ] Birthday event for client
- [ ] Add the expected body structure to all routes defined in this readme
- [ ] Users authed as clients can't access to admin-level-required routes
- [X] Route for next state, pause and end order
- [X] GET /api/menu should be accesible even when not authed

---

#### Ideas for later  
- Closed, come by later

#### [Stuff learned](/docs/an_unnecessary_fix.md)
