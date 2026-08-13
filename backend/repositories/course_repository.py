
class CourseRepository:


    def create_course(self, session, code, number, name, difficulty, units, is_integration, elective_status):

        query = """
        
        MERGE (c:Course {code:$code, number:$number, name:$name, difficulty:$difficulty, credits:$units, is_integration:$is_integration, elective_status:$elective_status})
        RETURN c
        """

        result = session.run(query, code=code, number=number, name=name, difficulty=difficulty, units=units, is_integration=is_integration, elective_status=elective_status)

        response = result.single()

        return response

    def create_prereq_edge(self, session, course_code, course_number, prereq_code, prereq_number):

        query = """
        MATCH (c:Course {code:$course_code, number:$course_number})
        MATCH (prereq:Course {code:$prereq_code, number:$prereq_number})
        MERGE (prereq)-[rel:PREREQUISITE]->(c)
        RETURN prereq.code AS source_code, prereq.number AS source_number, c.code AS target_code, c.number AS target_number
        """
        result = session.run(query, course_code=course_code, course_number=course_number, prereq_code=prereq_code, prereq_number=prereq_number)

        response = [result.data() for result in result]

        return response

    def create_prereq_rel_edge(self, session, course_code, course_number, prereq1_code, prereq1_number, prereq2_code, prereq2_number, rel):
        query= """
        MATCH (prereq1:Course {code:$prereq1_code, number:$prereq1_number})
        MATCH (prereq2:Course {code:$prereq2_code, number:$prereq2_number})
        MERGE (prereq1)-[rel:PREREQUISITE_RELATIONSHIP{relationship:$relationship, for_course_code:$parent_code, for_course_number:$parent_number}]->(prereq2)
        RETURN prereq1.code AS source_code, prereq1.number AS source_number, prereq2.code AS target_code, prereq2.number AS target_number, rel.relationship AS relationship
        """
        result = session.run(query, prereq1_code=prereq1_code, prereq1_number=prereq1_number, prereq2_code=prereq2_code, prereq2_number=prereq2_number, relationship=rel, parent_code=course_code, parent_number=course_number)

        response = [result.data() for result in result]

        return response

    def get_course(self, session, code, number):
        query = """
        MATCH(c:Course {code:$code, number:$number})
        RETURN c
        """

        result = session.run(query, code=code, number=number)

        response = result.single()

        return response


    def get_co_prereqs_for_course(self, session, prereq_code, prereq_number, course_code, course_number):
        query = """
        MATCH (c:Course {code:$course_code, number:$course_number})-[p:PREREQUISITE_RELATIONSHIP {for_course_code:$for_course_code, for_course_number:$for_course_number}]->(c1:Course)
        RETURN c.code AS source_code, c.number AS source_number, c1.code AS target_code, c1.number AS target_number, p.relationship AS relationship
        """

        result = session.run(query, course_code=prereq_code, course_number=prereq_number, for_course_code=course_code, for_course_number=course_number)

        response = [result.data() for result in result]

        return response


    def get_courses_by_code(self, session, course_code):
        query = """
        MATCH (c:Course {code:$course_code})
        RETURN c.code AS code, c.number AS number
        """

        courses = session.run(query, course_code=course_code)

        response = [result.data() for result in courses]

        return response

    def get_courses(self, session):

        query = """
        MATCH (c:Course)
        RETURN c
        """

        result = session.run(query)

        response = [record.data() for record in result]

        return response

    def get_starter_courses(self, session):

        query = """
        MATCH(c:Course)
        WITH c AS c, toInteger(c.number) AS course_number
        WHERE course_number < 4900 AND NOT ()-[:PREREQUISITE]->(c)
        RETURN c.code AS code, c.number AS number
        """

        result = session.run(query)

        response = [record.data() for record in result]

        return response

    def get_starter_course_by_code(self, session, code):

        query = """
           MATCH(c:Course {code:$code})
           WITH c AS c, toInteger(c.number) AS course_number
           WHERE course_number < 4900 AND NOT ()-[:PREREQUISITE]->(c)
           RETURN c.code AS code, c.number AS number
           """

        result = session.run(query, code=code)

        response = [record.data() for record in result]

        return response


    def get_children(self, session, course_code, course_number):
        query = """
        MATCH (c:Course {code:$course_code, number:$course_number}) -[:PREREQUISITE]-> (next_class:Course)
        RETURN DISTINCT next_class.code AS code, next_class.number AS number
        """

        result = session.run(query, course_code=course_code, course_number=course_number)

        response = [record.data() for record in result]

        return response

    def get_parents(self, session, course_code, course_number):
        query = """
        MATCH (parent:Course)-[:PREREQUISITE]->(c:Course {code:$course_code, number:$course_number})
        RETURN parent.code AS code, parent.number AS number
        """

        result = session.run(query, course_code=course_code, course_number=course_number)

        response = [record.data() for record in result]

        return response

    def course_exists(self, session, course_code, course_number):
        query = """
        OPTIONAL MATCH (c:Course {code:$course_code, number:$course_number})
        RETURN c IS NOT NULL AS EXISTS
        """

        result = session.run(query, course_code=course_code, course_number=course_number)
        return result.single()["EXISTS"]

    def get_course_edges(self, session, course_code):
        query = """
            MATCH (start:Course {code:$course_code})
            WHERE NOT ()-[:PREREQUISITE]->(start) AND (start)-[:PREREQUISITE]->({code:$course_code})
            WITH start
            MATCH path = (start)-[:PREREQUISITE*0..]->(c:Course {code:$course_code})
            WHERE EXISTS { MATCH (c1:Course)-[:PREREQUISITE]->(c) }
            MATCH (c1:Course)-[:PREREQUISITE]->(c) 
            WHERE c1.number <> c.number
            WITH c, c1, start, path
            OPTIONAL MATCH source_path = (start)-[:PREREQUISITE*0..7]->(c1)
            WITH c, c1, min(length(source_path)) + 1 AS source_depth, min(length(path)) AS target_depth
            WITH c, c1, [source_depth, target_depth] AS depths
            UNWIND depths AS d
            WITH c, c1, max(d) AS depth
            RETURN c1.code AS source_code, c1.number AS source_number, c1.elective_status AS source_status, c.code AS target_code, c.number AS target_number, c.elective_status AS target_status, depth
            ORDER BY depth DESC, toInteger(c1.number) DESC
            """
        result = session.run(query, course_code=course_code)
        return [record.data() for record in result]


    def get_sink_nodes(self, session, course_code):
        query = """
        MATCH (n:Course {code:$course_code})
        WHERE NOT (n)-[:PREREQUISITE]->(:Course {code:$course_code})
        RETURN n.code AS code, n.number AS number, n.elective_status AS elective_status"""

        result = session.run(query, course_code=course_code)
        return [record.data() for record in result]

    def get_codes(self, session):
        query = """
        MATCH (c:Course)
        RETURN DISTINCT c.code AS code
        """

        result = session.run(query)

        return [record.data() for record in result]



