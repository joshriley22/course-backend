
export function formatFields(fieldList: string[]) : string[] {
    const formattedList : string[] = [];
    for(const field of fieldList) {
        switch(field) {
            case 'prereq':
                formattedList.push('Prerequisites');
                break;
            case 'elective':
                formattedList.push('Electives');
                break;
            case 'core':
                formattedList.push('Core');
                break;
            case 'integration':
                formattedList.push('Integration Electives');
                break;
            case 'general':
                formattedList.push('General Electives');
                break;
            case 'computing':
                formattedList.push('Computing Electives');
                break;
            case 'aip':
                formattedList.push('Artistic, Interpretive, and Philosophical Inquiry');
                break;
            case 'cmp':
                formattedList.push('The Chemical, Mathematical, and Physical Universe');
                break;
            case 'csw':
                formattedList.push('Cultures and Societies of the World');
                break;
            case 'hp':
                formattedList.push('Historical Perspectives');
                break;
            case 'ls':
                formattedList.push('Living Systems');
                break;
            case 'ss':
                formattedList.push('Science and Society');
                break;
            case 'ses':
                formattedList.push('Social and Economic Systems');
                break;
            case 'writing1':
                formattedList.push('First Writing Requirement');
                break;
            case 'writing2':
                formattedList.push('Second Writing Requirement');
                break;
            case 'foundations':
                formattedList.push('Engineering Foundations');
                break;
            case 'calculus':
                formattedList.push('Calculus');
                break;
            case 'chemistry':
                formattedList.push('General Chemistry');
                break;
            case 'physics':
                formattedList.push('General Physics');
                break;
            case 'programming':
                formattedList.push('Introduction to Programming');
                break;
            case 'sts':
                formattedList.push('Science, Technology, & Society');
                break;
            case 'mathsci':
                formattedList.push('Math/Science Elective I');
                break;
            case 'hss':
                formattedList.push('Humanities & Social Science Electives');
                break;
            default:
                formattedList.push(field);
                break;
            }
        }
        return formattedList;
    }