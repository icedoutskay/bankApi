Thought Process while doing this:

First of all, key design decision:
1. Typesript for typesafety, reduces runtime mistakes


then authorization and authentication
2. I implemented JWT-based authentication to secure endpoints.

3. Access and refresh tokens are used to separate short-term and long-term authentication
4. Role-based authorization ensures users can only access what they are given acess to

 I worked on the authentication first then I wrote a logic to automatically create an account number for a user when they sign up. then once they sign in they can decide to fund thier account or an admin does that and they can make transfer.
 
5. A user can also see their transfer history but the admin role can view all users an all transactions
Database Design & Transactions


6. Transfers are handled using Mongoose transactions, ensuring atomicity: if updating one account fails, the whole transfer is rolled back.

7. This prevents inconsistent balances and guarantees financial integrity.

Error Handling & Validation

8. Input validation is done using to prevent invalid data from entering the system.

9. Consistent error handling with HTTP status codes.


 10. Passwords are hashed with bcrypt before storage.


