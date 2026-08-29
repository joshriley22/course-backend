
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

    def get_course_details(self, session, code, number):
        query = """
        OPTIONAL MATCH (m:Major)-[requirement:COURSE_OF]->(c1:Course {code:$code, number:$number})
        OPTIONAL MATCH (c2:Course)-[:PREREQUISITE]->(c1)
        OPTIONAL MATCH (c2)-[p1:PREREQUISITE_RELATIONSHIP {for_course_code:$code, for_course_number: $number}]->(c4:Course)
        OPTIONAL MATCH (c1)-[:PREREQUISITE]->(c3)
        WITH c1,
        collect(DISTINCT {major_fields: requirement.relationship, major_name: m.name}) AS fields,
        collect(DISTINCT {
            prereq1_code: c2.code, prereq1_number: c2.number, prereq1_name: c2.name, prereq1_rating: c2.rating,
            prereq2_code: c4.code, prereq2_number: c4.number, prereq2_name: c4.name, prereq2_rating: c4.rating,
            relationship: p1.relationship
        }) AS prereqs,
        collect(DISTINCT { child_code: c3.code,  child_number: c3.number,  child_name: c3.name, child_rating: c3.rating}) AS children
        MATCH (p:Professor)-[:PROFESSOR_OF]->(c:Class)-[:SESSION_OF]->(c1)
        WITH c1, fields, prereqs, children,
        collect(DISTINCT { class_days: c.days, class_start_time: c.start_time,  class_end_time: c.end_time,
        professor_name: p.name, professor_rating: p.rating })[0..3] AS sessions
        RETURN c1.credits AS course_credits, fields, prereqs, children, sessions
        """

        result = session.run(query, code=code, number=number)

        response = result.single()

        return response.data() if response is not None else None


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

    def get_course_edges(self, session, major_name, field):
        query = """
            MATCH (:Major {name:$major_name})-[:COURSE_OF {relationship:$field}]->(c:Course)
            OPTIONAL MATCH (c:Course)-[:PREREQUISITE]->(c1:Course)
            WHERE c1.number <> c.number AND (:Major {name:$major_name})-[:COURSE_OF {relationship:$field}]->(c1)
            RETURN c.code AS source_code, c.number AS source_number, c.name AS source_name, c.rating AS source_rating,
                   c1.code AS target_code, c1.number AS target_number, c1.name AS target_name, c1.rating AS target_rating
            """
        result = session.run(query, major_name=major_name, field=field)
        return [record.data() for record in result]

    def get_co_prereq_edges(self, session, major_name, field):

        query = """
        MATCH (:Major {name:$major_name})-[:COURSE_OF {relationship:$field}]->(c:Course)
        MATCH (:Major {name:$major_name})-[:COURSE_OF {relationship:$field}]->(c1)
        MATCH (c)-[e:PREREQUISITE_RELATIONSHIP]->(c1)
        RETURN c.code AS source_code, c.number AS source_number, c.name AS source_name,
        c1.code AS target_code, c1.number AS target_number, c1.name AS target_name, e.relationship AS relationship, 
        e.for_course_code AS for_course_code, e.for_course_number AS for_course_number
        """

        result = session.run(query, major_name=major_name, field=field);
        return [record.data() for record in result]



    def get_sink_nodes(self, session, major_name, field):
        query = """
        MATCH (:Major {name:$major_name})-[:COURSE_OF {relationship:$field}]->(n:Course)
        WHERE NOT (n)-[:PREREQUISITE]->(:Course)
        RETURN n.code AS code, n.number AS number, n.name AS name
        """

        result = session.run(query, major_name=major_name, field=field)
        return [record.data() for record in result]

    def get_codes(self, session):
        query = """
        MATCH (c:Course)
        RETURN DISTINCT c.code AS code
        """

        result = session.run(query)

        return [record.data() for record in result]



