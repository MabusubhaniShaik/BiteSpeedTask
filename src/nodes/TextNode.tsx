import { memo } from "react";
import { Handle, Position } from "reactflow";
import "./TextNode.css";

// Memoized TextNode component to prevent unnecessary re-renders
export default memo(({ data }: { data: { label: string; level: number } }) => {
  return (
    <div className="text-node">
      {/* Source handle for outgoing connections, positioned on the left */}
      <Handle type="source" position={Position.Left} />
      <div className="node-header">
        <strong>Send Message</strong>
      </div>
      <div className="node-content">
        <div>Level: {data.level}</div>
        {/* Display the node's label or a default message */}
        <div className="node-label">{data.label || "Text Message"}</div>
      </div>
      {/* Target handle for incoming connections, positioned on the right */}
      <Handle type="target" position={Position.Right} />
    </div>
  );
});
