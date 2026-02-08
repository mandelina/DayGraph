export type Activity = {
  timestamp: string;
  app_name: string;
  app_path: string | null;
  bundle_id: string | null;
  window_title: string;
  display_id: number | null;
  is_active: boolean;
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
  appPath: string | null;
  bundleId: string | null;
  windowTitle: string;
  isActive: boolean;
  clicks: number;
  keypress: number;
};

export type TimelineBucketApp = {
  appName: string;
  appPath: string | null;
  bundleId: string | null;
  duration: number;
  clicks: number;
  keypress: number;
  isActive: boolean;
};

export type TimelineBucket = {
  bucketStart: string;
  bucketLabel: string;
  totalDuration: number;
  representative: TimelineBucketApp | null;
  share: number;
  isMixed: boolean;
  others: TimelineBucketApp[];
};
