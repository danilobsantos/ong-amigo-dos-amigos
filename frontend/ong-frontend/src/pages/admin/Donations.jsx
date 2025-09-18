import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { donationsAPI } from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

const AdminDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    recurring: 0
  });

  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = async () => {
    try {
      const response = await donationsAPI.getAll();
      const donationsList = response.data.donations || [];
      setDonations(donationsList);
      
      // Calcular estatísticas
      const total = donationsList.reduce((sum, d) => sum + Number(d.amount), 0);
      const thisMonth = donationsList
        .filter(d => new Date(d.createdAt).getMonth() === new Date().getMonth())
        .reduce((sum, d) => sum + Number(d.amount), 0);
      const recurring = donationsList.filter(d => d.recurring).length;
      
      setStats({ total, thisMonth, recurring });
    } catch (error) {
      console.error('Erro ao carregar doações:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pendente', variant: 'secondary' },
      completed: { label: 'Concluída', variant: 'default' },
      failed: { label: 'Falhou', variant: 'destructive' },
      refunded: { label: 'Reembolsada', variant: 'outline' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doações</h1>
          <p className="text-gray-600">Acompanhe as doações recebidas</p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Arrecadado</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.total)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Este Mês</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.thisMonth)}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Doações Recorrentes</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.recurring}</p>
                </div>
                <CreditCard className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Doações */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Doações ({donations.length})</CardTitle>
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
                {donations.map((donation) => (
                  <div key={donation.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{formatCurrency(donation.amount)}</h3>
                        <p className="text-sm text-gray-600">
                          {donation.donorName || 'Doador Anônimo'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {getStatusBadge(donation.status)}
                        {donation.recurring && (
                          <Badge variant="outline">Recorrente</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p><strong>Método:</strong> {donation.paymentMethod.toUpperCase()}</p>
                      </div>
                      <div>
                        <p><strong>Data:</strong> {new Date(donation.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div>
                        {donation.donorEmail && (
                          <p><strong>Email:</strong> {donation.donorEmail}</p>
                        )}
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

export default AdminDonations;
