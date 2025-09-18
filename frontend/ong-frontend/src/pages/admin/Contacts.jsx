import React, { useState, useEffect } from 'react';
import { Mail, Eye, MessageSquare, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { contactsAPI } from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const response = await contactsAPI.getAll();
      setContacts(response.data.contacts || []);
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      unread: { label: 'Não Lido', variant: 'destructive', icon: Mail },
      read: { label: 'Lido', variant: 'secondary', icon: Eye },
      replied: { label: 'Respondido', variant: 'default', icon: MessageSquare }
    };
    
    const config = statusConfig[status] || statusConfig.unread;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getSubjectLabel = (subject) => {
    const subjects = {
      adocao: 'Adoção de Animais',
      doacao: 'Doações',
      voluntariado: 'Voluntariado',
      parcerias: 'Parcerias',
      denuncia: 'Denúncia de Maus-tratos',
      outros: 'Outros Assuntos'
    };
    return subjects[subject] || 'Assunto Geral';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mensagens de Contato</h1>
          <p className="text-gray-600">Gerencie as mensagens recebidas pelo formulário de contato</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mensagens Recebidas ({contacts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg animate-pulse">
                    <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma mensagem recebida</p>
              </div>
            ) : (
              <div className="space-y-4">
                {contacts.map((contact) => (
                  <div key={contact.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{contact.name}</h3>
                        <p className="text-sm text-gray-600">{contact.email}</p>
                      </div>
                      <div className="flex gap-2">
                        {getStatusBadge(contact.status)}
                        {contact.subject && (
                          <Badge variant="outline">
                            {getSubjectLabel(contact.subject)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-700">{contact.message}</p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {new Date(contact.createdAt).toLocaleString('pt-BR')}
                      </p>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Ver Detalhes
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => window.open(`mailto:${contact.email}?subject=Re: Contato - ONG Amigo dos Amigos`)}
                        >
                          <Mail className="w-4 h-4 mr-1" />
                          Responder
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminContacts;
