
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
        """The Major's fields and the credits each needs (`credits[i]` goes with `fields[i]`)."""

        query = """
        MATCH (m:Major {name: $major_name})
        RETURN m.fields AS fields, m.credits AS credits
        """

        result = session.run(query, major_name=major_name)
        record = result.single()

        fields = record["fields"] if record and record["fields"] else []
        credits = record["credits"] if record and record["credits"] else []
        return {"fields": fields, "credits": credits}

    def get_taken_field_courses(self, session, major_name, field, course_taken_list):

        query = """
        MATCH (t:Course) WHERE t.uuid IN $course_taken_list
        WITH collect(DISTINCT t.code + ' ' + t.number) AS taken
        MATCH (:Major {name: $major_name})-[:COURSE_OF {relationship: $field}]->(c:Course)
        WHERE c.code + ' ' + c.number IN taken
        RETURN DISTINCT c.code AS code, c.number AS number, c.name AS name, c.credits AS credits
        ORDER BY code, number
        """

        result = session.run(query, major_name=major_name, field=field, course_taken_list=course_taken_list)
        return [record.data() for record in result]