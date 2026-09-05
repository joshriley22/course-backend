export class CoursesTakenList {
    private static instance: CoursesTakenList;
    private courses: string[] = [];

    private constructor() {}

    public static getInstance(): CoursesTakenList {
        if (!CoursesTakenList.instance) {
            CoursesTakenList.instance = new CoursesTakenList();
        }
        return CoursesTakenList.instance;
    }


    public addCourse(uuid: string) {
        if (!this.courses.includes(uuid)) {
            this.courses.push(uuid);
        }
    }


    public getCourses(): string[] {
        return this.courses;
    }


    public removeCourse(uuid: string) {
        const index = this.courses.indexOf(uuid);
        if (index !== -1) {
            this.courses.splice(index, 1);
        }
    }

}