import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Users, 
  DollarSign, 
  Mail, 
  TrendingUp, 
  Calendar,
  PawPrint,
  MessageSquare,
  FileText,
  UserCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adminAPI } from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalDogs: 0,
      availableDogs: 0,
      pendingAdoptions: 0,
      totalVolunteers: 0,
      unreadContacts: 0,
      totalDonations: 0
    },
    recentDonations: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await adminAPI.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    if (action.action === 'openCreateModal') {
      // Navigate to dogs page and dispatch event to open create modal
      navigate('/admin/caes');
      // Use setTimeout to ensure the page has loaded before dispatching the event
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('open-create-dog-modal'));
      }, 100);
    } else if (action.link) {
      navigate(action.link);
    }
  };

  const statsCards = [
    {
      title: 'Pets Cadastrados',
      value: dashboardData.stats.totalDogs,
      icon: PawPrint,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      link: '/admin/caes'
    },
    {
      title: 'Pets para adoção',
      value: dashboardData.stats.availableDogs,
      icon: Heart,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      link: '/admin/caes'
    },
    {
      title: 'Adoções Pendentes',
      value: dashboardData.stats.pendingAdoptions,
      icon: UserCheck,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      link: '/admin/adocoes'
    },
    {
      title: 'Voluntários',
      value: dashboardData.stats.totalVolunteers,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      link: '/admin/voluntarios'
    },
    {
      title: 'Contatos Não Lidos',
      value: dashboardData.stats.unreadContacts,
      icon: MessageSquare,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      link: '/admin/contatos'
    },
    {
      title: 'Total Arrecadado',
      value: `R$ ${Number(dashboardData.stats.totalDonations).toLocaleString('pt-BR')}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      link: '/admin/doacoes'
    }
  ];

  const quickActions = [
    {
      title: 'Cadastrar Pet',
      description: 'Cadastrar pet para adoção',
      icon: PawPrint,
      color: 'bg-blue-500',
      action: 'openCreateModal'
    },
    {
      title: 'Criar Post no Blog',
      description: 'Publicar uma nova história ou notícia',
      icon: FileText,
      color: 'bg-green-500',
      link: '/admin/blog'
    },
    {
      title: 'Ver Adoções Pendentes',
      description: 'Revisar solicitações de adoção',
      icon: UserCheck,
      color: 'bg-orange-500',
      link: '/admin/adocoes'
    },
    {
      title: 'Responder Contatos',
      description: 'Atender mensagens recebidas',
      icon: Mail,
      color: 'bg-purple-500',
      link: '/admin/contatos'
    }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral das atividades da ONG</p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statsCards.map((stat, index) => (
            <Card key={index} className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="mt-4">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to={stat.link}>Ver Detalhes</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quickActions.map((action, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{action.title}</h4>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                    {action.link ? (
                      <Button asChild variant="ghost" size="sm">
                        <Link to={action.link}>Ir</Link>
                      </Button>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleQuickAction(action)}
                      >
                        Ir
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Doações Recentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Doações Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData.recentDonations.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Nenhuma doação recente
                </p>
              ) : (
                <div className="space-y-3">
                  {dashboardData.recentDonations.map((donation, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">
                          R$ {Number(donation.amount).toFixed(2).replace('.', ',')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {donation.donorName || 'Anônimo'}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">
                          {donation.paymentMethod.toUpperCase()}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(donation.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to="/admin/doacoes">Ver Todas as Doações</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo Mensal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Resumo do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {dashboardData.stats.totalDogs}
                </div>
                <p className="text-sm text-gray-600">Pets Cadastrados</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {dashboardData.stats.pendingAdoptions}
                </div>
                <p className="text-sm text-gray-600">Solicitações de Adoção</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {dashboardData.stats.totalVolunteers}
                </div>
                <p className="text-sm text-gray-600">Novos Voluntários</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  R$ {Number(dashboardData.stats.totalDonations).toLocaleString('pt-BR')}
                </div>
                <p className="text-sm text-gray-600">Arrecadado</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
