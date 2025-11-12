import React, { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeTypes,
  NodeProps,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Skill, SkillGraph, SkillNode, SkillEdge } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Brain, Star, Lock, CheckCircle, Clock, TrendingUp } from 'lucide-react';

// 自定义节点类型
interface SkillNodeData {
  skill: Skill;
  level: number;
  score: number;
  status: 'unlocked' | 'locked' | 'in_progress' | 'completed' | 'expert';
  onNodeClick?: (skill: Skill) => void;
}

const SkillNodeComponent: React.FC<NodeProps<SkillNodeData>> = ({ data, selected }) => {
  const { skill, level, score, status, onNodeClick } = data;

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 border-green-600';
      case 'expert':
        return 'bg-yellow-500 border-yellow-600';
      case 'in_progress':
        return 'bg-blue-500 border-blue-600';
      case 'unlocked':
        return 'bg-gray-300 border-gray-400';
      case 'locked':
        return 'bg-gray-200 border-gray-300';
      default:
        return 'bg-gray-300 border-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-white" />;
      case 'expert':
        return <Star className="w-4 h-4 text-white" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-white" />;
      case 'unlocked':
        return <Brain className="w-4 h-4 text-gray-700" />;
      case 'locked':
        return <Lock className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 shadow-lg cursor-pointer transition-all hover:shadow-xl min-w-[160px] ${getStatusColor()}`}
      onClick={() => onNodeClick?.(skill)}
    >
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      
      <div className="flex items-center gap-2 mb-2">
        {getStatusIcon()}
        <div className="flex-1">
          <h3 className="font-semibold text-sm text-white truncate">{skill.name}</h3>
          <p className="text-xs text-white/80 truncate">{skill.category}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs text-white/90">
        <span>等级: {level}</span>
        <span>分数: {score}</span>
      </div>
      
      {score > 0 && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-white/80 mb-1">
            <span>掌握度</span>
            <span>{Math.round((score / 100) * 100)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-1.5">
            <div
              className="bg-white h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min(score, 100)}%` }}
            />
          </div>
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </div>
  );
};

interface SkillGraphComponentProps {
  skillGraph?: SkillGraph;
  skills: Skill[];
  userSkills?: Array<{
    skill_id: string;
    level: number;
    score: number;
    verified: boolean;
  }>;
  onNodeClick?: (skill: Skill) => void;
  className?: string;
}

const nodeTypes: NodeTypes = {
  skillNode: SkillNodeComponent,
};

const SkillGraphComponent: React.FC<SkillGraphComponentProps> = ({
  skillGraph,
  skills,
  userSkills = [],
  onNodeClick,
  className = '',
}) => {
  const { profile } = useAuth();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // 根据技能数据和用户技能状态生成节点和边
  useEffect(() => {
    if (!skills.length) return;

    const skillMap = new Map(skills.map(skill => [skill.id, skill]));
    const userSkillMap = new Map(
      userSkills.map(userSkill => [userSkill.skill_id, userSkill])
    );

    // 生成节点
    const graphNodes: Node[] = skills.map((skill, index) => {
      const userSkill = userSkillMap.get(skill.id);
      const userLevel = userSkill?.level || 0;
      const userScore = userSkill?.score || 0;
      
      // 根据用户的技能状态确定节点状态
      let status: 'unlocked' | 'locked' | 'in_progress' | 'completed' | 'expert' = 'locked';
      if (userLevel === 0) {
        // 如果是第一个技能或者有前置技能但都完成了，则解锁
        const hasPrerequisites = skill.prerequisites && skill.prerequisites.length > 0;
        if (!hasPrerequisites || skill.prerequisites?.every(prereqId => {
          const prereqSkill = userSkillMap.get(prereqId);
          return prereqSkill && prereqSkill.level >= 3;
        })) {
          status = 'unlocked';
        }
      } else if (userLevel >= 4 && userScore >= 90) {
        status = 'expert';
      } else if (userLevel >= 3 && userScore >= 70) {
        status = 'completed';
      } else if (userLevel >= 1) {
        status = 'in_progress';
      }

      // 使用网格布局计算位置
      const cols = Math.ceil(Math.sqrt(skills.length));
      const row = Math.floor(index / cols);
      const col = index % cols;
      const x = col * 250 + 100;
      const y = row * 200 + 100;

      return {
        id: skill.id,
        type: 'skillNode',
        position: { x, y },
        data: {
          skill,
          level: userLevel,
          score: userScore,
          status,
          onNodeClick,
        },
      };
    });

    // 生成边（基于技能前置关系）
    const graphEdges: Edge[] = [];
    skills.forEach(skill => {
      if (skill.prerequisites) {
        skill.prerequisites.forEach(prereqId => {
          if (skillMap.has(prereqId)) {
            graphEdges.push({
              id: `${prereqId}-${skill.id}`,
              source: prereqId,
              target: skill.id,
              type: 'smoothstep',
              style: { stroke: '#3B82F6', strokeWidth: 2 },
              animated: true,
            });
          }
        });
      }
    });

    setNodes(graphNodes);
    setEdges(graphEdges);
  }, [skills, userSkills, onNodeClick]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (onNodeClick && node.data?.skill) {
        onNodeClick(node.data.skill);
      }
    },
    [onNodeClick]
  );

  if (!skills.length) {
    return (
      <div className={`flex items-center justify-center h-96 bg-gray-50 rounded-lg ${className}`}>
        <div className="text-center">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">暂无技能数据</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border ${className}`} style={{ height: '600px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background color="#f1f5f9" gap={20} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const status = node.data?.status;
            switch (status) {
              case 'completed':
                return '#10B981';
              case 'expert':
                return '#F59E0B';
              case 'in_progress':
                return '#3B82F6';
              case 'unlocked':
                return '#6B7280';
              case 'locked':
                return '#D1D5DB';
              default:
                return '#D1D5DB';
            }
          }}
          maskColor="rgb(240, 242, 246, 0.7)"
        />
      </ReactFlow>
    </div>
  );
};

export default SkillGraphComponent;