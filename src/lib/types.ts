export type AnaRef = "NORMAL" | "LOW" | "HIGH" | "UNKNOWN";

export type Marker = {
  marker_name: string;
  value: number | null;
  unit: string;
  reference_range: string;
  ana_ref: AnaRef;
};

export type ExamAnalysisResponse = {
  exam_date: string;
  markers: Marker[];
};
