
class UserRepository:

    def get_user(self, session, username):
        query= """
        MATCH(u:User {username:$username})
        RETURN u.username AS username, u.password AS password
        """

        result = session.run(query, username=username)
        return result.single()

    def create_user(self, session, username, password):
        query="""
        CREATE (u:User {username:$username, password:$password})
        RETURN u
        """

        result = session.run(query, username=username, password=password)
        return result.single()

    def add_taken_course(self, session, username, course_code, course_number):
        query = """
        MATCH (u:User {username:$username})
        MATCH (c:Course {code:$course_code, number:$course_number})
        WITH u, c ORDER BY coalesce(toFloat(c.credits), 0) DESC
        LIMIT 1
        MERGE (u)-[r:TOOK]->(c)
        ON CREATE SET r.added_at = timestamp()
        RETURN c.uuid AS uuid
        """

        result = session.run(query, username=username, course_code=course_code, course_number=course_number)
        return result.single()

    def get_taken_courses(self, session, username):
        query = """
        MATCH (:User {username:$username})-[r:TOOK]->(c:Course)
        OPTIONAL MATCH (s:Class)-[:SESSION_OF]->(c)
        WITH c, r, collect(DISTINCT {days: s.days, start_time: s.start_time, end_time: s.end_time}) AS all_sessions
        RETURN c.uuid AS uuid, c.code AS code, c.number AS number, c.name AS name,
               c.rating AS rating, c.credits AS credits,
               [x IN all_sessions WHERE x.days IS NOT NULL] AS sessions,
               size([(c)-[:REVIEW]-(:Review) | 1]) AS review_count
        ORDER BY r.added_at DESC
        """

        result = session.run(query, username=username)
        return [record.data() for record in result]

    def remove_taken_course(self, session, username, course_code, course_number):
        query = """
        MATCH (:User {username:$username})-[r:TOOK]->(:Course {code:$course_code, number:$course_number})
        DELETE r
        RETURN count(r) AS removed
        """

        result = session.run(query, username=username, course_code=course_code, course_number=course_number)
        return result.single()["removed"]
