import { Calendar, Users, DollarSign, Clock, Phone, FileText, BarChart3, Settings, FolderOpen, Brain, User, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const DashboardMockup = () => {
  return (
    <div className="bg-card rounded-lg border shadow-lg overflow-hidden max-w-5xl mx-auto">
      {/* Mockup header */}
      <div className="bg-primary/5 p-2 border-b">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="ml-2 text-xs text-muted-foreground">ProntuPsi Dashboard</span>
        </div>
      </div>
      
      <div className="flex">
        {/* Compact Sidebar */}
        <div className="w-48 bg-background border-r p-3 space-y-1">
          <div className="mb-4">
            <img 
              src="/lovable-uploads/22f02146-b67a-40cb-be21-3a583e79a68e.png" 
              alt="ProntuPsi Logo" 
              className="h-7 object-contain"
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-primary text-primary-foreground rounded text-xs">
              <BarChart3 className="h-3 w-3" />
              <span>Dashboard</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 text-muted-foreground hover:bg-secondary rounded text-xs">
              <Calendar className="h-3 w-3" />
              <span>Agenda</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 text-muted-foreground hover:bg-secondary rounded text-xs">
              <Users className="h-3 w-3" />
              <span>Pacientes</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 text-muted-foreground hover:bg-secondary rounded text-xs">
              <Brain className="h-3 w-3" />
              <span>Prontuários</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 text-muted-foreground hover:bg-secondary rounded text-xs">
              <DollarSign className="h-3 w-3" />
              <span>Financeiro</span>
            </div>
          </div>
        </div>

        {/* Compact Main content */}
        <div className="flex-1 p-4">
          {/* Compact Header */}
          <div className="mb-4">
            <h1 className="text-xl font-bold text-foreground mb-1 flex items-center gap-1">
              Olá! Bem-vindo ao seu dia <span className="text-primary">💜</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Você está no controle da sua rotina. Vamos começar?
            </p>
          </div>

          {/* Compact Stats cards */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <Card className="p-3">
              <div className="flex items-center justify-between mb-1">
                <Calendar className="h-4 w-4 text-primary" />
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">+12%</Badge>
              </div>
              <div className="text-lg font-bold text-foreground">8</div>
              <p className="text-xs text-muted-foreground">Sessões Hoje</p>
            </Card>
            
            <Card className="p-3">
              <div className="flex items-center justify-between mb-1">
                <Users className="h-4 w-4 text-primary" />
                <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">+8%</Badge>
              </div>
              <div className="text-lg font-bold text-foreground">24</div>
              <p className="text-xs text-muted-foreground">Pacientes</p>
            </Card>
            
            <Card className="p-3">
              <div className="flex items-center justify-between mb-1">
                <DollarSign className="h-4 w-4 text-primary" />
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">97%</Badge>
              </div>
              <div className="text-lg font-bold text-foreground">R$ 4.8k</div>
              <p className="text-xs text-muted-foreground">Este Mês</p>
            </Card>
            
            <Card className="p-3">
              <div className="flex items-center justify-between mb-1">
                <TrendingUp className="h-4 w-4 text-primary" />
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">+5%</Badge>
              </div>
              <div className="text-lg font-bold text-foreground">92%</div>
              <p className="text-xs text-muted-foreground">Comparecimento</p>
            </Card>
          </div>
          
          {/* Compact Main sections */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Agenda de Hoje
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-3 p-2 bg-secondary/50 rounded">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    MS
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">09:00</span>
                      <Badge className="bg-green-100 text-green-700 text-xs">OK</Badge>
                    </div>
                    <p className="text-sm font-medium truncate">Maria Silva</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 bg-secondary/50 rounded">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    JS
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">10:30</span>
                      <Badge className="bg-green-100 text-green-700 text-xs">OK</Badge>
                    </div>
                    <p className="text-sm font-medium truncate">João Santos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Pacientes Recentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-3 p-2 bg-secondary/50 rounded">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-medium">
                    MS
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">Maria Silva</p>
                      <Badge className="bg-green-100 text-green-700 text-xs">Ativo</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">12 sessões</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 bg-secondary/50 rounded">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-medium">
                    JS
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">João Santos</p>
                      <Badge className="bg-green-100 text-green-700 text-xs">Ativo</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">8 sessões</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardMockup;