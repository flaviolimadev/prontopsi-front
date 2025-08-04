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
  
  // Modelos de documentos pré-definidos
  const documentTemplates = [
    {
      id: 1,
      name: "Modelo de Avaliação Psicológica",
      category: "Avaliações",
      description: "Modelo padrão para avaliação psicológica inicial",
      type: "pdf",
      size: "256 KB",
      downloadUrl: "#"
    },
    {
      id: 2,
      name: "Relatório de Acompanhamento",
      category: "Relatórios",
      description: "Template para relatórios de acompanhamento psicológico",
      type: "pdf",
      size: "189 KB",
      downloadUrl: "#"
    },
    {
      id: 3,
      name: "Termo de Consentimento Livre e Esclarecido",
      category: "Documentos Legais",
      description: "TCLE para atendimento psicológico",
      type: "pdf",
      size: "98 KB",
      downloadUrl: "#"
    },
    {
      id: 4,
      name: "Ficha de Anamnese",
      category: "Formulários",
      description: "Formulário para coleta de dados do paciente",
      type: "pdf",
      size: "145 KB",
      downloadUrl: "#"
    },
    {
      id: 5,
      name: "Plano Terapêutico Individual",
      category: "Planejamento",
      description: "Modelo para elaboração de PTI",
      type: "pdf",
      size: "203 KB",
      downloadUrl: "#"
    },
    {
      id: 6,
      name: "Declaração de Comparecimento",
      category: "Declarações",
      description: "Modelo para declaração de comparecimento",
      type: "pdf",
      size: "87 KB",
      downloadUrl: "#"
    },
    {
      id: 7,
      name: "Relatório Psicológico",
      category: "Relatórios",
      description: "Template completo para relatório psicológico",
      type: "pdf",
      size: "312 KB",
      downloadUrl: "#"
    },
    {
      id: 8,
      name: "Contrato Terapêutico",
      category: "Documentos Legais",
      description: "Modelo de contrato para início do atendimento",
      type: "pdf",
      size: "156 KB",
      downloadUrl: "#"
    }
  ];

  const filteredTemplates = documentTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(templateSearchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(templateSearchTerm.toLowerCase());
    const matchesCategory = selectedTemplateCategory === "" || selectedTemplateCategory === "todas" || template.category === selectedTemplateCategory;
    return matchesSearch && matchesCategory;
  });

  const templateCategories = Array.from(new Set(documentTemplates.map(t => t.category)));

  const handleTemplateDownload = (template: any) => {
    toast({
      title: "Modelo baixado",
      description: `Download do modelo "${template.name}" iniciado.`
    });
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