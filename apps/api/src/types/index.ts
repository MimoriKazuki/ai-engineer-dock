import { z } from 'zod';

export const SeatStatus = z.enum(['idle', 'planning', 'building', 'error']);
export type SeatStatus = z.infer<typeof SeatStatus>;

export const TaskStatus = z.enum(['todo', 'in_progress', 'done']);
export type TaskStatus = z.infer<typeof TaskStatus>;

export const ProjectSpec = z.object({
  title: z.string().min(1),
  purpose: z.string().min(1), 
  details: z.string().min(1),
  requirements: z.string().optional(),
});
export type ProjectSpec = z.infer<typeof ProjectSpec>;

export const Task = z.object({
  id: z.string(),
  title: z.string(),
  spec_json: z.string(),
  seat_id: z.string().optional(),
  status: TaskStatus,
  priority: z.number().default(0),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Task = z.infer<typeof Task>;

export const Engineer = z.object({
  id: z.string(),
  status: SeatStatus,
  current_task_id: z.string().optional(),
  eta_minutes: z.number().optional(),
  last_message: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Engineer = z.infer<typeof Engineer>;

export const Project = z.object({
  id: z.string(),
  spec: ProjectSpec,
  github_pr_url: z.string().optional(),
  preview_url: z.string().optional(),
  status: z.enum(['created', 'building', 'ready', 'error']),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Project = z.infer<typeof Project>;

export const FileSystemEvent = z.object({
  type: z.enum(['add', 'change', 'unlink']),
  path: z.string(),
  timestamp: z.string(),
});
export type FileSystemEvent = z.infer<typeof FileSystemEvent>;

export const ActivityFeedItem = z.object({
  id: z.string(),
  type: z.enum(['fs_event', 'build_status', 'message', 'error']),
  content: z.string(),
  metadata: z.record(z.any()).optional(),
  timestamp: z.string(),
});
export type ActivityFeedItem = z.infer<typeof ActivityFeedItem>;