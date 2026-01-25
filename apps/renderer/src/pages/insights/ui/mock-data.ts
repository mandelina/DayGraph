type InsightSummaryData = {
  highlight: string;
  context: string;
};

type FocusPattern = {
  type: string;
  description: string;
};

type AppInsight = {
  title: string;
  detail: string;
};

export function useInsightsMock() {
  const summary: InsightSummaryData = {
    highlight: "오전 9~11시 집중력이 가장 높았고, 오후 3시 이후 급격히 하락했습니다.",
    context:
      "Chrome/Docs 비중이 늘어나며 입력 비율이 낮아졌어요. React refactor task가 마무리되면서 개발 집중도가 낮아졌습니다.",
  };

  const patterns: FocusPattern[] = [
    {
      type: "오전 집중형",
      description: "연속 40분 이상 VSCode 세션 3회. 클릭/키 입력 비율이 85% 이상 유지.",
    },
    {
      type: "짧은 스프린트 반복형",
      description: "Notion ↔ Terminal 전환이 15분 간격으로 반복되며 빠른 컨텍스트 스위칭.",
    },
    {
      type: "오후 저효율 패턴",
      description: "3PM 이후 Chrome/Docs 체류가 길지만 입력 비율은 30% 이하.",
    },
  ];

  const appInsights: AppInsight[] = [
    {
      title: "VSCode",
      detail: "집중 세션의 60%를 차지, 입력량 대비 활동 점수 가장 높음.",
    },
    {
      title: "Chrome",
      detail: "열려 있는 시간은 길지만 클릭/키 입력 비율이 25%에 불과.",
    },
    {
      title: "Notion",
      detail: "짧은 메모 세션으로 자주 등장, 클릭 대비 키 입력 비율이 2배.",
    },
  ];

  return { summary, patterns, appInsights };
}
