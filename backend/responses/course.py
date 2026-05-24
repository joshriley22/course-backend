from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from backend.responses.edge import Edge, Requirement


class Course:
    code: str
    number: str
    depth: int
    edges: set[Edge]
    requirements: set[Requirement]
    def __init__(self, code, number):
        self.code = code
        self.number = number

    def add_edge(self, edge):
        self.edges.add(edge)

    def get_edges(self):
        return self.edges

    def get_code(self):
        return self.code

    def get_number(self):
        return self.number

    @staticmethod
    def is_equal(course1, course2):
        return course1.code == course2.code and course1.number == course2.number

    def __str__(self):
        return f"{self.code} {self.number}"