export type OptionKey = 'A' | 'B' | 'C';

export interface EvaluationItem {
  id: number;
  description: string;
  block: string;
  options: {
    A: { label: string; score: number };
    B: { label: string; score: number };
    C: { label: string; score: number };
  };
}

export interface BaremaData {
  programa: string;
  parecerista: string;
  academico: string;
  data: string;
  selections: Record<number, OptionKey>;
  observacoes?: string;
  customLogoUrl?: string;
  customSignatureUrl?: string;
}

export interface SendResult {
  pdfGenerated: boolean;
  emailSent: boolean;
  driveSaved: boolean;
  driveFileId?: string;
  error?: string;
}
