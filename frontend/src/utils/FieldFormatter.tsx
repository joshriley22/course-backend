
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
            }
        }
        return formattedList;
    }