
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { importSchoolsFromExcel, importAdminsFromExcel, downloadExcelTemplate, ImportedSchool, ImportedAdmin } from "@/utils/excelImport";
import { toast } from "sonner";
import { DownloadCloud, UploadCloud } from "lucide-react";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'schools' | 'admins';
  onImport: (data: ImportedSchool[] | ImportedAdmin[]) => void;
}

export const ImportDialog = ({ open, onOpenChange, type, onImport }: ImportDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      let data;
      if (type === 'schools') {
        data = await importSchoolsFromExcel(file);
      } else {
        data = await importAdminsFromExcel(file);
      }
      
      onImport(data);
      toast.success(`${data.length} məlumat uğurla import edildi`);
      onOpenChange(false);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Fayl import edilərkən xəta baş verdi. Zəhmət olmasa faylın formatını yoxlayın.');
    } finally {
      setIsUploading(false);
      setFile(null);
    }
  };

  const handleDownloadTemplate = () => {
    downloadExcelTemplate(type);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === 'schools' ? 'Məktəbləri' : 'Administratorları'} import edin
          </DialogTitle>
          <DialogDescription>
            Excel faylından {type === 'schools' ? 'məktəbləri' : 'administratorları'} import edin
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleDownloadTemplate}>
              <DownloadCloud className="w-4 h-4 mr-2" />
              Nümunə faylı yüklə
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="file">Excel faylı</Label>
            <Input 
              id="file" 
              type="file" 
              accept=".xlsx,.xls" 
              onChange={handleFileChange}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Ləğv et
          </Button>
          <Button 
            disabled={!file || isUploading} 
            onClick={handleImport}
          >
            {isUploading ? 'Import edilir...' : 'Import et'}
            {!isUploading && <UploadCloud className="w-4 h-4 ml-2" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
