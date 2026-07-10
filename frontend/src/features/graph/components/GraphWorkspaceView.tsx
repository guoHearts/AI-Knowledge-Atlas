'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { NodeDetailPanel } from './NodeDetail';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useGraphWorkspace } from '../hooks/useGraphWorkspace';
import { GraphLegend } from './GraphLegend';
import { GraphRelationsBadgeList } from './GraphRelationsBadgeList';
import { GraphToolbar } from './GraphToolbar';

const GraphCanvas = dynamic(() => import('./GraphCanvas').then((module) => ({ default: module.GraphCanvas })), {
  ssr: false,
});

interface GraphWorkspaceViewProps {
  focusId: string | null;
}

export function GraphWorkspaceView({ focusId }: GraphWorkspaceViewProps) {
  const workspace = useGraphWorkspace(focusId);
  const t = useTranslations('graph');

  if (workspace.loading) return <LoadingSpinner text={t('loadingGraph')} />;

  return (
    <div className="flex h-[calc(100vh-65px)] flex-col overflow-hidden">
      <GraphToolbar
        filterTypes={workspace.filterTypes}
        onToggleFilter={workspace.toggleFilter}
        onClearFilter={workspace.clearFilter}
        onSelectAllFilters={workspace.selectAllFilters}
        onSearch={workspace.handleSearch}
        onSearchSelect={workspace.handleSearchSelect}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="relative flex-1">
          <GraphCanvas
            nodes={workspace.nodes}
            edges={workspace.edges}
            filterTypes={workspace.filterTypes}
            highlightNodeId={workspace.highlightNodeId}
            focusNodeId={workspace.focusNodeId}
            onFocusDone={workspace.handleFocusDone}
            onNodeClick={workspace.handleCanvasNodeClick}
            onNodeDblClick={workspace.handleCanvasNodeDblClick}
          />
          {workspace.loading && <LoadingSpinner text={t('loadingCanvas')} />}

          <GraphLegend nodes={workspace.nodes} edges={workspace.edges} />
          <GraphRelationsBadgeList />

          {!workspace.panelOpen && workspace.selectedNode?.node && (
            <button
              onClick={workspace.reopenPanel}
              className="absolute bottom-4 right-4 border border-cosmos-text bg-cosmos-text px-4 py-2.5 text-xs font-bold text-cosmos-surface shadow-[5px_5px_0_rgba(35,88,216,0.18)] transition-transform hover:-translate-y-0.5"
            >
              {t('viewNodeDetail')}
            </button>
          )}
        </div>

        {workspace.panelOpen && (
          <aside className="w-96 shrink-0 overflow-hidden border-l border-cosmos-border bg-cosmos-surface/96 shadow-2xl">
            <NodeDetailPanel
              detail={workspace.selectedNode}
              onClose={workspace.closePanel}
              onFocusNode={(nodeType: string, nodeId: string) => {
                void workspace.handleNodeClick(nodeType, nodeId);
              }}
            />
          </aside>
        )}
      </div>
    </div>
  );
}
