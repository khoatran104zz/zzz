'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, FileText, Plus, BookOpen, Search } from 'lucide-react';
import type { WikiPageTreeNodeDto } from '../types';

interface WikiTreeNavigationProps {
  tree: WikiPageTreeNodeDto[];
  selectedPageId?: string;
  onSelectPage: (pageId: string) => void;
  onCreatePage: (parentPageId?: string) => void;
}

export function WikiTreeNavigation({
  tree,
  selectedPageId,
  onSelectPage,
  onCreatePage,
}: WikiTreeNavigationProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filterTree = (nodes: WikiPageTreeNodeDto[]): WikiPageTreeNodeDto[] => {
    if (!searchTerm.trim()) return nodes;
    return nodes
      .map((node) => {
        const matchesSelf = node.title.toLowerCase().includes(searchTerm.toLowerCase());
        const filteredChildren = node.children ? filterTree(node.children) : [];
        if (matchesSelf || filteredChildren.length > 0) {
          return { ...node, children: filteredChildren };
        }
        return null;
      })
      .filter(Boolean) as WikiPageTreeNodeDto[];
  };

  const filteredTree = filterTree(tree);

  return (
    <div className="w-full md:w-64 shrink-0 rounded-2xl border border-surface-border bg-surface p-4 shadow-xs space-y-3">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-surface-border pb-3">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-heading">
            Trang Wiki
          </h3>
        </div>
        <button
          onClick={() => onCreatePage()}
          className="rounded-xl p-1.5 text-text-muted hover:bg-surface-alt hover:text-text-primary transition"
          title="Tạo trang gốc mới"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Live Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-text-muted" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm trang tài liệu..."
          className="w-full rounded-xl border border-surface-border bg-surface-alt pl-8 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none transition"
        />
      </div>

      {/* Tree Content */}
      <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-320px)] scrollbar-none pt-1">
        {filteredTree.length === 0 ? (
          <p className="py-4 text-center text-xs text-text-muted italic">
            {searchTerm ? 'Không tìm thấy trang nào' : 'Chưa có trang tài liệu nào'}
          </p>
        ) : (
          filteredTree.map((node) => (
            <TreeNodeItem
              key={node.id}
              node={node}
              selectedPageId={selectedPageId}
              onSelectPage={onSelectPage}
              onCreatePage={onCreatePage}
            />
          ))
        )}
      </div>
    </div>
  );
}

function TreeNodeItem({
  node,
  selectedPageId,
  onSelectPage,
  onCreatePage,
}: {
  node: WikiPageTreeNodeDto;
  selectedPageId?: string;
  onSelectPage: (pageId: string) => void;
  onCreatePage: (parentPageId?: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const isSelected = selectedPageId === node.id;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div
        className={`group flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs transition cursor-pointer ${
          isSelected
            ? 'bg-primary/10 text-primary font-bold shadow-xs border border-primary/20'
            : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
        }`}
        onClick={() => onSelectPage(node.id)}
      >
        <div className="flex items-center space-x-2 truncate min-w-0">
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              className="p-0.5 text-text-muted hover:text-text-primary shrink-0"
            >
              {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </button>
          ) : (
            <FileText className="h-3.5 w-3.5 shrink-0 text-text-muted" />
          )}
          <span className="truncate">{node.title}</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onCreatePage(node.id);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-primary transition shrink-0"
          title="Tạo trang con"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      {hasChildren && isOpen && (
        <div className="ml-3 space-y-0.5 border-l border-surface-border pl-2 mt-0.5">
          {node.children.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              selectedPageId={selectedPageId}
              onSelectPage={onSelectPage}
              onCreatePage={onCreatePage}
            />
          ))}
        </div>
      )}
    </div>
  );
}
