
class MajorRepository:

    def get_majors(self, session):

        query = """
        MATCH (m:Major)
        RETURN m.name AS name
        """

        result = session.run(query)

        return [response.data() for response in result];

    def get_fields(self, session, major_name):

        query = """
        MATCH (m:Major {name: $major_name})
        RETURN m.fields AS fields
        """

        result = session.run(query, major_name=major_name)
        record = result.single()

        return record["fields"] if record else None