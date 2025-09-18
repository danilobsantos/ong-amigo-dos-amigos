import React, { useState, useEffect } from 'react';
import { Eye, UserCheck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { volunteersAPI } from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

const AdminVolunteers = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVolunteers();
  }, []);

  const loadVolunteers = async () => {
    try {
      const response = await volunteersAPI.getAll();
      setVolunteers(response.data.volunteers || []);
    } catch (error) {
      console.error('Erro ao carregar voluntários:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pendente', variant: 'secondary', icon: Clock },
      approved: { label: 'Aprovado', variant: 'default', icon: UserCheck },
      active: { label: 'Ativo', variant: 'default', icon: UserCheck },
      inactive: { label: 'Inativo', variant: 'outline', icon: Clock }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Voluntários</h1>
          <p className="text-gray-600">Gerencie os voluntários cadastrados</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Voluntários Cadastrados ({volunteers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg animate-pulse">
                    <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {volunteers.map((volunteer) => (
                  <div key={volunteer.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{volunteer.name}</h3>
                        <p className="text-sm text-gray-600">{volunteer.email}</p>
                      </div>
                      {getStatusBadge(volunteer.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm"><strong>Telefone:</strong> {volunteer.phone}</p>
                        <p className="text-sm"><strong>Data:</strong> {new Date(volunteer.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Áreas de interesse:</p>
                        <div className="flex flex-wrap gap-1">
                          {volunteer.areas.map((area, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1">Disponibilidade:</p>
                      <p className="text-sm text-gray-600">{volunteer.availability}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Ver Detalhes
                      </Button>
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

export default AdminVolunteers;
