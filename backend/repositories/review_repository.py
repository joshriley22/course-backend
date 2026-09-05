

class ReviewRepository:

    def create_review(self, session, course_code, course_number, review_text, rating, username):
        query="""
    CREATE (r:Review {text:$review_text, rating:$rating})
    MATCH (c: Course {code:$course_code, number:$course_number})
    OPTIONAL MATCH (c:Course)-[:REVIEW]-(r1:Review)
    WITH c, r, count(r1) AS num_reviews
    SET c.rating = toFloat((coalesce(c.rating, 0) * num_reviews) + r.rating) / (num_reviews + 1)
    WITH c, r
    MERGE (u:User {username:$username})
    MERGE (u)-[:AUTHOR]->(r)
    MERGE (c)-[:REVIEW]->(r)
    """

        result = session.run(query, course_code=course_code, course_number=course_number, review_text=review_text, rating=rating, username=username)

        return result.single()

    def get_reviews_by_user(self, session, username):
        query = """
    MATCH (u:User {username:$username})-[:AUTHOR]->(r:Review)
    MATCH (c:Course)-[:REVIEW]-(r)
    RETURN r.text AS text, r.rating AS rating, c.code AS course_code, c.number AS course_number
    """

        result = session.run(query, username=username)

        return [record.data() for record in result]

    def get_reviews_by_course(self, session, course_code, course_number):
        query = """
    MATCH (c:Course {code:$course_code, number:$course_number})-[:REVIEW]-(r:Review)
    MATCH (u:User)-[:AUTHOR]->(r)
    RETURN r.text AS text, r.rating AS rating, u.username AS username
    """

        result = session.run(query, course_code=course_code, course_number=course_number)

        return [record.data() for record in result]