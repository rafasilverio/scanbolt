export type PreviewStats = {
    critical: {
      count: number;
      message: string;
    };
    warning: {
      count: number;
      message: string;
    };
    improvement: {
      count: number;
      message: string;
    };
  };
  
  export const DEFAULT_PREVIEW_STATS: PreviewStats = {
    critical: {
      count: 3,
      message: "Critical legal issues found that need immediate attention"
    },
    warning: {
      count: 5,
      message: "Potential risks identified in your contract"
    },
    improvement: {
      count: 4,
      message: "Opportunities to strengthen your agreement"
    }
  };