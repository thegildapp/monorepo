export interface Photo {
  id: string;
  file: File | null;
  dataUrl: string;
  loading?: boolean;
}