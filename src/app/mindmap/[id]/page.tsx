"use client"
import ReactFlow, { Background, Controls, useNodesState, useEdgesState } from 'reactflow'
import 'reactflow/dist/style.css'

const initialNodes = [{ id: '1', position: { x: 0, y: 0 }, data: { label: 'Idea Principal' }, type: 'input' }]

export default function MindmapPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes as any)
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const addNode = () => {
    const newNode = {
      id: (nodes.length + 1).toString(),
      data: { label: `Nueva Idea ${nodes.length + 1}` },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
    }
    setNodes((nds) => nds.concat(newNode))
  }

  return (
    <div className="h-[70vh] w-full border dark:border-zinc-800 rounded-2xl overflow-hidden relative">
      <button onClick={addNode} className="absolute top-4 left-4 z-10 bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg">
        + Añadir Nodo
      </button>
      <ReactFlow 
        nodes={nodes} edges={edges} 
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}
