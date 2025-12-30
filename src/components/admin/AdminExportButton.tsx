import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { exportToCSV } from "@/lib/adminUtils";
import { toast } from "sonner";

interface AdminExportButtonProps<T extends Record<string, unknown>> {
  data: T[];
  filename: string;
  headers?: string[];
  label?: string;
}

const AdminExportButton = <T extends Record<string, unknown>>({
  data,
  filename,
  headers,
  label = "Export CSV"
}: AdminExportButtonProps<T>) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    if (data.length === 0) {
      toast.error("No data to export");
      return;
    }

    setIsExporting(true);
    try {
      exportToCSV(data, filename, headers);
      toast.success(`Exported ${data.length} records`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isExporting || data.length === 0}
      className="h-8"
    >
      {isExporting ? (
        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
      ) : (
        <Download className="w-3.5 h-3.5 mr-1.5" />
      )}
      {label}
    </Button>
  );
};

export default AdminExportButton;
