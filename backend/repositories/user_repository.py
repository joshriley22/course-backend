
class UserRepository:

    def get_user(self, session, username):
        query= """
        MATCH(u:User {username:$username})
        RETURN u.username AS username, u.password AS password
        """

        result = session.run(query, username=username)
        return result.single()

    def create_user(self, session, username, password):
        query="""
        CREATE (u:User {username:$username, password:$password})
        RETURN u
        """

        result = session.run(query, username=username, password=password)
        return result.single()