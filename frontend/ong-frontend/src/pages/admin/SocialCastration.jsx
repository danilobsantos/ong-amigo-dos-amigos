import React, { useState, useEffect } from 'react';
import { Eye, Check, X, Clock, User, Mail, Phone, MapPin, Heart, FileText, Loader2, Calendar, Dog } from 'lucide-react';
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
import api from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

const AdminSocialCastration = () => {
  const [castrations, setCastrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCastration, setSelectedCastration] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    loadCastrations();
  }, []);

  const loadCastrations = async () => {
    try {
      const response = await api.get('/social-castration');
      setCastrations(response.data.castrations || []);
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status, reason = null) => {
    try {
      await api.put(`/social-castration/${id}/status`, { 
        status, 
        rejectionReason: reason 
      });
      
      setCastrations((prevCastrations) =>
        prevCastrations.map((castration) =>
          castration.id === id ? { ...castration, status, rejectionReason: reason } : castration
        )
      );
      
      if (showDetailsModal && selectedCastration?.id === id) {
        setShowDetailsModal(false);
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const openDetailsModal = (castration) => {
    setSelectedCastration(castration);
    setShowDetailsModal(true);
  };

  const openRejectModal = (castration) => {
    setSelectedCastration(castration);
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
      await handleStatusChange(selectedCastration.id, 'rejected', rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
    } catch (error) {
      console.error('Erro ao rejeitar solicitação:', error);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Castração Social</h1>
          <p className="text-gray-600">Gerencie as solicitações de castração a preço social</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Solicitações ({castrations.length})</CardTitle>
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
                {castrations.map((castration) => (
                  <div key={castration.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">{castration.tutorName}</span> — Animal: <strong>{castration.animalName}</strong>
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm"><strong>Telefone:</strong> {castration.tutorPhone}</p>
                          </div>
                          <div>
                            <p className="text-sm"><strong>Espécie:</strong> {castration.animalSpecies === 'cao' ? 'Cão' : 'Gato'}</p>
                          </div>
                          <div>
                            <p className="text-sm"><strong>Data:</strong> {formatDate(castration.createdAt)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(castration.status)}
                        <Button variant="outline" size="sm" onClick={() => openDetailsModal(castration)}>
                          <Eye className="w-4 h-4 mr-1" />
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                    
                    {castration.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleStatusChange(castration.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Aprovar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => openRejectModal(castration)}
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

        {/* Modal de Detalhes da Solicitação */}
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="!max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Detalhes da Solicitação de Castração Social</DialogTitle>
            </DialogHeader>
            
            {selectedCastration && (
              <div className="flex-1 overflow-y-auto pr-2">
                <div className="space-y-6">
                  {/* Informações do Animal */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Dog className="h-5 w-5 text-blue-600" />
                        Dados do Animal
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Nome</Label>
                          <p className="text-sm">{selectedCastration.animalName}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Porte</Label>
                          <p className="text-sm capitalize">{selectedCastration.animalSize}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Idade</Label>
                          <p className="text-sm">{selectedCastration.animalAge}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Sexo</Label>
                          <p className="text-sm capitalize">{selectedCastration.animalGender}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Espécie</Label>
                          <p className="text-sm">{selectedCastration.animalSpecies === 'cao' ? 'Cão' : 'Gato'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Raça</Label>
                          <p className="text-sm">{selectedCastration.animalBreed || 'Não informado'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Cor</Label>
                          <p className="text-sm">{selectedCastration.animalColor}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Temperamento</Label>
                          <p className="text-sm">{selectedCastration.animalTemperament}</p>
                        </div>
                      </div>

                      {/* Informações de Vacinas */}
                      {selectedCastration.animalSpecies === 'cao' && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2">Vacinas (Cães)</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-500">Vacinado contra Raiva</Label>
                              <p className="text-sm">{selectedCastration.dogRabiesVaccinated ? 'Sim' : 'Não'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-500">Vacinado com V10</Label>
                              <p className="text-sm">{selectedCastration.dogV10Vaccinated ? 'Sim' : 'Não'}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedCastration.animalSpecies === 'gato' && (
                        <div className="p-4 bg-purple-50 rounded-lg">
                          <h4 className="font-medium text-purple-900 mb-2">Vacinas (Gatos)</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-500">Vacinado com V3/V4/V5</Label>
                              <p className="text-sm">{selectedCastration.catV3V4V5Vaccinated ? 'Sim' : 'Não'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-500">Vacinado contra Raiva</Label>
                              <p className="text-sm">{selectedCastration.catRabiesVaccinated ? 'Sim' : 'Não'}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Foto do Animal */}
                      {selectedCastration.animalPhoto && (
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Foto do Animal</Label>
                          <img 
                            src={`http://localhost:3001${selectedCastration.animalPhoto}`}
                            alt={`Foto de ${selectedCastration.animalName}`}
                            className="mt-2 max-w-xs rounded-lg border"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Informações do Tutor */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-green-600" />
                        Dados do Tutor
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Nome Completo</Label>
                          <p className="text-sm">{selectedCastration.tutorName}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Data de Nascimento</Label>
                          <p className="text-sm">{formatDate(selectedCastration.tutorBirthDate)}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">RG</Label>
                          <p className="text-sm">{selectedCastration.tutorRG}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">CPF</Label>
                          <p className="text-sm">{selectedCastration.tutorCPF}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Telefone</Label>
                          <p className="text-sm">{selectedCastration.tutorPhone}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Renda Mensal</Label>
                          <p className="text-sm">{selectedCastration.monthlyIncome?.replace(/-/g, ' ')}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Endereço Completo</Label>
                          <p className="text-sm">
                            {selectedCastration.tutorAddress}, {selectedCastration.tutorNumber} - {selectedCastration.tutorNeighborhood}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Pessoas na casa</Label>
                          <p className="text-sm">{selectedCastration.householdSize}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Total de animais</Label>
                          <p className="text-sm">{selectedCastration.totalAnimals}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Filhos</Label>
                          <p className="text-sm">
                            {selectedCastration.hasChildren 
                              ? `Sim (${selectedCastration.childrenCount || 0})` 
                              : 'Não'
                            }
                          </p>
                        </div>
                      </div>

                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <Label className="text-sm font-medium text-yellow-800">Concordância</Label>
                        <p className="text-sm text-yellow-700">
                          {selectedCastration.agreesLowIncome 
                            ? '✓ Concordou que se enquadra em família de baixa renda' 
                            : '✗ Não concordou com a condição de baixa renda'
                          }
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Status da Solicitação */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-purple-600" />
                        Status da Solicitação
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 mb-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Status Atual</Label>
                          <div className="mt-1">
                            {getStatusBadge(selectedCastration.status)}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Data da Solicitação</Label>
                          <p className="text-sm">{formatDate(selectedCastration.createdAt)}</p>
                        </div>
                      </div>

                      {selectedCastration.rejectionReason && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <Label className="text-sm font-medium text-red-800">Motivo da Rejeição</Label>
                          <p className="text-sm text-red-700">{selectedCastration.rejectionReason}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            <DialogFooter className="flex-shrink-0 mt-6">
              {selectedCastration?.status === 'pending' && (
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleStatusChange(selectedCastration.id, 'approved')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Aprovar Solicitação
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      setShowDetailsModal(false);
                      openRejectModal(selectedCastration);
                    }}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Rejeitar Solicitação
                  </Button>
                </div>
              )}
              <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Rejeição */}
        <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Rejeitar Solicitação</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="rejectReason">Motivo da rejeição *</Label>
                <Textarea
                  id="rejectReason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Descreva o motivo da rejeição..."
                  className="mt-1"
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectModal(false)}>
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
                  'Rejeitar Solicitação'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminSocialCastration;