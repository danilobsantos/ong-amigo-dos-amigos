import React, { useState, useEffect } from 'react';
import { Eye, UserCheck, Clock, Phone, Mail, Calendar, Users, Check, X, Loader2, UserMinus, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { volunteersAPI } from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

const AdminVolunteers = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadVolunteers();
  }, []);

  useEffect(() => {
    filterVolunteers();
  }, [volunteers, statusFilter]);

  const filterVolunteers = () => {
    if (statusFilter === 'all') {
      setFilteredVolunteers(volunteers);
    } else {
      setFilteredVolunteers(volunteers.filter(volunteer => volunteer.status === statusFilter));
    }
  };

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

  const handleViewDetails = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setDetailsModalOpen(true);
  };

  const handleStatusChange = async (id, status, reason = null) => {
    try {
      const response = await volunteersAPI.updateStatus(id, status, reason);
      const updatedVolunteer = response.data.volunteer;
      setVolunteers((prevVolunteers) =>
        prevVolunteers.map((volunteer) =>
          volunteer.id === id ? updatedVolunteer : volunteer
        )
      );
      // Close modal if open
      if (detailsModalOpen && selectedVolunteer?.id === id) {
        setDetailsModalOpen(false);
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert(`Erro ao atualizar status: ${error.response?.data?.error || error.message}`);
    }
  };

  const openRejectModal = (volunteer) => {
    setSelectedVolunteer(volunteer);
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
      await handleStatusChange(selectedVolunteer.id, 'rejected', rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
    } catch (error) {
      console.error('Erro ao rejeitar voluntário:', error);
    } finally {
      setRejecting(false);
    }
  };

  const getAreaLabel = (area) => {
    const areaLabels = {
      resgate: 'Resgate de Animais',
      cuidados: 'Cuidados Diários',
      transporte: 'Transporte',
      eventos: 'Eventos e Campanhas',
      adocao: 'Processo de Adoção',
      administrativo: 'Apoio Administrativo',
      veterinario: 'Cuidados Veterinários',
      marketing: 'Marketing e Comunicação'
    };
    return areaLabels[area] || area;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pendente', variant: 'secondary', icon: Clock },
      approved: { label: 'Aprovado', variant: 'default', icon: UserCheck, className: 'bg-green-500 hover:bg-green-600 text-white' },
      rejected: { label: 'Rejeitado', variant: 'destructive', icon: X },
      active: { label: 'Ativo', variant: 'default', icon: UserCheck, className: 'bg-green-500 hover:bg-blue-600 text-white' },
      inactive: { label: 'Inativo', variant: 'outline', icon: UserMinus, className: 'bg-gray-200 border-gray-300 text-gray-600' }
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
        {/* Modal de Detalhes */}
        <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
          <DialogContent className="!max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-6 border-b">
              <DialogTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                Detalhes do Voluntário
              </DialogTitle>
            </DialogHeader>
            
            {selectedVolunteer && (
              <div className="space-y-2 py-6">
                {/* Header com nome e status */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedVolunteer.name}</h2>
                    <p className="text-gray-600 mt-1">Voluntário cadastrado em {new Date(selectedVolunteer.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedVolunteer.status)}
                  </div>
                </div>

                {/* Grid de informações principais */}
                <div className="grid grid-cols-1 gap-2">
                  {/* Informações de Contato */}
                  <Card className="h-fit">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="p-1.5">
                          <Mail className="w-4 h-4 text-green-600" />
                        </div>
                        Informações de Contato
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                      <div className="flex items-center gap-3 p-1 bg-gray-50 rounded-lg">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p>{selectedVolunteer.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-1 bg-gray-50 rounded-lg">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Telefone</p>
                          <p>{selectedVolunteer.phone}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Áreas de Interesse */}
                  <Card className="h-fit">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="p-1.5">
                          <Users className="w-4 h-4 text-purple-600" />
                        </div>
                        Áreas de Interesse
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedVolunteer.areas.map((area, index) => (
                          <Badge
                            key={index} 
                            variant="secondary" 
                            className="text-xs bg-blue-100 text-blue-700"
                          >
                            {getAreaLabel(area)}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Disponibilidade */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-1.5">
                        <Calendar className="w-4 h-4 text-orange-600" />
                      </div>
                      Disponibilidade
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-2 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-100">
                      <p className="text-gray-700 leading-relaxed">{selectedVolunteer.availability}</p>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Experiência */}
                {selectedVolunteer.experience && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="p-1.5">
                          <Users className="w-4 h-4 text-teal-600" />
                        </div>
                        Experiência com Animais
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-2 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border border-teal-100">
                        <p className="text-gray-700 leading-relaxed">{selectedVolunteer.experience}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Status e Motivo de Rejeição */}
                {selectedVolunteer.status === 'rejected' && selectedVolunteer.rejectionReason && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="p-1.5">
                          <X className="w-4 h-4 text-red-600" />
                        </div>
                        Motivo da Rejeição
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-2 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-100">
                        <p className="text-gray-700 leading-relaxed">{selectedVolunteer.rejectionReason}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Ações */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
                  {selectedVolunteer.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleStatusChange(selectedVolunteer.id, 'approved')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Aprovar Voluntário
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setDetailsModalOpen(false);
                          openRejectModal(selectedVolunteer);
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Rejeitar Voluntário
                      </Button>
                    </>
                  )}
                  {(selectedVolunteer.status === 'approved' || selectedVolunteer.status === 'inactive') && (
                    <Button
                      onClick={() => handleStatusChange(selectedVolunteer.id, 'active')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      {selectedVolunteer.status === 'inactive' ? 'Reativar Voluntário' : 'Ativar Voluntário'}
                    </Button>
                  )}
                  {selectedVolunteer.status === 'active' && (
                    <Button
                      variant="outline"
                      onClick={() => handleStatusChange(selectedVolunteer.id, 'inactive')}
                      className="bg-red-400 hover:bg-red-700 text-white"
                    >
                      <UserMinus className="w-4 h-4 mr-2" />
                      Desativar Voluntário
                    </Button>
                  )}
                  <Button 
                    variant="outline"
                    onClick={() => setDetailsModalOpen(false)}
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal de Rejeição */}
        <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
          <DialogContent className="!max-w-md">
            <DialogHeader>
              <DialogTitle>Rejeitar Voluntário</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Você está rejeitando a solicitação de <strong>{selectedVolunteer?.name}</strong> para ser voluntário.
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

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Voluntários</h1>
          <p className="text-gray-600">Gerencie os voluntários cadastrados</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>Voluntários Cadastrados ({filteredVolunteers.length})</CardTitle>
              <div className="flex items-center gap-2">
                <Label htmlFor="status-filter" className="text-sm font-medium">Filtrar por:</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="approved">Aprovados</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="inactive">Inativos</SelectItem>
                    <SelectItem value="rejected">Rejeitados</SelectItem>
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
              <div className="space-y-6">
                {filteredVolunteers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Nenhum voluntário encontrado com o filtro selecionado.</p>
                  </div>
                ) : (
                  filteredVolunteers.map((volunteer) => (
                  <Card key={volunteer.id} className="hover:shadow-md transition-shadow duration-200">
                    <CardContent>
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900">{volunteer.name}</h3>
                            {getStatusBadge(volunteer.status)}
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Phone className="w-4 h-4" />
                              <span className="text-sm">{volunteer.phone}</span>
                            </div>
                          
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Áreas de interesse
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {volunteer.areas.slice(0, 3).map((area, index) => (
                              <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                {getAreaLabel(area)}
                              </Badge>
                            ))}
                            {volunteer.areas.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{volunteer.areas.length - 3} mais
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Disponibilidade
                          </h4>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {volunteer.availability.length > 100 
                              ? `${volunteer.availability.substring(0, 100)}...` 
                              : volunteer.availability
                            }
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 justify-end pt-4 border-t border-gray-100">
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(volunteer)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Ver Detalhes
                        </Button>
                        {volunteer.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => handleStatusChange(volunteer.id, 'approved')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Aprovar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => openRejectModal(volunteer)}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Rejeitar
                            </Button>
                          </>
                        )}
                        {(volunteer.status === 'approved' || volunteer.status === 'inactive') && (
                          <Button 
                            size="sm" 
                            onClick={() => handleStatusChange(volunteer.id, 'active')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <UserPlus className="w-4 h-4 mr-1" />
                            {volunteer.status === 'inactive' ? 'Reativar' : 'Ativar'}
                          </Button>
                        )}
                        {volunteer.status === 'active' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleStatusChange(volunteer.id, 'inactive')}
                            className="bg-red-400 hover:bg-red-700 text-white"
                          >
                            <UserMinus className="w-4 h-4 mr-1" />
                            Desativar
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminVolunteers;
