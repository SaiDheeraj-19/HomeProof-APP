/**
 * Offline Queue Service
 * 
 * Manages an offline queue of user reports. Ensures we "never lose user-generated reports"
 * by storing them in MMKV/AsyncStorage via our platform `appStorage` abstraction.
 * Automatically synchronizes with Supabase when the network connection is restored.
 */
import NetInfo from '@react-native-community/netinfo';
import { appStorage } from '../platform/storage';
import { supabase } from './supabase';
import { logger } from '../logger';

const QUEUE_KEY = 'offline_reports_queue';

export interface QueuedReport {
  id: string; // temporary UUID
  property_id: string;
  reporter_id: string | undefined;
  description: string;
  media_urls: string[]; // typically empty if offline, unless pre-uploaded
  queued_at: number;
}

class OfflineQueueManager {
  private isSyncing = false;
  private unsubscribe: (() => void) | null = null;

  init() {
    if (this.unsubscribe) return;
    
    // Listen for network changes
    this.unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable !== false) {
        this.sync();
      }
    });
  }

  getQueue(): QueuedReport[] {
    const raw = appStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as QueuedReport[];
    } catch {
      return [];
    }
  }

  private setQueue(queue: QueuedReport[]) {
    appStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  }

  addReport(report: Omit<QueuedReport, 'id' | 'queued_at'>) {
    const queue = this.getQueue();
    const newReport: QueuedReport = {
      ...report,
      id: Math.random().toString(36).substring(7),
      queued_at: Date.now(),
    };
    queue.push(newReport);
    this.setQueue(queue);
    logger.info('OfflineQueue', 'Report added to offline queue', { queueSize: queue.length });
  }

  async sync() {
    if (this.isSyncing) return;
    const queue = this.getQueue();
    if (queue.length === 0) return;

    this.isSyncing = true;
    logger.info('OfflineQueue', 'Starting sync of offline reports', { count: queue.length });

    const failedQueue: QueuedReport[] = [];

    for (const item of queue) {
      try {
        const { error } = await supabase.from('reports').insert({
          property_id: item.property_id,
          reporter_id: item.reporter_id,
          description: item.description,
          media_urls: item.media_urls,
          report_type: 'other',
          ai_analysis_status: 'pending',
        });
        
        if (error) throw error;
        logger.info('OfflineQueue', `Successfully synced offline report ${item.id}`);
      } catch (err) {
        logger.error('OfflineQueue', `Failed to sync offline report ${item.id}`, err);
        failedQueue.push(item);
      }
    }

    this.setQueue(failedQueue);
    this.isSyncing = false;
  }
}

export const offlineQueue = new OfflineQueueManager();
