import { useState } from "react";
import { Search, FileText, Download, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FeatureGuard } from "@/components/subscription/FeatureGuard";

export default function Arquivos() {
  const [templateSearchTerm, setTemplateSearchTerm] = useState("");
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState("");
  const { toast } = useToast();
  
  // Carregar todos os arquivos da pasta de modelos (@docs)
  const docsModules = import.meta.glob("@/assets/uploads/docs/*", { eager: true, as: "url" }) as Record<string, string>;
  const docsSizeMap: Record<string, string> = {
    "DECLARAÇÃO PSICOLÓGICA.docx": "6.8 KB",
    "ATESTADO PSICOLÓGICO.docx": "7.0 KB",
    "RELATÓRIO PSICOLÓGICO.docx": "7.7 KB",
    "LAUDO PSICOLÓGICO.docx": "8.1 KB",
    "PARECER PSICOLÓGICO.docx": "7.1 KB",
  };
  const docsTemplates = Object.entries(docsModules).map(([path, url], idx) => {
    const filename = path.split("/").pop() || `Documento_${idx + 1}`;
    return {
      id: `doc-${idx + 1}`,
      name: filename.replace(".docx", ""),
      category: "Modelos Oficiais",
      description: filename,
      type: "docx",
      size: docsSizeMap[filename] || "-",
      downloadUrl: url,
    };
  });
  
  // Listar somente os arquivos reais da pasta @docs
  const documentTemplates = [...docsTemplates];

  const filteredTemplates = documentTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(templateSearchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(templateSearchTerm.toLowerCase());
    const matchesCategory = selectedTemplateCategory === "" || selectedTemplateCategory === "todas" || template.category === selectedTemplateCategory;
    return matchesSearch && matchesCategory;
  });

  const templateCategories = Array.from(new Set(documentTemplates.map(t => t.category)));

  const handleTemplateDownload = (template: any) => {
    if (template.downloadUrl && template.downloadUrl !== "#") {
      const link = document.createElement("a");
      link.href = template.downloadUrl as string;
      link.download = template.description || template.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast({
        title: "Modelo baixado",
        description: `Download do modelo "${template.name}" iniciado.`
      });
    }
  };

  return (
    <FeatureGuard 
      feature="files" 
      featureName="Modelos de Documentos"
    >
      <div className="space-y-6 p-4 md:p-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">Modelos de Documentos</h1>
          <p className="text-muted-foreground">
            Documentos profissionais prontos para download e edição
          </p>
        </div>
      </div>

      {/* Filtros dos Modelos */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar modelos de documentos..."
                value={templateSearchTerm}
                onChange={(e) => setTemplateSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedTemplateCategory} onValueChange={setSelectedTemplateCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as categorias</SelectItem>
                {templateCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Modelos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg flex-shrink-0">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm line-clamp-2 mb-1">
                    {template.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {template.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {template.size}
                      </span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 w-8 p-0 hover:bg-primary/10"
                      onClick={() => handleTemplateDownload(template)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Nenhum modelo encontrado com os filtros aplicados
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">
              {documentTemplates.length}
            </div>
            <p className="text-sm text-muted-foreground">Modelos disponíveis</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-accent">{templateCategories.length}</div>
            <p className="text-sm text-muted-foreground">Categorias</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">Gratuito</div>
            <p className="text-sm text-muted-foreground">Download ilimitado</p>
          </CardContent>
        </Card>
      </div>
    </div>
    </FeatureGuard>
  );
}