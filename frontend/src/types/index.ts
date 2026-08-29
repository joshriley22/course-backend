export interface CourseEdge {
  source_code: string;
  source_number: string;
  source_status: number;
  target_code: string;
  target_number: string;
  target_status: number;
  depth: number;
}

export interface CourseData {
  code: string;
  number: string;
  name: string;
  rating: number;
}

export interface FieldDetails {
  major_name: string;
  field: string;
}

export interface ClassDetails {
  days: string;
  start: string;
  end: string;
  professor: string;
  professor_rating: string;
}

export interface PrerequisiteRelationship {
  prereq1_code: string;
  prereq1_number: string;
  prereq1_name: string;
  prereq1_rating: number;
  prereq2_code: string | null;
  prereq2_number: string | null;
  prereq2_name: string | null;
  prereq2_rating: number | null;
  relationship: string | null;
}

export interface CourseDetails {
  credits: number;
  fields: FieldDetails[];
  prerequisites: PrerequisiteRelationship[];
  children: CourseData[];
  sessions: ClassDetails[];
}
