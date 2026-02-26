import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { adminAPI, uploadsAPI } from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';
import OptimizedImage from '../../components/OptimizedImage';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [settings, setSettings] = useState({
    siteName: '',
    logo: '',
    address: '',
    phone: '',
    whatsapp: '',
    email: '',
    facebook: '',
    instagram: '',
    youtube: '',
    tiktok: '',
    stripePublicKey: '',
    stripeSecretKey: '',
    stripeWebhookSecret: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getSettings();
      // Garantir que todos os campos tenham valores padrão para evitar inputs não controlados
      const settingsData = {
        siteName: response.data.settings.siteName || '',
        logo: response.data.settings.logo || '',
        address: response.data.settings.address || '',
        phone: response.data.settings.phone || '',
        whatsapp: response.data.settings.whatsapp || '',
        email: response.data.settings.email || '',
        facebook: response.data.settings.facebook || '',
        instagram: response.data.settings.instagram || '',
        youtube: response.data.settings.youtube || '',
        tiktok: response.data.settings.tiktok || '',
        stripePublicKey: response.data.settings.stripePublicKey || '',
        stripeSecretKey: response.data.settings.stripeSecretKey || '',
        stripeWebhookSecret: response.data.settings.stripeWebhookSecret || ''
      };
      setSettings(settingsData);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      setMessage({ type: 'error', text: 'Falha ao carregar configurações' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Por favor, selecione apenas arquivos de imagem' });
      return;
    }

    // Validar tamanho do arquivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'O arquivo deve ter no máximo 5MB' });
      return;
    }

    try {
      setLogoUploading(true);
      const formData = new FormData();
      formData.append('logo', file);

      const response = await uploadsAPI.uploadLogo(formData);
      
      // Atualizar o estado com a nova URL da logo
      setSettings(prev => ({
        ...prev,
        logo: response.data.url
      }));

      setMessage({ type: 'success', text: 'Logo enviada com sucesso' });
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      console.error('Erro ao fazer upload da logo:', error);
      setMessage({ type: 'error', text: 'Erro ao fazer upload da logo' });
    } finally {
      setLogoUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.updateSettings(settings);
      setMessage({ type: 'success', text: 'Configurações salvas com sucesso' });
      
      // Atualizar as configurações com os dados retornados do backend
      const updatedSettings = {
        siteName: response.data.settings.siteName || '',
        logo: response.data.settings.logo || '',
        address: response.data.settings.address || '',
        phone: response.data.settings.phone || '',
        whatsapp: response.data.settings.whatsapp || '',
        email: response.data.settings.email || '',
        facebook: response.data.settings.facebook || '',
        instagram: response.data.settings.instagram || '',
        youtube: response.data.settings.youtube || '',
        tiktok: response.data.settings.tiktok || '',
        stripePublicKey: response.data.settings.stripePublicKey || '',
        stripeSecretKey: response.data.settings.stripeSecretKey || '',
        stripeWebhookSecret: response.data.settings.stripeWebhookSecret || ''
      };
      setSettings(updatedSettings);
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setMessage({ type: 'error', text: 'Falha ao salvar configurações' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações do Site</h1>
          <p className="text-gray-600">Gerencie as configurações gerais do site</p>
        </div>

        {message.text && (
          <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Informações Gerais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Coluna 1 */}
              <div className="space-y-6">
                {/* Upload de Logo */}
                <div className="space-y-2">
                  <Label>Logo do Site</Label>
                  <p className="text-sm text-gray-500 mb-2">Tamanho recomendado: 207x109px (máximo 5MB)</p>
                  <div className="flex flex-col space-y-4">
                    {settings.logo && (
                      <div className="flex items-center space-x-4">
                        <OptimizedImage
                          src={settings.logo}
                          alt="Logo atual"
                          className="w-32 h-16 object-contain border border-gray-200 rounded"
                        />
                        <div className="text-sm text-gray-600">
                          Logo atual
                        </div>
                      </div>
                    )}
                    <div className="flex items-center space-x-4">
                      <input
                        id="logo"
                        name="logo"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={logoUploading}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="default"
                        onClick={() => document.getElementById('logo').click()}
                        disabled={logoUploading}
                        className="flex items-center space-x-2"
                      >
                        {logoUploading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                            <span>Enviando...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span>Escolher Arquivo</span>
                          </>
                        )}
                      </Button>
                    </div>
                    {!settings.logo && (
                      <div className="text-sm text-gray-500">
                        Nenhuma logo configurada
                      </div>
                    )}
                  </div>
                </div>

                {/* Nome do Site */}
                <div className="space-y-2">
                  <Label htmlFor="siteName">Nome do Site</Label>
                  <Input
                    id="siteName"
                    name="siteName"
                    value={settings.siteName}
                    onChange={handleInputChange}
                    placeholder="Nome do site"
                  />
                </div>

                {/* Endereço */}
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={settings.address}
                    onChange={handleInputChange}
                    placeholder="Endereço completo"
                    rows={3}
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={settings.email}
                    onChange={handleInputChange}
                    placeholder="contato@ong.org"
                  />
                </div>
              </div>

              {/* Coluna 2 */}
              <div className="space-y-6">
                {/* Telefone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={settings.phone}
                    onChange={handleInputChange}
                    placeholder="(00) 00000-0000"
                  />
                </div>

                {/* WhatsApp */}
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    name="whatsapp"
                    value={settings.whatsapp}
                    onChange={handleInputChange}
                    placeholder="(00) 00000-0000"
                  />
                </div>

                {/* Redes Sociais */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Redes Sociais</h3>
                  
                  {/* Facebook */}
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      name="facebook"
                      value={settings.facebook}
                      onChange={handleInputChange}
                      placeholder="https://facebook.com/sua-pagina"
                    />
                  </div>

                  {/* Instagram */}
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      name="instagram"
                      value={settings.instagram}
                      onChange={handleInputChange}
                      placeholder="https://instagram.com/seu-perfil"
                    />
                  </div>

                  {/* YouTube */}
                  <div className="space-y-2">
                    <Label htmlFor="youtube">YouTube</Label>
                    <Input
                      id="youtube"
                      name="youtube"
                      value={settings.youtube}
                      onChange={handleInputChange}
                      placeholder="https://youtube.com/@seu-canal"
                    />
                  </div>

                  {/* TikTok */}
                  <div className="space-y-2">
                    <Label htmlFor="tiktok">TikTok</Label>
                    <Input
                      id="tiktok"
                      name="tiktok"
                      value={settings.tiktok}
                      onChange={handleInputChange}
                      placeholder="https://tiktok.com/@seu-perfil"
                    />
                  </div>
                </div>

                {/* Configuração do Stripe */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium text-gray-900">Configuração do Stripe</h3>
                  <p className="text-sm text-gray-500">Configurações para processamento de pagamentos e doações com cartão.</p>
                  
                  {/* Stripe Public Key */}
                  <div className="space-y-2">
                    <Label htmlFor="stripePublicKey">Chave Pública (Publishable Key)</Label>
                    <Input
                      id="stripePublicKey"
                      name="stripePublicKey"
                      value={settings.stripePublicKey}
                      onChange={handleInputChange}
                      placeholder="pk_test_..."
                    />
                  </div>

                  {/* Stripe Secret Key */}
                  <div className="space-y-2">
                    <Label htmlFor="stripeSecretKey">Chave Secreta (Secret Key)</Label>
                    <Input
                      id="stripeSecretKey"
                      name="stripeSecretKey"
                      type="password"
                      value={settings.stripeSecretKey}
                      onChange={handleInputChange}
                      placeholder="sk_test_..."
                    />
                  </div>

                  {/* Stripe Webhook Secret */}
                  <div className="space-y-2">
                    <Label htmlFor="stripeWebhookSecret">Segredo do Webhook (Webhook Secret)</Label>
                    <Input
                      id="stripeWebhookSecret"
                      name="stripeWebhookSecret"
                      type="password"
                      value={settings.stripeWebhookSecret}
                      onChange={handleInputChange}
                      placeholder="whsec_..."
                    />
                    <p className="text-xs text-gray-500">Necessário para confirmar pagamentos automaticamente.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Settings;