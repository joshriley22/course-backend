
class MajorRepository:

    def create_major(self, session, major_name):
        query = """
        MERGE (m:Major {name:$major_name})
        """

        session.run(query, major_name=major_name)

    def set_major_fields(self, session, major_name, fields):
        query = """
        MATCH (m:Major {name:$major_name})
        SET m.fields = $fields
        """

        session.run(query, major_name=major_name, fields=fields)

    def add_course_to_major(self, session, major_name, course_code, course_number, field):
        query="""
        MATCH (m:Major {name:$major_name})
        MATCH (c:Course {code:$course_code, number:$course_number})
        MERGE (m)-[:COURSE_OF {relationship:$field}]->(c)
        """

        session.run(query, major_name=major_name, course_code=course_code, course_number=course_number, field=field)


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

        return record["fields"] if record and record["fields"] else []