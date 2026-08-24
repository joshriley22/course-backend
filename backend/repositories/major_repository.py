
class MajorRepository:

    def get_majors(self, session):

        query = """
        MATCH (m:Major)
        RETURN m.name AS name
        """

        result = session.run(query)

        return [response.data() for response in result]


