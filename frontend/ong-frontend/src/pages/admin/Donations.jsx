import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, CreditCard, Filter, MoreVertical, Eye, Edit, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('all');
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadDonations();
  }, []);

  useEffect(() => {
    loadDonations();
  }, [filterStatus, filterPaymentMethod]);

  const loadDonations = async () => {
    try {
      const params = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterPaymentMethod !== 'all') params.paymentMethod = filterPaymentMethod;
      
      const response = await donationsAPI.getAll(params);
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

  const handleEditDonation = (donation) => {
    setSelectedDonation(donation);
    setEditStatus(donation.status);
    setEditNotes(donation.notes || '');
    setShowEditModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedDonation) return;
    
    try {
      setUpdating(true);
      await donationsAPI.updateStatus(selectedDonation.id, editStatus, editNotes);
      
      // Atualizar a lista
      setDonations(donations.map(d => 
        d.id === selectedDonation.id 
          ? { ...d, status: editStatus, notes: editNotes }
          : d
      ));
      
      setShowEditModal(false);
      setSelectedDonation(null);
    } catch (error) {
      console.error('Erro ao atualizar doação:', error);
      alert('Erro ao atualizar doação');
    } finally {
      setUpdating(false);
    }
  };

  const filteredDonations = donations.filter(donation => {
    if (filterStatus !== 'all' && donation.status !== filterStatus) return false;
    if (filterPaymentMethod !== 'all' && donation.paymentMethod !== filterPaymentMethod) return false;
    return true;
  });

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
            <div className="flex justify-between items-center">
              <CardTitle>Histórico de Doações ({filteredDonations.length})</CardTitle>
              <div className="flex gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                    <SelectItem value="failed">Falhou</SelectItem>
                    <SelectItem value="refunded">Reembolsada</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterPaymentMethod} onValueChange={setFilterPaymentMethod}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Métodos</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="stripe">Cartão</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
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
                {filteredDonations.map((donation) => (
                  <div key={donation.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{formatCurrency(donation.amount)}</h3>
                        <p className="text-sm text-gray-600">
                          {donation.donorName || 'Doador Anônimo'}
                        </p>
                      </div>
                      <div className="flex gap-2 items-center">
                        {getStatusBadge(donation.status)}
                        {donation.recurring && (
                          <Badge variant="outline">Recorrente</Badge>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleEditDonation(donation)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar Status
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                    
                    {donation.notes && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm text-yellow-800"><strong>Observações:</strong> {donation.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de Edição */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Doação</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedDonation && (
                <div className="p-3 bg-gray-50 rounded">
                  <p><strong>Valor:</strong> {formatCurrency(selectedDonation.amount)}</p>
                  <p><strong>Doador:</strong> {selectedDonation.donorName || 'Anônimo'}</p>
                  <p><strong>Data:</strong> {new Date(selectedDonation.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
              )}
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                    <SelectItem value="failed">Falhou</SelectItem>
                    <SelectItem value="refunded">Reembolsada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Adicione observações sobre esta doação..."
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateStatus} disabled={updating}>
                  {updating ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminDonations;
