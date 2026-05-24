from backend.repositories.class_repository import ClassRepository

class ClassService:

    def __init__(self):
        self.repo = ClassRepository()

    def create_class(self, session, class_instance):
        return self.repo.create_class(
            session,
            class_instance.class_id,
            class_instance.start_time,
            class_instance.end_time,
            class_instance.days,
            class_instance.enrollment_available,
            class_instance.is_lab,
            class_instance.course_code,
            class_instance.course_number,
            class_instance.elective_status,  # ← swap these two
            class_instance.professor_name,  # ← swap these two
        )

    def get_classes_by_professor(self, session, professor_name):

        return self.repo.get_classes_by_professor(session, professor_name)

    def get_classes_by_course(self, session, course_code, course_number):

        return self.repo.get_classes_by_course(session, course_code, course_number)

    def get_classes(self, session):

        return self.repo.get_classes(session)