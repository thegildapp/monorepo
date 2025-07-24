export interface Photo {
  id: string;
  file: File;
  dataUrl: string;
  loading?: boolean;
}