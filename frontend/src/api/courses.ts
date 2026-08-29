import type { CourseEdge, CourseDetails, CourseData, FieldDetails, ClassDetails, PrerequisiteRelationship } from '../types';

export async function fetchCodes(): Promise<string[]> {
  const res = await fetch('/courses/codes');
  if (!res.ok) throw new Error('Failed to fetch course codes');
  const data: { code: string }[] = await res.json();
  return data.map((d) => d.code).sort();
}

export async function fetchCourseEdges(major: string, field: string): Promise<CourseEdge[]> {
  const res = await fetch(`/courses/${major}/${field}/edges`);
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
  const res = await fetch(`/courses/${major}/${field}/co-prereq-edges`);
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

export async function fetchFields(major_name: string): Promise<string[]> {
    const res = await fetch(`/majors/${encodeURIComponent(major_name)}/fields`);
    if (!res.ok) throw new Error('Failed to fetch fields');
    const data: { field: string[] } = await res.json();
    return data;
    }

export async function fetchCourseInfo(code: string, number: string): Promise<CourseDetails> {
    const res = await fetch(`/courses/${code}/${number}`);
    if (!res.ok) throw new Error('Failed to fetch course info');
    const data = await res.json();

    return {
        credits: data.course_credits,
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


