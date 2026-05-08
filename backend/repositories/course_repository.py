

class CourseRepository:


    def create_course(self, session, code, number, name, difficulty, units, is_integration, elective_status):

        query = """
        
        CREATE (c:Course {code:$code, number:$number, name:$name, difficulty:$difficulty, credits:$units, is_integration:$is_integration, elective_status:$elective_status})
        RETURN c
        """

        result = session.run(query, code=code, number=number, name=name, difficulty=difficulty, units=units, is_integration=is_integration, elective_status=elective_status)

        return result.single()

    def create_prereq_edge(self, session, course_code, course_number, prereq_code, prereq_number):

        query = """
        MATCH (c:Course {code:$course_code, number:$course_number})
        MATCH (prereq:Course {code:$prereq_code, number:$prereq_number})
        MERGE (c)-[rel:PREREQUISITE]->(prereq)
        RETURN rel
        """
        result = session.run(query, course_code=course_code, course_number=course_number, prereq_code=prereq_code, prereq_number=prereq_number)

        return result.single()

    def create_prereq_rel_edge(self, session, course_code, course_number, prereq1_code, prereq1_number, prereq2_code, prereq2_number, rel):
        query= """
        MATCH (prereq1:Course {code:$prereq1_code, number:$prereq1_number})
        MATCH (prereq2:Course {code:$prereq2_code, number:$prereq2_number})
        MERGE (prereq1)-[rel:PREREQUISITE_RELATIONSHIP{relationship:$relationship, for_course_code:$parent_code, for_course_number:$parent_number}]->(prereq2)
        """
        result = session.run(query, prereq1_code=prereq1_code, prereq1_number=prereq1_number, prereq2_code=prereq2_code, prereq2_number=prereq2_number, relationship=rel, parent_code=course_code, parent_number=course_number)

        return result.single()


    def get_course(self, session, code, number):
        query = """
        MATCH(c:Course {code:$code, number:$number})
        RETURN c.code AS code, c.number AS number, c.name AS name
        """

        result = session.run(query, code=code, number=number)
        return result.single()

    def get_prerequisites(self, session, code, number):
        return self.get_prerequisites_unformatted(session, code, number, [])

    def get_prerequisites_unformatted(self, session, code, number, prereq_groups):

        query = """
                MATCH(c:Course {code:$code, number:$number})
                MATCH (c)-[:PREREQUISITE]->(prereq:Course) 
                RETURN prereq.code AS code, prereq.number AS number, c.name AS for_course
                """
        prereqs = session.run(query, code=code, number=number)
        for prereq in prereqs:
            prereq_singular_group = self.get_co_prereqs(session, prereq["code"], prereq["number"], prereq["for_course"])
            if len(prereq_singular_group) != 0:
                prereq_groups.append(prereq_singular_group)
            prereq_groups.append(self.get_prerequisites_unformatted(session, prereq["code"], prereq["number"], []))
        return prereq_groups

    def get_co_prereqs(self, session, code, number, parent_code, parent_number):
        query = """
                MATCH(c:Course {code:$code, number:$number})
                WITH c
                OPTIONAL MATCH path = (c)-[rel:PREREQUISITE_RELATIONSHIP*1.. {for_course_code:$for_course_code, for_course_number:$for_course_number}]->(prereq:Course)
                RETURN c.code AS source_code, c.number AS source_number, prereq.code AS target_code, prereq.number AS target_number, [r in relationships(path) | r.relationship] AS relationships
                ORDER BY length(path)
                """
        co_prereq = session.run(query, code=code, number=number, for_course_code=parent_code, for_course_number=parent_number)
        return [result.data() for result in co_prereq]


    def get_courses(self, session):

        query = """
        MATCH (c:Course)
        RETURN c.code AS code, c.number AS number, c.name AS name
        """

        result = session.run(query)

        return [record.data() for record in result]

    def get_children(self, session, course_code, course_number):
        query = """
        MATCH (c:Course) -[:PREREQUISITE]-> (earlier:Course {code:$course_code, number:$course_number})
        RETURN earlier.code AS code, earlier.number AS number
        """

        result = session.run(query, course_code=course_code, course_number=course_number)

        return [record.data() for record in result]


    def course_exists(self, session, course_code, course_number):
        query = """
        OPTIONAL MATCH (c:Course {code:$course_code, number:$course_number})
        RETURN c IS NOT NULL AS EXISTS
        """

        result = session.run(query, course_code=course_code, course_number=course_number)
        return result.single()["EXISTS"]