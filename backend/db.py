from pathlib import Path

from neo4j import GraphDatabase
from dotenv import load_dotenv
import os

load_dotenv(".env")

class Neo4jDB:
    def __init__(self):
        self.driver = GraphDatabase.driver(
            os.getenv("NEO4J_URI"),
            auth=(os.getenv("NEO4J_USERNAME"), os.getenv("NEO4J_PASSWORD"))
        )

    def get_session(self):
        return self.driver.session()

db = Neo4jDB()