import { Handle, Position } from '@xyflow/react';

interface CourseNodeData {
  code: string;
  number: string;
  isCrossDept: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CourseNode({ data }: { data: any }) {
  const { code, number, isCrossDept } = data as CourseNodeData;

  return (
    <div
      style={{
        width: 84,
        height: 84,
        borderRadius: '50%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: isCrossDept ? '#f59e0b' : '#3b82f6',
        color: '#fff',
        fontWeight: 600,
        fontSize: 11,
        lineHeight: 1.3,
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
        userSelect: 'none',
        cursor: 'default',
        border: '2px solid rgba(255,255,255,0.3)',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <span style={{ fontSize: 10, opacity: 0.85 }}>{code}</span>
      <span style={{ fontSize: 13 }}>{number}</span>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
}
