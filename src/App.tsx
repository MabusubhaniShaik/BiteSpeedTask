import {
  ReactFlowProvider,
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
} from "reactflow";
import "reactflow/dist/style.css";
import { useState, useCallback } from "react";
import TextNode from "./nodes/TextNode";
import { Sidebar } from "./components/Sidebar";
import "./index.css";

const nodeTypes = { textNode: TextNode };

// Interface for node data to ensure type safety
interface TextNodeData {
  label: string;
  level: number;
}

function FlowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState<TextNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState<number>(1);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handles adding a new text node to the flow
  // Event: Triggered when user adds a node via Sidebar input
  const onAddTextNode = useCallback(
    (label: string) => {
      // Ensure level is a number for arithmetic operation
      const nodeLevel: number = level;
      // Create a new node with a unique ID
      const newNode: Node<TextNodeData> = {
        id: `${Date.now()}-${nodeLevel}`, // Use Date.now() for safer ID generation
        type: "textNode",
        position: { x: nodeLevel * 300, y: Math.random() * 200 },
        data: { label, level: nodeLevel },
      };
      // Append the new node to the existing nodes array
      setNodes((nds) => [...nds, newNode]);
      // Increment level for the next node
      setLevel((prevLevel) => prevLevel + 1);
    },
    [setNodes, level]
  );

  // Handles creating a new edge between nodes
  // Event: Triggered when user connects two nodes in the ReactFlow canvas
  const onConnect = useCallback(
    (params: Edge | Connection) => {
      // Check if the source node already has an outgoing edge
      const sourceAlreadyConnected = edges.some(
        (e) => e.source === params.source
      );
      if (!sourceAlreadyConnected) {
        // Add the new edge if no existing outgoing edge is found
        setEdges((eds) => addEdge(params, eds));
      } else {
        // Set error message instead of alert for consistent UI
        setError("Only one outgoing connection allowed per node.");
        setTimeout(() => setError(null), 3000);
      }
    },
    [edges, setEdges, setError]
  );

  // Handles dropping a new node onto the canvas
  // Event: Triggered when a node is dropped from a drag-and-drop action
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      // Prevent default browser behavior for drag-and-drop
      event.preventDefault();
      // Get the node type from the drag event's data transfer
      const type = event.dataTransfer.getData("application/reactflow");
      if (!type) return; // Exit if no valid type is provided

      // Calculate the drop position relative to the canvas
      const bounds = event.currentTarget.getBoundingClientRect();
      const position = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      };

      // Create a new node at the drop position
      const newNode: Node<TextNodeData> = {
        id: `${Date.now()}-${level}`,
        type,
        position,
        data: { label: "New Text Message", level },
      };
      // Append the new node to the existing nodes array
      setNodes((nds) => nds.concat(newNode));
      // Increment level for the next node
      setLevel((prevLevel) => prevLevel + 1);
    },
    [setNodes, level]
  );

  // Handles selecting a node by clicking
  // Event: Triggered when a node is clicked in the ReactFlow canvas
  const onNodeClick = useCallback((_: any, node: Node<TextNodeData>) => {
    // Set the clicked node's ID as the selected node
    setSelectedNodeId(node.id);
  }, []);

  // Updates the label of the selected node
  // Event: Triggered when the user edits the label in the settings panel
  const updateNodeLabel = useCallback(
    (label: string) => {
      // Update the label of the selected node while preserving other properties
      setNodes((nds) =>
        nds.map((node) =>
          node.id === selectedNodeId
            ? { ...node, data: { ...node.data, label } }
            : node
        )
      );
    },
    [selectedNodeId, setNodes]
  );

  // Handles resetting the flow by clearing all nodes and edges
  // Event: Triggered when the user clicks the "Reset" button
  const handleReset = useCallback(() => {
    // Clear all nodes and edges
    setNodes([]);
    setEdges([]);
    // Reset level to initial value
    setLevel(1);
    // Clear any selected node
    setSelectedNodeId(null);
    // Clear error and success messages
    setError(null);
    setSuccessMessage(null);
  }, [
    setNodes,
    setEdges,
    setLevel,
    setSelectedNodeId,
    setError,
    setSuccessMessage,
  ]);

  // Handles saving the flow and validating its structure
  // Event: Triggered when the user clicks the "Save Changes" button
  const handleSave = useCallback(() => {
    // Allow saving if there's one or no nodes (no validation needed)
    if (nodes.length <= 1) {
      setError(null);
      setSuccessMessage("Flow saved successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
      return;
    }

    // Build an adjacency list representation of the graph
    const graph = new Map<string, string[]>();
    edges.forEach((edge) => {
      if (!graph.has(edge.source)) graph.set(edge.source, []);
      graph.get(edge.source)?.push(edge.target);
    });

    // Identify the root node (node with no incoming edges)
    const allNodeIds = nodes.map((node) => node.id);
    const targetNodeIds = edges.map((edge) => edge.target);
    const rootNode = allNodeIds.find((id) => !targetNodeIds.includes(id));

    if (!rootNode) {
      // Set error if no root node is found
      setError("Cannot save Flow: No root node found.");
      return;
    }

    // Perform BFS to check for disconnected nodes
    const visited = new Set<string>();
    const queue = [rootNode];
    while (queue.length > 0) {
      const current = queue.shift()!;
      visited.add(current);
      const neighbors = graph.get(current) || [];
      neighbors.forEach((n) => {
        if (!visited.has(n)) queue.push(n);
      });
    }

    // Check for disconnected nodes
    const disconnectedNodes = allNodeIds.filter((id) => !visited.has(id));
    if (disconnectedNodes.length > 0) {
      // Set error if disconnected nodes are found
      setError(
        `Cannot save Flow: ${disconnectedNodes.length} node(s) are not connected to the main flow.`
      );
    } else {
      // Clear errors and show success message if validation passes
      setError(null);
      setSuccessMessage("Flow saved successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  }, [nodes, edges]);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div className="app">
      <div className="header">
        <h1 className="header-title">Chatbot Flow Builder</h1>
        <div className="header-buttons">
          <button
            className="save-button"
            onClick={handleSave}
            disabled={nodes.length === 0}
          >
            Save Changes
          </button>
          <button
            className="reset-button"
            onClick={handleReset}
            disabled={nodes.length === 0}
          >
            Reset
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      {error && <div className="error-message">{error}</div>}

      <div className="main-content">
        <div
          className="reactflow-wrapper"
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <MiniMap />
            <Controls />
            <Background gap={12} size={1} />
          </ReactFlow>
        </div>
        {!selectedNode ? (
          <Sidebar onAddTextNode={onAddTextNode} />
        ) : (
          <div className="settings-panel">
            <h4>Message (Level: {selectedNode?.data.level})</h4>
            <textarea
              value={selectedNode.data.label}
              onChange={(e) => updateNodeLabel(e.target.value)}
              rows={4}
              className="text-input"
            />
            <button
              className="back-button"
              onClick={() => setSelectedNodeId(null)}
            >
              ← Back to Nodes Panel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <FlowBuilder />
    </ReactFlowProvider>
  );
}
