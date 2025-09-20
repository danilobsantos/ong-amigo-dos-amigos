import React, { useState, useEffect } from 'react';
import { Eye, Check, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { adoptionsAPI } from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';


const AdminAdoptions = ({ onStatusChange }) => {
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdoptions();
  }, []);

  const loadAdoptions = async () => {
    try {
      const response = await adoptionsAPI.getAll();
      setAdoptions(response.data.adoptions || []);
    } catch (error) {
      console.error('Erro ao carregar adoções:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const response = await adoptionsAPI.updateStatus(id, status);
      const updatedAdoption = response.data.adoption;
      setAdoptions((prevAdoptions) =>
        prevAdoptions.map((adoption) =>
          adoption.id === id ? updatedAdoption : adoption
        )
      );
      if (typeof onStatusChange === 'function') {
        onStatusChange();
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pendente', variant: 'secondary', icon: Clock },
      approved: { label: 'Aprovado', variant: 'default', icon: Check },
      rejected: { label: 'Rejeitado', variant: 'destructive', icon: X }
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
          <h1 className="text-3xl font-bold text-gray-900">Solicitações de Adoção</h1>
          <p className="text-gray-600">Gerencie as solicitações de adoção recebidas</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Solicitações ({adoptions.length})</CardTitle>
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
                {adoptions.map((adoption) => (
                  <div key={adoption.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{adoption.name}</h3>
                        <p className="text-sm text-gray-600">
                          Interessado em: <strong>{adoption.dog.name}</strong>
                        </p>
                      </div>
                      {getStatusBadge(adoption.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm"><strong>Email:</strong> {adoption.email}</p>
                        <p className="text-sm"><strong>Telefone:</strong> {adoption.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm"><strong>Data:</strong> {new Date(adoption.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1">Motivo da adoção:</p>
                      <p className="text-sm text-gray-600">{adoption.reason}</p>
                    </div>
                    
                    {adoption.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleStatusChange(adoption.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Aprovar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleStatusChange(adoption.id, 'rejected')}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Rejeitar
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Ver Detalhes
                        </Button>
                      </div>
                    )}
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

export default AdminAdoptions;
