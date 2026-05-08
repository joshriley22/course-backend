class ProfessorRepository:

    def create_professor(self, session, name, rating):

        query = """
        CREATE (p:Professor {name:$name, rating:$rating})
        RETURN p
        """

        result = session.run(query, name=name, rating=rating)

        return result.single()

    def get_professor(self, session, name):
        query="""
        MATCH(p:Professor {name:$name})
        RETURN p
        """

        result = session.run(query, name=name)
        return [result.single()]

    def get_professors(self, session):

        query = """
        MATCH (p:Professor)
        RETURN p.name AS name, p.rating AS rating
        """

        result = session.run(query)

        return [record.data() for record in result]

    def professor_exists(self, session, name):
        query = """
            OPTIONAL MATCH (p:Professor {name:$name})
            RETURN p IS NOT NULL AS EXISTS
            """

        result = session.run(query, name=name)

        return result.single()["EXISTS"]