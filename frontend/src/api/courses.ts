import type { CourseEdge, CourseDetails, CourseData, FieldDetails, ClassDetails, PrerequisiteRelationship, TakenCourse, CourseSearchResult, EligibleCourse, CourseReview, PostedReview, MajorFields } from '../types';

export async function fetchCodes(): Promise<string[]> {
  const res = await fetch('/courses/codes');
  if (!res.ok) throw new Error('Failed to fetch course codes');
  const data: { code: string }[] = await res.json();
  return data.map((d) => d.code).sort();
}

export async function fetchCourseEdges(major: string, field: string): Promise<CourseEdge[]> {
  const res = await fetch(`/courses/${major}/${encodeURIComponent(field)}/edges`);
  if (!res.ok) throw new Error(`Failed to fetch edges for ${major}`);
  const data = await res.json();
  return data.map((d: any) => ({
    source_code: d.source_code,
    source_number: d.source_number,
    source_name: d.source_name,
    source_rating: d.source_rating,
    target_code: d.target_code,
    target_number: d.target_number,
    target_name: d.target_name,
    target_rating : d.target_rating,
    for_course_code: d.for_course_code,
    for_course_number: d.for_course_number,
    relationship: d.relationship,
  }));
  }

export async function fetchCoPrereqEdges(major: string, field: string): Promise<CourseEdge[]> {
  const res = await fetch(`/courses/${major}/${encodeURIComponent(field)}/co-prereq-edges`);
  if (!res.ok) throw new Error(`Failed to fetch edges for ${major}`);
  const data = await res.json();
  return data.map((d: any) => ({
    source_code: d.source_code,
    source_number: d.source_number,
    source_name: d.source_name,
    source_rating: d.source_rating,
    target_code: d.target_code,
    target_number: d.target_number,
    target_name: d.target_name,
    target_rating : d.target_rating,
    for_course_code: d.for_course_code,
    for_course_number: d.for_course_number,
    relationship: d.relationship,
  }));
  }

export async function fetchMajors(): Promise<string[]> {
    const res = await fetch('/majors');
    if (!res.ok) throw new Error('Failed to fetch majors');
    const data: { major: string }[] = await res.json();
    return data.map((d) => d.name).sort();
    }

export async function fetchFields(major_name: string): Promise<MajorFields> {
    const res = await fetch(`/majors/${encodeURIComponent(major_name)}/fields`);
    if (!res.ok) throw new Error('Failed to fetch fields');
    const data: Partial<MajorFields> | null = await res.json();
    return { fields: data?.fields ?? [], credits: data?.credits ?? [] };
    }

export async function fetchCourseUuid(code: string, number: string): Promise<string> {
    const res = await fetch(`/courses/${code}/${number}/uuid`);
    if (!res.ok) throw new Error('Failed to fetch course uuid');
    const data: { uuid: string } = await res.json();
    return data.uuid;
    }

export async function fetchEligibleNextCourses(courseTakenList: string[], electiveList: string[], majorList: string[]): Promise<EligibleCourse[]> {
    const res = await fetch('/courses/eligible-next-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            course_taken_list: courseTakenList,
            elective_list: electiveList,
            major_list: majorList,
        }),
    });
    if (!res.ok) throw new Error('Failed to fetch eligible next courses');
    const data = await res.json();
    return data.map((c: any): EligibleCourse => {
        const credits = Number(c.credits);
        return {
            code: c.code,
            number: c.number,
            name: c.name,
            rating: c.rating,
            reviewCount: c.review_count ?? 0,
            credits: Number.isFinite(credits) ? credits : undefined,
            sessions: (c.sessions ?? []).map((s: any) => ({
                days: s.days,
                startTime: s.start_time,
                endTime: s.end_time,
                isLab: !!s.is_lab,
                startsAfter10: !!s.starts_after_10,
                endsBefore5: !!s.ends_before_5,
                avoidsLunch: !!s.avoids_lunch,
            })),
        };
    });
}

// A single course with every session it offers, shaped for adding to the schedule
export async function fetchScheduleCourse(code: string, number: string): Promise<EligibleCourse> {
    const res = await fetch(`/courses/${encodeURIComponent(code)}/${encodeURIComponent(number)}/schedule`);
    if (!res.ok) throw new Error('Failed to fetch course sessions');
    const c = await res.json();
    const credits = Number(c.credits);
    return {
        code: c.code,
        number: c.number,
        name: c.name,
        rating: c.rating,
        reviewCount: c.review_count ?? 0,
        credits: Number.isFinite(credits) ? credits : undefined,
        sessions: (c.sessions ?? []).map((s: any) => ({
            days: s.days,
            startTime: s.start_time,
            endTime: s.end_time,
            isLab: !!s.is_lab,
        })),
    };
}

export async function searchCourses(query: string, signal?: AbortSignal): Promise<CourseSearchResult[]> {
    const res = await fetch(`/courses/search?q=${encodeURIComponent(query)}`, { signal });
    if (!res.ok) throw new Error('Failed to search courses');
    return res.json();
}

export async function fetchTakenCourses(username: string): Promise<TakenCourse[]> {
    const res = await fetch(`/users/${encodeURIComponent(username)}/courses`);
    if (!res.ok) throw new Error('Failed to fetch taken courses');
    const data = await res.json();
    return data.map((c: any): TakenCourse => {
        const credits = Number(c.credits);
        return {
            uuid: c.uuid,
            code: c.code,
            number: c.number,
            name: c.name,
            rating: c.rating,
            reviewCount: c.review_count ?? 0,
            credits: Number.isFinite(credits) ? credits : undefined,
            sessions: (c.sessions ?? []).map((s: any) => ({
                days: s.days,
                startTime: s.start_time,
                endTime: s.end_time,
            })),
        };
    });
}

export async function addTakenCourse(username: string, code: string, number: string): Promise<void> {
    const res = await fetch(`/users/${encodeURIComponent(username)}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_code: code, course_number: number }),
    });
    if (!res.ok) throw new Error('Failed to add course');
}

export async function removeTakenCourse(username: string, code: string, number: string): Promise<void> {
    const res = await fetch(
        `/users/${encodeURIComponent(username)}/courses/${encodeURIComponent(code)}/${encodeURIComponent(number)}`,
        { method: 'DELETE' },
    );
    if (!res.ok) throw new Error('Failed to remove course');
}

export async function fetchCourseReviews(code: string, number: string): Promise<CourseReview[]> {
    const res = await fetch(`/courses/${encodeURIComponent(code)}/${encodeURIComponent(number)}/reviews`);
    if (!res.ok) throw new Error('Failed to fetch reviews');
    return res.json();
}

export async function postReview(username: string, code: string, number: string, rating: number, text: string): Promise<PostedReview> {
    const res = await fetch('/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            course_code: code,
            course_number: number,
            review_text: text,
            rating,
            username,
        }),
    });
    if (!res.ok) throw new Error('Failed to post review');
    return res.json();
}

export async function fetchCourseInfo(code: string, number: string): Promise<CourseDetails> {
    const res = await fetch(`/courses/${code}/${number}`);
    if (!res.ok) throw new Error('Failed to fetch course info');
    const data = await res.json();

    return {
        credits: data.course_credits,
        name: data.course_name,
        number: data.course_number,
        code: data.course_code,
        fields: data.fields.map((f: any): FieldDetails => ({
            major_name: f.major_name,
            field: f.major_fields,
        })),
        prerequisites: data.prereqs.map((p: any): PrerequisiteRelationship => ({
            prereq1_code: p.prereq1_code,
            prereq1_number: p.prereq1_number,
            prereq1_name: p.prereq1_name,
            prereq1_rating: p.prereq1_rating,
            prereq2_code: p.prereq2_code,
            prereq2_number: p.prereq2_number,
            prereq2_name: p.prereq2_name,
            prereq2_rating: p.prereq2_rating,
            relationship: p.relationship,
        })),
        children: data.children.map((c: any): CourseData => ({
            code: c.child_code,
            number: c.child_number,
            name: c.child_name,
            rating: c.child_rating,
        })),
        sessions: data.sessions.map((s: any): ClassDetails => ({
            days: s.class_days,
            start: s.class_start_time,
            end: s.class_end_time,
            professor: s.professor_name,
            professor_rating: s.professor_rating,
        })),
    };
}


