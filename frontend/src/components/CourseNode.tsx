export interface CourseNodeData {
    code: string
    number: string
    name?: string
    credits?: string
    difficulty?: number
    elective_status?: number
    rank?: number
}

export function CourseNode(data: CourseNodeData) {
    return (
        <div
            style={{
                width: '5vh',
                height: '5vh',
                backgroundColor: '#d1d1d1',
                borderRadius: '50%',
                cursor: 'pointer',
                textAlign: 'center',
                }}
            >
            <span>{data.code}{data.number}</span>
        </div>
        );
}

