export function useSettingsMock() {
  return {
    scoreWeights: {
      active: 1.0,
      clicks: 2.0,
      keys: 0.5,
    },
    privacy: {
      dataDir: "./data/dev-activity.sqlite",
      collector: true,
      iohook: true,
    },
    uiOptions: {
      theme: "Dark",
      density: "Detailed",
    },
    systemStatus: {
      collector: "running",
      lastSync: "5분 전",
      autoUpdate: true,
    },
  };
}
