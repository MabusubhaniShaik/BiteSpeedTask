// src/utils/validators.ts
export const validateFlow = (nodes: any[], edges: any[]) => {
  const targetNodeIds = new Set(edges.map((e) => e.target));
  const isolatedNodes = nodes.filter((n) => !targetNodeIds.has(n.id));
  return isolatedNodes.length <= 1;
};
