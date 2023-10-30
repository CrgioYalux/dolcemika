# DolceMika Monorepo

### TODO
- (Optional) Admin can see a list of clients and how many orders they have had
- (Optional) Birthday event for client
- (Optional) Trending menu options - as in a new tab
    - If selected one, push to menu
- (Required) Finish project
- (Required) Don't allow to change user's description
- (Required) Require the user's description to create an user so don't have to create more pages

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
