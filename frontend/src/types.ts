export interface TableData {
  table_id: string;
  page: number;
  headers: string[];
  rows: string[][];
  row_count: number;
  col_count: number;
  markdown: string;
}

export interface DocumentPage {
  page_number: number;
  text: string;
  page_type: 'text' | 'table' | 'chart' | 'scanned' | 'diagram';
  text_blocks: any[];
  tables: TableData[];
  image_preview: string;
}

export interface DocumentItem {
  id: string;
  filename: string;
  total_pages: number;
  file_type: string;
  pages: DocumentPage[];
  full_text: string;
  tables: TableData[];
  charts: any[];
  page_breakdown: Record<string, number>;
}

export interface Citation {
  doc_id: string;
  filename: string;
  page_number: number;
  section: string;
  content_type: string;
  snippet: string;
}

export interface SourceHighlight {
  page_number: number;
  snippet: string;
  bbox: [number, number, number, number];
}

export interface AnalyticsData {
  title?: string;
  headers: string[];
  rows: string[][];
  chart_series?: { label: string; value: number; raw_value: string }[];
}

export interface ComparisonMatrix {
  headers: string[];
  rows: string[][];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  citations?: Citation[];
  highlights?: SourceHighlight[];
  analytics_data?: AnalyticsData | null;
  comparison_matrix?: ComparisonMatrix | null;
  timestamp: string;
}
