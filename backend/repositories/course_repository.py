

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
        RETURN c
        """

        result = session.run(query, code=code, number=number)
        return result.single()

    def get_courses_by_code(self, session, course_code):
        query = """
        MATCH (c:Course {code:$course_code})
        RETURN c.code AS code, c.number AS number
        """

        courses = session.run(query, course_code=course_code)
        return [result.data() for result in courses]

    def get_prerequisites(self, session, code, number):
        return self.get_prerequisites_unformatted(session, code, number, [])

    def get_prerequisites_unformatted(self, session, code, number, prereq_groups):

        query = """
                MATCH(c:Course {code:$code, number:$number})
                MATCH (c)-[:PREREQUISITE]->(prereq:Course) 
                RETURN c.name AS for_course, prereq
                """
        prereqs = session.run(query, code=code, number=number)
        for prereq in prereqs:
             prereq_singular_group = self.get_co_prereqs(session, code, number)
             if len(prereq_singular_group) != 0:
                 prereq_groups.append(prereq_singular_group)
             prereq_groups.append(self.get_prerequisites_unformatted(session, prereq["code"], prereq["number"], []))
        return prereqs


    #Takes a course and returns its prerequisites and their relationships to each other
    def get_co_prereqs(self, session, course_code, course_number):
        query = """
                MATCH(c:Course {code:$code, number:$number})-[:PREREQUISITE]->(c1:Course)
                MATCH path = (c1)-[rel:PREREQUISITE_RELATIONSHIP*1..5 {for_course_code:$code, for_course_number:$number}]->(prereq:Course)
                WITH relationships(path) AS rels
                UNWIND rels AS rel
                WITH startNode(rel) AS start, endNode(rel) AS end, rel
                RETURN start.code AS source_code, start.number AS source_number, end.code AS target_code, end.number AS target_number, rel{.*} AS relationship
                """
        co_prereq = session.run(query, code=course_code, number=course_number)
        return [result.data() for result in co_prereq]


    def get_courses(self, session):

        query = """
        MATCH (c:Course)
        RETURN c
        """

        result = session.run(query)

        return [record.data() for record in result]

    def get_children(self, session, course_code, course_number):
        query = """
        MATCH (c:Course {code:$course_code, number:$course_number}) -[:PREREQUISITE]-> (next_class:Course)
        RETURN DISTINCT next_class.code AS code, next_class.number AS number
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