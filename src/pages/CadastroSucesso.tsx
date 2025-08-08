import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home, Clock } from 'lucide-react';

export default function CadastroSucesso() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Cadastro Enviado com Sucesso!
            </h1>
            
            <p className="text-gray-600 mb-6">
              Sua solicitação de cadastro foi enviada e será revisada pelo psicólogo. 
              Você receberá uma confirmação assim que o cadastro for aprovado.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-blue-800 mb-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Próximos Passos</span>
              </div>
              <ul className="text-sm text-blue-700 space-y-1 text-left">
                <li>• O psicólogo revisará suas informações</li>
                <li>• Você receberá uma confirmação por email</li>
                <li>• Após a aprovação, poderá agendar consultas</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/')}
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Voltar ao Início
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
