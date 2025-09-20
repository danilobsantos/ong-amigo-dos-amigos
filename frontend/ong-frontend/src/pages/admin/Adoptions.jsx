import React, { useState, useEffect } from 'react';
import { Eye, Check, X, Clock, User, Mail, Phone, MapPin, Heart, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { adoptionsAPI } from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';


const AdminAdoptions = ({ onStatusChange }) => {
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdoption, setSelectedAdoption] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

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

  const handleStatusChange = async (id, status, reason = null) => {
    try {
      const response = await adoptionsAPI.updateStatus(id, status, reason);
      const updatedAdoption = response.data.adoption;
      setAdoptions((prevAdoptions) =>
        prevAdoptions.map((adoption) =>
          adoption.id === id ? updatedAdoption : adoption
        )
      );
      if (typeof onStatusChange === 'function') {
        onStatusChange();
      }
      // Close modal if open
      if (showDetailsModal && selectedAdoption?.id === id) {
        setShowDetailsModal(false);
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const openDetailsModal = (adoption) => {
    setSelectedAdoption(adoption);
    setShowDetailsModal(true);
  };

  const openRejectModal = (adoption) => {
    setSelectedAdoption(adoption);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Por favor, informe o motivo da rejeição.');
      return;
    }

    try {
      setRejecting(true);
      await handleStatusChange(selectedAdoption.id, 'rejected', rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
    } catch (error) {
      console.error('Erro ao rejeitar adoção:', error);
    } finally {
      setRejecting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pendente', variant: 'secondary', icon: Clock },
      approved: { label: 'Aprovado', variant: 'default', icon: Check, className: 'bg-green-500 hover:bg-green-600 text-white' },
      rejected: { label: 'Rejeitado', variant: 'destructive', icon: X }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className={`flex items-center gap-1 ${config.className || ''}`}>
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
                        <p className="text-sm text-gray-600"><span className="font-semibold">{adoption.name}</span> — Interessado em: <strong>{adoption.dog.name}</strong></p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm"><strong>Telefone:</strong> {adoption.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm"><strong>Data:</strong> {new Date(adoption.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    </div>

                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(adoption.status)}
                        <Button variant="outline" size="sm" onClick={() => openDetailsModal(adoption)}>
                          <Eye className="w-4 h-4 mr-1" />
                          Ver Detalhes
                        </Button>
                      </div>
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
                          onClick={() => openRejectModal(adoption)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Rejeitar
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de Detalhes da Adoção */}
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="!max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Detalhes da Solicitação de Adoção</DialogTitle>
            </DialogHeader>
            
            {selectedAdoption && (
              <div className="flex-1 overflow-y-auto pr-2">
                <div className="space-y-6">
                  {/* Informações do Pet */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-500" />
                        Pet de Interesse
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <img
                          src={selectedAdoption.dog?.images?.[0] || '/api/placeholder/80/80'}
                          alt={selectedAdoption.dog?.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div>
                          <h3 className="text-xl font-semibold">{selectedAdoption.dog?.name}</h3>
                          <p className="text-gray-600">{selectedAdoption.dog?.age} • {selectedAdoption.dog?.size} • {selectedAdoption.dog?.gender}</p>
                          {selectedAdoption.dog?.breed && (
                            <p className="text-gray-600">Raça: {selectedAdoption.dog?.breed}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Informações do Candidato */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Informações do Candidato
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <User className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-600">Nome Completo</p>
                              <p className="font-medium">{selectedAdoption.name}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-600">E-mail</p>
                              <p className="font-medium">{selectedAdoption.email}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-600">Telefone</p>
                              <p className="font-medium">{selectedAdoption.phone}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-600">Data da Solicitação</p>
                              <p className="font-medium">{new Date(selectedAdoption.createdAt).toLocaleDateString('pt-BR')}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">Endereço</p>
                            <p className="font-medium whitespace-pre-line">{selectedAdoption.address}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Experiência e Motivo */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Informações Adicionais
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Experiência com Animais</h4>
                        <p className="text-gray-700 whitespace-pre-line">{selectedAdoption.experience}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Por que deseja adotar {selectedAdoption.dog?.name}?</h4>
                        <p className="text-gray-700 whitespace-pre-line">{selectedAdoption.reason}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Status Atual */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium">Status atual:</span>
                        {getStatusBadge(selectedAdoption.status)}
                      </div>
                      {selectedAdoption.status === 'rejected' && selectedAdoption.rejectionReason && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                          <h4 className="font-medium text-red-900 mb-2">Motivo da Rejeição</h4>
                          <p className="text-red-700 text-sm whitespace-pre-line">{selectedAdoption.rejectionReason}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            
            <DialogFooter className="flex-shrink-0">
              <div className="flex gap-2 w-full justify-end">
                {selectedAdoption?.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => handleStatusChange(selectedAdoption.id, 'approved')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Aprovar Adoção
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setShowDetailsModal(false);
                        openRejectModal(selectedAdoption);
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Rejeitar Adoção
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Fechar
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Rejeição */}
        <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
          <DialogContent className="!max-w-md">
            <DialogHeader>
              <DialogTitle>Rejeitar Solicitação de Adoção</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Você está rejeitando a solicitação de <strong>{selectedAdoption?.name}</strong> para adotar <strong>{selectedAdoption?.dog?.name}</strong>.
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="rejectReason">Motivo da rejeição *</Label>
                <Textarea
                  id="rejectReason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explique o motivo da rejeição..."
                  rows={4}
                  className="resize-none"
                />
              </div>
            </div>
            
            <DialogFooter>
              <div className="flex gap-2 w-full justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowRejectModal(false)}
                  disabled={rejecting}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={rejecting || !rejectReason.trim()}
                >
                  {rejecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Rejeitando...
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Rejeitar Solicitação
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminAdoptions;
