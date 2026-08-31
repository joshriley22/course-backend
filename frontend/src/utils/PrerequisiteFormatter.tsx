import type { PrerequisiteRelationship } from '../types';

function courseFromPrereq(prereq: PrerequisiteRelationship, index : number) : string {
    if( index === 0) {
        return `${prereq.prereq1_name} (${prereq.prereq1_code} ${prereq.prereq1_number})`;
        }
    else if (index === 1){
        return `${prereq.prereq2_name} (${prereq.prereq2_code} ${prereq.prereq2_number})`;
        }
    }

//claude had this really elegant find-union structure answer but I felt bad about outsourcing the logic (let's call it 'refactoring for readability') so I did this
export function formatPrerequisites(prereqs: PrerequisiteRelationship[]): string {
        if((prereqs.length === 1 && !prereqs[0].prereq1_code) || prereqs === null) return '';
        let course = courseFromPrereq(prereqs[0], 0);
        const courseList = [course];
        const courseQueue = [course];
        var finalString = course + ' ';
        while(courseQueue.length > 0) {
            const nextEdge = searchPrerequisites(courseQueue[0], prereqs);
                if(nextEdge !== null) {
                    var nextCourse : string = (courseQueue[0] === courseFromPrereq(nextEdge, 0)) ? courseFromPrereq(nextEdge, 1) : courseFromPrereq(nextEdge, 0);
                    if(!contains(courseList, nextCourse)) {
                    finalString += `${nextEdge.relationship} ${nextCourse} `;
                    courseList.push(nextCourse);
                    courseQueue.push(nextCourse);
                    }
                    }
                courseQueue.shift();
            }
        return finalString;
    }

function searchPrerequisites(course: string, prereqs: PrerequisiteRelationship[]): PrerequisiteRelationship | null {
        for(const p of prereqs) {
            if((courseFromPrereq(p, 0) === course || courseFromPrereq(p, 1) === course) && p.relationship) {
                return p;
                }
            }
        return null;
    }

function contains(arr: string[], target: string): boolean {
    for(const item of arr) {
        if(item === target) return true;
        }
    return false;
    }