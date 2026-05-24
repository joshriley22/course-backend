from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from backend.responses.course import Course


class Edge:
    source: Course
    target: Course
    relationship: str

    def __init__(self, source, target, relationship):
        self.source = source
        self.target = target
        self.relationship = relationship

    def get_source(self):
        return self.source

    def get_target(self):
        return self.target

    def get_relationship(self):
        return self.relationship

    def __str__(self):
        return f"{self.source} {self.relationship} {self.target}"

class Requirement:
    edges: list[Edge]

    def __init__(self):
        self.edges = []

    def __init__(self, edges):
        self.edges = edges

    def add_edge(self, edge):
        self.edges.append(edge)

    def get_edges(self):
        return self.edges

    def __str__(self):
        string = ""
        for edge in self.edges:
            string += str(edge) + " "
        return string