import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, User, Edit, Save, X, Loader2, Palette, UserCircle, FileText } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { PlanBadge } from "@/components/subscription/PlanBadge";
import { useAuth } from "@/components/auth/AuthProvider";
import { getAvatarUrl } from "@/utils/avatarUtils";
import { AvatarUploadModal } from "./AvatarUploadModal";

export const ProfileSection = () => {
  const { profile, loading, updateProfile, uploadAvatar, deleteAvatar } = useProfile();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    crp: ""
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: `${profile.nome || ''} ${profile.sobrenome || ''}`.trim() || profile.full_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        crp: profile.crp || ""
      });
    }
  }, [profile]);

  const handleSave = async () => {
    const success = await updateProfile({
      nome: formData.full_name.split(' ')[0] || formData.full_name,
      sobrenome: formData.full_name.split(' ').slice(1).join(' ') || '',
      phone: formData.phone,
      crp: formData.crp
    });
    
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        crp: profile.crp || ""
      });
    }
    setIsEditing(false);
  };

  const handleAvatarSuccess = (avatarUrl: string) => {
    // O hook useProfile vai atualizar automaticamente
    setShowAvatarModal(false);
  };

  const handleRemoveAvatar = async () => {
    await deleteAvatar();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-muted rounded w-48"></div>
            <div className="h-4 bg-muted rounded w-64"></div>
            <div className="h-4 bg-muted rounded w-64"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-muted rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-32"></div>
                <div className="h-3 bg-muted rounded w-48"></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Perfil do Usuário</span>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Alterar
                </Button>
              )}
            </div>
          </CardTitle>
          <CardDescription>
            {isEditing 
              ? "Edite suas informações pessoais e foto de perfil"
              : "Suas informações pessoais e foto de perfil"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="avatar" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="avatar" className="flex items-center gap-2">
                <UserCircle className="w-4 h-4" />
                Foto de Perfil
              </TabsTrigger>
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Dados Pessoais
              </TabsTrigger>
            </TabsList>

            {/* Tab - Foto de Perfil */}
            <TabsContent value="avatar" className="space-y-6 mt-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="w-20 h-20">
                    <AvatarImage 
                      src={getAvatarUrl(profile?.avatar || profile?.avatar_url)} 
                      className="object-cover"
                      onError={(e) => {
                        console.error('❌ Erro ao carregar imagem:', e);
                        console.log('URL que falhou:', getAvatarUrl(profile?.avatar || profile?.avatar_url));
                        console.log('Elemento da imagem:', e.target);
                      }}
                      onLoad={() => {
                        console.log('✅ Imagem carregada com sucesso:', getAvatarUrl(profile?.avatar || profile?.avatar_url));
                      }}
                    />
                    <AvatarFallback>
                      {uploadingAvatar ? (
                        <Loader2 className="w-8 h-8 animate-spin" />
                      ) : (
                        <User className="w-8 h-8" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div className="absolute -bottom-1 -right-1 flex gap-1">
                      <button
                        onClick={() => setShowAvatarModal(true)}
                        className="bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
                        title="Redimensionar foto"
                      >
                        <Palette className="w-4 h-4" />
                      </button>
                      {(profile?.avatar || profile?.avatar_url) && (
                        <button
                          onClick={handleRemoveAvatar}
                          className="bg-destructive text-destructive-foreground rounded-full p-2 hover:bg-destructive/90 transition-colors"
                          title="Remover foto"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium">Foto de Perfil</h3>
                  <p className="text-sm text-muted-foreground">
                    {isEditing 
                      ? "Clique no ícone da paleta para redimensionar ou no X para remover"
                      : "Sua foto atual de perfil"
                    }
                  </p>
                  <div className="mt-2">
                    <PlanBadge />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab - Dados Pessoais */}
            <TabsContent value="personal" className="space-y-6 mt-6">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Nome completo */}
                <div className="space-y-2">
                  <Label htmlFor="full-name">Nome Completo *</Label>
                  <Input
                    id="full-name"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Seu nome completo"
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted/50" : ""}
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    value={user?.email || formData.email}
                    placeholder="seu@email.com"
                    disabled={true}
                    className="bg-muted/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    O e-mail não pode ser alterado aqui. Entre em contato com o suporte se necessário.
                  </p>
                </div>

                {/* Telefone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(11) 99999-8888"
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted/50" : ""}
                  />
                </div>

                {/* CRP */}
                <div className="space-y-2">
                  <Label htmlFor="crp">CRP</Label>
                  <Input
                    id="crp"
                    value={formData.crp}
                    onChange={(e) => setFormData(prev => ({ ...prev, crp: e.target.value }))}
                    placeholder="06/123456"
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted/50" : ""}
                  />
                </div>
              </div>
            </TabsContent>


          </Tabs>
        </CardContent>
      </Card>

      {/* Modal de Upload Avançado */}
      <AvatarUploadModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        onSuccess={handleAvatarSuccess}
        currentAvatar={profile?.avatar || profile?.avatar_url}
      />
    </>
  );
};