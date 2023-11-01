### An unnecessary fix for creating clients

There is a trigger for the `user` table that after each insert executes an insert query to the `user_client` table.  
There is also a stored procedure whose purpose is to create users of role client. But everytime I called it from
the API an error kept saying something like *'RESULT CONSISTED OF MORE THAN ONE ROW'*.  
After looking it up with no luck for solutions but for reasons, I started to understand what was wrong.  
In the stored procedure, first I needed to find the role_id for the 'client' role so I could use it in the `insert into user` query.
The query for that was `SELECT ur.id FROM user_roles ur WHERE ur.role = 'client';`, and because I needed to retain the found id,
I had a previously declared variable called `client_role_id` for storing it. Added that to the query and it ended up as
`SELECT ur.id INTO client_role_id FROM user_roles ur WHERE ur.role = 'client';`. That's when to problem starts.  
So, it's pretty reasonable now - after hours of reading and trying - but, **that query does not necessary have to return only one row**,
or, said in other words, the 'sql interpreter' can't just assume that it'll return only one row just like you can,
because you defined only two possible roles. And basically the problem is that the `client_role_id` variable defined
to store the result of the find-the-client-role-id query, and it basically treats it as if there's a multiple assignation, thus the starting point:  
*'RESULT CONSISTED OF MORE THAN ONE ROW'*.  

The solution is even worse, because after the full re-wrote of the procedure in its equal in javascript with the [mysql library](https://www.npmjs.com/package//mysql)
(which I thought was my only way out), having to learn that it was as easy as adding a `LIMIT 1` at the end of the find-the-client-role-id query,
doesn't leave me with more words to use than that one.  
To be fair though, it solved the problem but took me 30 more minutes to remember the trigger in the `user` table, the one I first mentioned.  
In that trigger I'm doing the same thing done at the beginning of the stored procedure, so I had to also add a `LIMIT 1` to the end of
its query to finally be able to create users of role client through the API.  

The query ended up being: `SELECT ur.id INTO client_role_id FROM user_roles ur WHERE ur.role = 'client' LIMIT 1;`.  

I will not go back to using the procedure since we only expect to create clients using the API.
Admins get the privilege of being created manually in the database.
