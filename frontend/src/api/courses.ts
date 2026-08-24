import type { CourseEdge } from '../types';

export async function fetchCodes(): Promise<string[]> {
  const res = await fetch('/courses/codes');
  if (!res.ok) throw new Error('Failed to fetch course codes');
  const data: { code: string }[] = await res.json();
  return data.map((d) => d.code).sort();
}

export async function fetchCourseEdges(code: string): Promise<CourseEdge[]> {
  const res = await fetch(`/courses/${code}/edges`);
  if (!res.ok) throw new Error(`Failed to fetch edges for ${code}`);
  return res.json();
  }

export async function fetchMajors(): Promise<string[]> {
    const res = await fetch('/majors');
    if (!res.ok) throw new Error('Failed to fetch majors');
    const data: { major: string }[] = await res.json();
    return data.map((d) => d.name).sort();
    }

