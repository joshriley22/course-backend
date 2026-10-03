

class ReviewRepository:

    def create_review(self, session, course_code, course_number, review_text, rating, username):
        query="""
    MATCH (c:Course {code:$course_code, number:$course_number})
    WITH c ORDER BY coalesce(toFloat(c.credits), 0) DESC
    LIMIT 1
    MATCH (u:User {username:$username})
    OPTIONAL MATCH (c)-[:REVIEW]-(existing:Review)
    WITH c, u, count(existing) AS num_reviews
    CREATE (r:Review {text:$review_text, rating:$rating, created_at:timestamp()})
    SET c.rating = toFloat((coalesce(c.rating, 0) * num_reviews) + $rating) / (num_reviews + 1)
    MERGE (u)-[:AUTHOR]->(r)
    MERGE (c)-[:REVIEW]->(r)
    RETURN r.text AS text, r.rating AS rating, r.created_at AS created_at, u.username AS username,
           c.rating AS course_rating, num_reviews + 1 AS review_count
    """

        result = session.run(query, course_code=course_code, course_number=course_number, review_text=review_text, rating=rating, username=username)

        record = result.single()
        return record.data() if record is not None else None

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
    WITH DISTINCT r, u
    RETURN r.text AS text, r.rating AS rating, u.username AS username, r.created_at AS created_at
    ORDER BY r.created_at DESC
    """

        result = session.run(query, course_code=course_code, course_number=course_number)

        return [record.data() for record in result]
