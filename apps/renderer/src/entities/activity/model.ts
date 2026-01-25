export type Activity = {
  timestamp: string;
  app_name: string;
  window_title: string;
  display_id: number | null;
  clicks: number;
  keypress: number;
};

export type AppActivity = {
  appName: string;
  activeSeconds: number;
  clickCount: number;
  keypressCount: number;
  score: number;
};

export type TimelineSlice = {
  start: string;
  end: string;
  appName: string;
  windowTitle: string;
  isActive: boolean;
  clicks: number;
  keypress: number;
};
