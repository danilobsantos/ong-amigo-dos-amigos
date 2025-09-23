import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { adminAPI } from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';
import OptimizedImage from '../../components/OptimizedImage';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    siteName: '',
    logo: '',
    address: '',
    phone: '',
    whatsapp: '',
    email: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getSettings();
      setSettings(response.data.settings);
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

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.updateSettings(settings);
      setMessage({ type: 'success', text: 'Configurações salvas com sucesso' });
      
      // Atualizar as configurações com os dados retornados do backend
      setSettings(response.data.settings);
      
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

              <div className="space-y-2">
                <Label htmlFor="logo">Logo do Site</Label>
                <div className="flex items-center space-x-4">
                  {settings.logo && (
                    <OptimizedImage
                      src={settings.logo}
                      alt="Logo atual"
                      className="w-16 h-16 object-contain"
                    />
                  )}
                  <Input
                    id="logo"
                    name="logo"
                    value={settings.logo}
                    onChange={handleInputChange}
                    placeholder="URL da logo"
                  />
                </div>
              </div>

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