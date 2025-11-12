import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import ContentMarkdown from "./ContentMarkdown";

interface GeneratedContentProps {
  content: string;
  onRegenerate: () => void;
}

const GeneratedContent = ({ content, onRegenerate }: GeneratedContentProps) => {
  const handleDownloadPDF = () => {
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
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error("Failed to download PDF");
    }
  };

  return (
    <Card className="content-card animate-fade-in">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="text-2xl sm:text-3xl flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-bold">
              Generated Content
            </span>
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="default" 
              size="sm"
              onClick={handleDownloadPDF}
              className="bg-gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onRegenerate}
              className="hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-colors"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 sm:p-8">
        <div className="bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-xl p-6 sm:p-8 border border-border/50">
          <ContentMarkdown content={content} />
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneratedContent;