class Professor:
    id: int
    name: str
    rating: float
    def __init__(self, id, name):
        self.id = id
        self.name = name
        self.rating = 0.0