
class UserRepository:

    def validate_user(self, session, username, password):
        query= """
        MATCH(u:User {username:$username, password:$password})
        RETURN u
        """

        result = session.run(query, username=username, password=password)
        return result.single()