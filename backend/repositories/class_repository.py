class ClassRepository:

    def create_class(self, session, class_id, start_time, end_time, days, enrollment_available, is_lab, course_code, course_number, elective_status, professor_name):


        query = """
            MATCH (c1:Course {elective_status:$elective_status, code:$course_code, number:$course_number})
            WITH c1
            CREATE (c:Class {class_id:$class_id, start_time:$start_time, end_time:$end_time, days:$days, enrollment_available:$enrollment_available, is_lab:$is_lab})
            CREATE (c) -[:SESSION_OF] -> (c1)
            WITH c
            MERGE (p:Professor {name: $professor_name})
            ON CREATE SET p.rating = 0.0
            CREATE (p)-[:PROFESSOR_OF]->(c)
            """

        result = session.run(query, class_id=class_id, start_time=start_time, end_time=end_time, days=days, enrollment_available=enrollment_available, is_lab=is_lab, course_code=course_code, course_number=course_number, elective_status=elective_status, professor_name=professor_name)

        return result.single()

    def get_classes_by_professor(self, session, professor_name):
        query = """
        MATCH (:Professor {name:$professor_name})-[:PROFESSOR_OF]->(c:Class)
        WITH c
        MATCH (c)-[:SESSION_OF]->(course:Course)
        RETURN  
        c.start_time AS start, 
        c.end_time AS end, 
        c.days AS days, 
        c.enrollment_available AS enrollment_available, 
        c.is_lab AS is_lab, 
        c.course_code AS course_code, 
        c.course_number AS course_number 
        """

        result = session.run(query, professor_name=professor_name)
        return [record.data() for record in result]

    def get_classes_by_course(self, session, course_code, course_number):
        query = """
        MATCH(c:Class)-[:SESSION_OF]->(course:Course {code:$course_code, number:$course_number})
        RETURN 
        c.start_time AS start, 
        c.end_time AS end, 
        c.days AS days, 
        c.enrollment_available AS enrollment_available, 
        c.is_lab AS is_lab, 
        c.course_code AS course_code, 
        c.course_number AS course_number
        """

        result = session.run(query, course_code=course_code, course_number=course_number)

        return [record.data() for record in result]

    def get_classes(self, session):

        query = """
        MATCH (c:Class)
        WITH c
        MATCH (c)-[:SESSION_OF]->(course:Course)
        MATCH (p:Professor)-[:PROFESSOR_OF]->(c)
        RETURN c.start_time AS start, c.end_time AS end, c.days AS days, c.enrollment_available AS enrollment_available, c.is_lab AS is_lab, course.code AS code, course.number AS number, course.name AS name, course.difficulty AS difficulty, p.rating AS professor_rating
        """

        result = session.run(query)

        return [record.data() for record in result]