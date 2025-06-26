export interface ActivityFeedItem {
  id: string;
  type: 'fs_event' | 'build_status' | 'message' | 'error';
  content: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface FileSystemEvent {
  type: 'add' | 'change' | 'unlink';
  path: string;
  timestamp: string;
}

export interface Engineer {
  id: string;
  status: 'idle' | 'planning' | 'building' | 'error';
  current_task_id?: string;
  eta_minutes?: number;
  last_message?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  spec: ProjectSpec;
  github_pr_url?: string;
  preview_url?: string;
  status: 'created' | 'building' | 'ready' | 'error';
  created_at: string;
  updated_at: string;
}

export interface ProjectSpec {
  title: string;
  purpose: string;
  details: string;
  requirements?: string;
}

export interface Task {
  id: string;
  title: string;
  spec_json: string;
  seat_id?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: number;
  created_at: string;
  updated_at: string;
}