# DolceMika Monorepo  

### TODO  
- (Optional) Admin can see a list of clients and how many orders they have had
- (Optional) Birthday event for client
- (Optional) Trending menu options - as in a new tab
    - If selected one, push to menu
- (Required) Finish project
- (Required) Don't allow to change user's description
- (Required) Require the user's description to create an user so don't have to create more pages
- (Required) MenuOption might not be needed if MenuItem has a 'is_available' attribute

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
    - GET /api/orders/ : Trae todos los pedidos
    - GET /api/orders/:id/ : Trae un pedido según su id
    - GET /api/orders/states : Trae todos los posibles estados de un pedido
    - POST /api/orders/ : Crea un pedido
    - POST /api/orders/:id/states/:id/ : Crea el último estado de un pedido según su id
    - GET /api/orders/:id/states/ : Trae todos los estados por los que pasó un pedido según su id

- Menu
    - GET /api/menu/ : Trae el menu
    - POST /api/menu/ : Crea un item del menu
    - PUT /api/menu/ : Modifica item del menu

- Clientes
    - GET /api/users/:id/ : Trae un usuario según su id
    - POST /api/users/ : Crea un usuario 
    - POST /api/users/auth/ : Autentica un usuario

### [Stuff learned](/docs/an_unnecessary_fix.md)
