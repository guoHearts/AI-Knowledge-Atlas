export interface RadarSource {
  type: string;
  url: string;
  title: string;
}

export interface RadarItem {
  id: string;
  title: string;
  category: string;
  maturity: string;
  summary: string;
  why_it_matters: string;
  recommended_for: string;
  not_recommended_for: string;
  has_lab: boolean;
  lab_id: string | null;
  sources: RadarSource[];
  created_at: string;
  updated_at: string;
  last_verified_at: string;
}

export interface RadarCategory {
  id: string;
  name: string;
  description: string;
}

export interface RadarItemsData {
  items: RadarItem[];
}

export interface RadarCategoriesData {
  items: RadarCategory[];
}

export interface WeeklyRadar {
  week: string;
  period: {
    start: string;
    end: string;
  };
  items: RadarItem[];
  summary: string;
}
