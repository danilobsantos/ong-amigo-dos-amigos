import React, { useState } from 'react';
import { Heart, DollarSign, CreditCard, Smartphone, FileText, Shield, Users, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { donationsAPI } from '../lib/api';

const Donations = () => {
  const [selectedAmount, setSelectedAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [recurring, setRecurring] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  const predefinedAmounts = [
    { value: '25', label: 'R$ 25', description: 'Ração para 1 semana' },
    { value: '50', label: 'R$ 50', description: 'Vacina completa' },
    { value: '100', label: 'R$ 100', description: 'Castração' },
    { value: '200', label: 'R$ 200', description: 'Tratamento veterinário' },
    { value: '500', label: 'R$ 500', description: 'Resgate de emergência' },
    { value: '1000', label: 'R$ 1.000', description: 'Cuidados mensais' },
  ];

  const impactExamples = [
    { amount: 'R$ 25', impact: 'Alimenta 1 cão por 1 semana' },
    { amount: 'R$ 50', impact: 'Vacina completa para 1 cão' },
    { amount: 'R$ 100', impact: 'Castração de 1 animal' },
    { amount: 'R$ 200', impact: 'Tratamento veterinário básico' },
    { amount: 'R$ 500', impact: 'Resgate e primeiros socorros' },
  ];

  const transparencyReports = [
    { title: 'Relatório Financeiro 2024', date: '2024', link: '#' },
    { title: 'Prestação de Contas Q3', date: 'Set 2024', link: '#' },
    { title: 'Relatório de Atividades', date: 'Ago 2024', link: '#' },
  ];

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      
      const amount = selectedAmount || customAmount;
      if (!amount || parseFloat(amount) < 1) {
        alert('Por favor, selecione ou digite um valor válido');
        return;
      }

      const donationData = {
        amount: parseFloat(amount),
        paymentMethod,
        recurring,
        donorName: data.donorName || null,
        donorEmail: data.donorEmail || null,
      };

      await donationsAPI.create(donationData);
      
      setShowSuccess(true);
      reset();
      setSelectedAmount('');
      setCustomAmount('');
      setRecurring(false);
    } catch (error) {
      console.error('Erro ao processar doação:', error);
      alert('Erro ao processar doação. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const getSelectedAmountValue = () => {
    return selectedAmount || customAmount;
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <Heart className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Obrigado pela sua doação!
            </h2>
            <p className="text-gray-600 mb-6">
              Sua contribuição fará uma diferença real na vida dos nossos cães. 
              Você receberá um e-mail com os detalhes da doação.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => setShowSuccess(false)} 
                className="w-full"
              >
                Fazer Nova Doação
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                Voltar ao Início
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-primary text-white section-padding">
        <div className="container-max text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Faça uma Doação</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Sua contribuição salva vidas. Cada doação nos ajuda a resgatar, 
            cuidar e encontrar lares amorosos para cães em situação de vulnerabilidade.
          </p>
        </div>
      </section>

      <div className="container-max section-padding">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário de Doação */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-6 h-6 text-primary" />
                  Fazer Doação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Valores Predefinidos */}
                  <div>
                    <Label className="text-base font-semibold mb-4 block">
                      Escolha o valor da doação
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {predefinedAmounts.map((amount) => (
                        <button
                          key={amount.value}
                          type="button"
                          onClick={() => {
                            setSelectedAmount(amount.value);
                            setCustomAmount('');
                          }}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            selectedAmount === amount.value
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-primary/50'
                          }`}
                        >
                          <div className="font-semibold text-lg">{amount.label}</div>
                          <div className="text-sm text-gray-600">{amount.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Valor Personalizado */}
                  <div>
                    <Label htmlFor="customAmount">Ou digite outro valor</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        R$
                      </span>
                      <Input
                        id="customAmount"
                        type="number"
                        min="1"
                        step="0.01"
                        placeholder="0,00"
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value);
                          setSelectedAmount('');
                        }}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Doação Recorrente */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="recurring"
                      checked={recurring}
                      onCheckedChange={setRecurring}
                    />
                    <Label htmlFor="recurring" className="text-sm">
                      Fazer desta uma doação mensal recorrente
                    </Label>
                  </div>

                  {/* Método de Pagamento */}
                  <div>
                    <Label className="text-base font-semibold mb-4 block">
                      Método de Pagamento
                    </Label>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="pix" id="pix" />
                        <Label htmlFor="pix" className="flex items-center gap-2 cursor-pointer">
                          <Smartphone className="w-5 h-5 text-green-600" />
                          PIX (Instantâneo)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="stripe" id="stripe" />
                        <Label htmlFor="stripe" className="flex items-center gap-2 cursor-pointer">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                          Cartão de Crédito/Débito
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Informações do Doador (Opcional) */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">
                      Informações do Doador (Opcional)
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="donorName">Nome</Label>
                        <Input
                          id="donorName"
                          {...register('donorName')}
                          placeholder="Seu nome"
                        />
                      </div>
                      <div>
                        <Label htmlFor="donorEmail">E-mail</Label>
                        <Input
                          id="donorEmail"
                          type="email"
                          {...register('donorEmail')}
                          placeholder="seu@email.com"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Fornecendo seus dados, você receberá atualizações sobre o impacto da sua doação.
                    </p>
                  </div>

                  {/* Resumo da Doação */}
                  {getSelectedAmountValue() && (
                    <Card className="bg-primary/5 border-primary/20">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">Total da doação:</span>
                          <span className="text-2xl font-bold text-primary">
                            R$ {parseFloat(getSelectedAmountValue()).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                        {recurring && (
                          <p className="text-sm text-gray-600 mt-2">
                            Doação mensal recorrente
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  <Button
                    type="submit"
                    disabled={submitting || !getSelectedAmountValue()}
                    size="lg"
                    className="w-full btn-accent"
                  >
                    {submitting ? 'Processando...' : (
                      <>
                        <DollarSign className="w-5 h-5 mr-2" />
                        Doar Agora
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Outras Formas de Ajudar (moved here) */}
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Outras Formas de Ajudar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Heart className="w-4 h-4 mr-2" />
                    Adotar um Cão
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Ser Voluntário
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Share2 className="w-4 h-4 mr-2" />
                    Divulgar Nosso Trabalho
                  </Button>
                </CardContent>
              </Card>
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Impacto das Doações */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Impacto das Doações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {impactExamples.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <span className="font-semibold text-accent">{item.amount}</span>
                    <span className="text-sm text-gray-600 text-right">{item.impact}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Segurança */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Doação Segura
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Transações criptografadas
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Dados protegidos
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Recibo por e-mail
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Cancelamento fácil
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Transparência */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Transparência
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Acesse nossos relatórios financeiros e veja como suas doações são utilizadas.
                </p>
                <div className="space-y-2">
                  {transparencyReports.map((report, index) => (
                    <a
                      key={index}
                      href={report.link}
                      className="block p-2 rounded border hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-sm">{report.title}</div>
                      <div className="text-xs text-gray-500">{report.date}</div>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* moved: Outras Formas de Ajudar is displayed under the form */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donations;
