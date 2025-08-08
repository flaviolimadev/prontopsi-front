import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, Copy, Edit, Trash2, ExternalLink, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useCadastroLinks, CreateCadastroLinkData, UpdateCadastroLinkData } from '@/hooks/useCadastroLinks';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function CadastroLinksManager() {
  const { links, loading, error, fetchLinks, createLink, updateLink, deleteLink } = useCadastroLinks();
  const { toast } = useToast();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<any>(null);
  const [formData, setFormData] = useState<CreateCadastroLinkData>({
    title: '',
    description: '',
    maxUses: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: 'Erro',
        description: 'O título é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createLink(formData);
      setIsCreateDialogOpen(false);
      setFormData({ title: '', description: '', maxUses: 0, isActive: true });
      toast({
        title: 'Sucesso',
        description: 'Link de cadastro criado com sucesso!',
      });
    } catch (err) {
      // Erro já tratado no hook
    }
  };

  const handleEditLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingLink || !formData.title.trim()) {
      toast({
        title: 'Erro',
        description: 'O título é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateLink(editingLink.id, formData);
      setIsEditDialogOpen(false);
      setEditingLink(null);
      setFormData({ title: '', description: '', maxUses: 0, isActive: true });
      toast({
        title: 'Sucesso',
        description: 'Link de cadastro atualizado com sucesso!',
      });
    } catch (err) {
      // Erro já tratado no hook
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este link?')) {
      return;
    }

    try {
      await deleteLink(id);
      toast({
        title: 'Sucesso',
        description: 'Link de cadastro excluído com sucesso!',
      });
    } catch (err) {
      // Erro já tratado no hook
    }
  };

  const handleEditClick = (link: any) => {
    setEditingLink(link);
    setFormData({
      title: link.title,
      description: link.description || '',
      maxUses: link.maxUses,
      isActive: link.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copiado!',
        description: 'Link copiado para a área de transferência.',
      });
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível copiar o link.',
        variant: 'destructive',
      });
    }
  };

  const getLinkStatus = (link: any) => {
    if (!link.isActive) {
      return { label: 'Inativo', variant: 'secondary' as const };
    }
    
    if (link.expiresAt && new Date() > new Date(link.expiresAt)) {
      return { label: 'Expirado', variant: 'destructive' as const };
    }
    
    if (link.maxUses > 0 && link.currentUses >= link.maxUses) {
      return { label: 'Limite Atingido', variant: 'destructive' as const };
    }
    
    return { label: 'Ativo', variant: 'default' as const };
  };

  const generatePublicUrl = (token: string) => {
    return `${window.location.origin}/#/cadastro/${token}`;
  };


  
  if (loading && (!links || links.length === 0)) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Links de Cadastro</h2>
          <p className="text-gray-600">Gerencie os links públicos para cadastro de pacientes</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Criar Link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Link de Cadastro</DialogTitle>
              <DialogDescription>
                Crie um link público para que pacientes possam se cadastrar
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateLink} className="space-y-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Cadastro para novos pacientes"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição opcional do link"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="maxUses">Limite de Usos</Label>
                <Input
                  id="maxUses"
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value) || 0 })}
                  placeholder="0 = sem limite"
                  min="0"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <Label htmlFor="isActive">Link ativo</Label>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar Link'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!links || links.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500 mb-4">Nenhum link de cadastro criado ainda</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Link
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Links Criados</CardTitle>
            <CardDescription>
              {links?.length || 0} link{(links?.length || 0) !== 1 ? 's' : ''} de cadastro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Usos</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links?.map((link) => {
                  const status = getLinkStatus(link);
                  const publicUrl = generatePublicUrl(link.token);
                  
                  return (
                    <TableRow key={link.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{link.title}</div>
                          {link.description && (
                            <div className="text-sm text-gray-500">{link.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {link.currentUses}
                          {link.maxUses > 0 && ` / ${link.maxUses}`}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {format(new Date(link.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(publicUrl)}
                            title="Copiar link"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(publicUrl, '_blank')}
                            title="Abrir link"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(link)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteLink(link.id)}
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Link de Cadastro</DialogTitle>
            <DialogDescription>
              Atualize as informações do link de cadastro
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditLink} className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Título *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Cadastro para novos pacientes"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição opcional do link"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-maxUses">Limite de Usos</Label>
              <Input
                id="edit-maxUses"
                type="number"
                value={formData.maxUses}
                onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value) || 0 })}
                placeholder="0 = sem limite"
                min="0"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <Label htmlFor="edit-isActive">Link ativo</Label>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
