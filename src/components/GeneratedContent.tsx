import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

interface GeneratedContentProps {
  content: string;
  onRegenerate: () => void;
}

const GeneratedContent = ({ content, onRegenerate }: GeneratedContentProps) => {
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const maxLineWidth = pageWidth - (margin * 2);
      
      // Split content into lines
      const lines = doc.splitTextToSize(content, maxLineWidth);
      
      let y = margin;
      const lineHeight = 7;
      
      lines.forEach((line: string, index: number) => {
        if (y + lineHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += lineHeight;
      });
      
      doc.save('educational-content.pdf');
      toast.success("PDF exported successfully!");
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error("Failed to export PDF");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast.success("Content copied to clipboard!");
  };

  return (
    <Card className="shadow-lg border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-2xl flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-success" />
          Generated Content
        </CardTitle>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCopy}
          >
            Copy Text
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExportPDF}
          >
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={onRegenerate}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Regenerate
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-slate max-w-none">
          <div className="whitespace-pre-wrap text-foreground leading-relaxed p-6 bg-secondary/30 rounded-lg">
            {content}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneratedContent;