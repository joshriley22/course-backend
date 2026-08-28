import type { CourseEdge } from '../types';

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
    target_code: d.target_code,
    target_number: d.target_number,
    target_name: d.target_name,
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
    target_code: d.target_code,
    target_number: d.target_number,
    target_name: d.target_name,
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

