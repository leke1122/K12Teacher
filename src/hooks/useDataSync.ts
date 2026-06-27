'use client';

import { useState, useEffect, useCallback } from 'react';
import { syncState, SyncLog, getStatusMessage, SyncResult } from '@/lib/dataSync';

export interface UseDataSyncReturn {
  isOnline: boolean;
  isSyncing: boolean;
  lastSource: 'cloud' | 'local';
  logs: SyncLog[];
  isCloudConfigured: boolean;

  clearLogs: () => void;
  manualSync: () => Promise<SyncResult>;
}

export function useDataSync(): UseDataSyncReturn {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [isCloudConfigured, setIsCloudConfigured] = useState(false);

  useEffect(() => {
    setIsOnline(syncState.isOnline());
    setIsSyncing(syncState.isSyncing());
    setLogs(syncState.getLogs());

    const unsubscribeLogs = syncState.subscribe((newLogs) => {
      setLogs(newLogs);
    });

    const unsubscribeStatus = syncState.subscribeStatus((status) => {
      setIsOnline(status.online);
      setIsSyncing(status.syncing);
    });

    return () => {
      unsubscribeLogs();
      unsubscribeStatus();
    };
  }, []);

  const clearLogs = useCallback(() => {
    syncState.clearLogs();
  }, []);

  const manualSync = useCallback(async (): Promise<SyncResult> => {
    const { syncAllToCloud } = await import('@/lib/dataSync');
    return await syncAllToCloud();
  }, []);

  return {
    isOnline,
    isSyncing,
    lastSource: syncState.getLastSource(),
    logs,
    isCloudConfigured,
    clearLogs,
    manualSync,
  };
}

export function formatSyncStatus(result: SyncResult): {
  icon: 'success' | 'local' | 'error';
  text: string;
  detail?: string;
} {
  if (result.cloudSynced) {
    return {
      icon: 'success',
      text: '已保存（云端已备份）',
      detail: result.message,
    };
  } else if (result.success) {
    return {
      icon: 'local',
      text: '已保存到本地',
      detail: result.source === 'local' ? '云端同步中...' : '云端不可用',
    };
  } else {
    return {
      icon: 'error',
      text: '操作失败',
      detail: result.error,
    };
  }
}

export interface SyncStatusBadgeProps {
  source: 'cloud' | 'local';
  syncing?: boolean;
}

export function getSyncStatusLabel(props: SyncStatusBadgeProps): {
  label: string;
  icon: string;
  color: string;
} {
  if (props.syncing) {
    return {
      label: '同步中...',
      icon: '🔄',
      color: 'text-blue-600',
    };
  }

  if (props.source === 'cloud') {
    return {
      label: '云端数据',
      icon: '☁️',
      color: 'text-green-600',
    };
  }

  return {
    label: '本地数据',
    icon: '💾',
    color: 'text-amber-600',
  };
}
