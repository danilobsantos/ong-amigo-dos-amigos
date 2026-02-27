import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart, DollarSign, CreditCard, Smartphone, FileText,
  Shield, Users, Share2, Copy, CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { donationsAPI } from '../lib/api';

const inputClass =
  'h-12 rounded-2xl border-2 border-transparent bg-muted/30 focus:bg-white focus:border-primary/20 transition-all';
const labelClass = 'block text-sm font-black text-foreground mb-2';

const predefinedAmounts = [
  { value: '25',   label: 'R$ 25',    description: 'Ração por 1 semana' },
  { value: '50',   label: 'R$ 50',    description: 'Vacina completa' },
  { value: '100',  label: 'R$ 100',   description: 'Castração' },
  { value: '200',  label: 'R$ 200',   description: 'Tratamento veterinário' },
  { value: '500',  label: 'R$ 500',   description: 'Resgate de emergência' },
  { value: '1000', label: 'R$ 1.000', description: 'Cuidados mensais' },
];

const impactExamples = [
  { amount: 'R$ 25',  impact: 'Alimenta 1 pet por 1 semana' },
  { amount: 'R$ 50',  impact: 'Vacina completa para 1 pet' },
  { amount: 'R$ 100', impact: 'Castração de 1 pet' },
  { amount: 'R$ 200', impact: 'Tratamento veterinário básico' },
  { amount: 'R$ 500', impact: 'Resgate e primeiros socorros' },
];

const securityItems = [
  'Transações criptografadas',
  'Dados protegidos',
  'Recibo por e-mail',
  'Cancelamento fácil',
];

const helpOptions = [
  { icon: Heart, label: 'Adotar um Pet', href: '/adocao' },
  { icon: Users, label: 'Ser Voluntário', href: '/voluntariado' },
  { icon: Share2, label: 'Divulgar Nosso Trabalho', href: '#' },
];

const Donations = () => {
  const navigate = useNavigate();
  const [selectedAmount, setSelectedAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [recurring, setRecurring] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPixPayment, setShowPixPayment] = useState(false);
  const [pixData, setPIXData] = useState(null);
  const [currentDonationId, setCurrentDonationId] = useState(null);
  const [pixCopied, setPixCopied] = useState(false);

  const { register, handleSubmit } = useForm();

  const getAmount = () => selectedAmount || customAmount;

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      const amount = getAmount();
      if (!amount || parseFloat(amount) < 1) {
        alert('Por favor, selecione ou digite um valor válido');
        return;
      }
      const donationData = {
        amount: parseFloat(amount),
        recurring: recurring || false,
        donorName: data.donorName || null,
        donorEmail: data.donorEmail || null,
      };

      if (paymentMethod === 'pix') {
        const response = await donationsAPI.createPix(donationData);
        setPIXData(response.data.pix);
        setCurrentDonationId(response.data.donation.id);
        setShowPixPayment(true);
      } else {
        try {
          const response = await donationsAPI.createStripe(donationData);
          setCurrentDonationId(response.data.donation.id);
          window.location.href = response.data.checkoutUrl;
        } catch (stripeError) {
          if (stripeError.response?.status === 500) {
            alert('Pagamento com cartão temporariamente indisponível. Que tal tentar com PIX? É mais rápido! 😊');
            setPaymentMethod('pix');
            return;
          }
          throw stripeError;
        }
      }
    } catch (error) {
      console.error('Erro ao processar doação:', error);
      alert('Erro ao processar doação. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyPix = () => {
    if (!pixData) return;
    navigator.clipboard.writeText(pixData.payload);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero ── */}
      <section className="relative section-padding bg-primary text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="container-max text-center relative z-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white/80 font-black text-xs mb-6 tracking-[0.2em] uppercase">
            ❤️ Doe Agora
          </span>
          <h1 className="heading-hero text-white mb-6">Faça uma Doação</h1>
          <p className="body-large text-white/80 max-w-2xl mx-auto">
            Sua contribuição salva vidas. Cada doação nos ajuda a resgatar, cuidar e encontrar lares amorosos para cães em situação de vulnerabilidade.
          </p>
        </div>
      </section>

      <div className="container-max section-padding">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Donation Form (2 cols) ── */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 bg-white shadow-soft rounded-[2.5rem]">
              <CardContent className="p-8">

                {/* Card header */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="heading-card">Fazer uma Doação</h2>
                    <p className="body-small text-foreground/50">Cada centavo faz a diferença</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">

                  {/* Amount grid */}
                  <div>
                    <label className={labelClass}>Escolha o valor da doação</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {predefinedAmounts.map((a) => (
                        <button
                          key={a.value}
                          type="button"
                          onClick={() => { setSelectedAmount(a.value); setCustomAmount(''); }}
                          className={`p-4 rounded-2xl border-2 text-left transition-all ${
                            selectedAmount === a.value
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-border hover:border-primary/40 hover:bg-muted/20'
                          }`}
                        >
                          <div className="font-black text-lg text-foreground">{a.label}</div>
                          <div className="body-small text-foreground/50 mt-0.5">{a.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom amount */}
                  <div>
                    <label htmlFor="customAmount" className={labelClass}>Ou digite outro valor</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 font-black text-sm">R$</span>
                      <Input
                        id="customAmount"
                        type="number"
                        min="1"
                        step="0.01"
                        placeholder="0,00"
                        value={customAmount}
                        onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(''); }}
                        className={`${inputClass} pl-12`}
                      />
                    </div>
                  </div>

                  {/* Recurring */}
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/20 border-2 border-border">
                    <Checkbox id="recurring" checked={recurring} onCheckedChange={setRecurring} />
                    <label htmlFor="recurring" className="text-sm font-medium text-foreground/70 cursor-pointer">
                      Tornar esta uma doação mensal recorrente
                    </label>
                  </div>

                  {/* Payment method */}
                  <div>
                    <label className={labelClass}>Método de Pagamento</label>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                      <div className={`flex items-center gap-3 p-4 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'pix' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                        onClick={() => setPaymentMethod('pix')}>
                        <RadioGroupItem value="pix" id="pix" />
                        <label htmlFor="pix" className="flex items-center gap-2 cursor-pointer font-medium">
                          <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Smartphone className="w-4 h-4 text-primary" />
                          </div>
                          PIX <span className="body-small text-foreground/40 font-normal ml-1">— Instantâneo</span>
                        </label>
                      </div>
                      <div className={`flex items-center gap-3 p-4 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'stripe' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                        onClick={() => setPaymentMethod('stripe')}>
                        <RadioGroupItem value="stripe" id="stripe" />
                        <label htmlFor="stripe" className="flex items-center gap-2 cursor-pointer font-medium">
                          <div className="w-7 h-7 rounded-xl bg-secondary/15 flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-secondary" />
                          </div>
                          Cartão de Crédito/Débito
                        </label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Donor info */}
                  <div>
                    <label className={labelClass}>Informações do Doador <span className="font-normal text-foreground/40">(Opcional)</span></label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        id="donorName"
                        {...register('donorName')}
                        placeholder="Seu nome"
                        className={inputClass}
                      />
                      <Input
                        id="donorEmail"
                        type="email"
                        {...register('donorEmail')}
                        placeholder="seu@email.com"
                        className={inputClass}
                      />
                    </div>
                    <p className="body-small text-foreground/40 mt-2">
                      Fornecendo seus dados, você receberá atualizações sobre o impacto da sua doação.
                    </p>
                  </div>

                  {/* Summary */}
                  {getAmount() && (
                    <div className="flex justify-between items-center p-5 rounded-2xl bg-primary/5 border-2 border-primary/15">
                      <span className="font-black text-sm text-foreground">Total da doação{recurring ? ' / mês' : ''}:</span>
                      <span className="text-2xl font-black text-primary">
                        R$ {parseFloat(getAmount()).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  )}

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={submitting || !getAmount()}
                    className="btn-premium-hero btn-primary w-full"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Processando...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Doar Agora
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Other ways to help */}
            <Card className="border-0 bg-white shadow-soft rounded-[2.5rem]">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-secondary/15 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-secondary" />
                  </div>
                  <h3 className="heading-card">Outras Formas de Ajudar</h3>
                </div>
                <div className="space-y-3">
                  {helpOptions.map((opt) => (
                    <a
                      key={opt.label}
                      href={opt.href}
                      className="flex items-center gap-3 p-4 rounded-2xl border-2 border-border hover:border-primary/30 hover:bg-muted/20 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                        <opt.icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium text-sm text-foreground/70 group-hover:text-foreground transition-colors">{opt.label}</span>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-5">

            {/* Impact */}
            <Card className="border-0 bg-white shadow-soft rounded-[2rem]">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-black text-sm text-foreground">Impacto das Doações</span>
                </div>
                <div className="space-y-0">
                  {impactExamples.map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-3 border-b border-border/50 last:border-0">
                      <span className="font-black text-sm text-primary">{item.amount}</span>
                      <span className="body-small text-foreground/50 text-right max-w-[55%]">{item.impact}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="border-0 bg-primary/5 shadow-soft rounded-[2rem]">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-black text-sm text-foreground">Doação Segura</span>
                </div>
                <ul className="space-y-3">
                  {securityItems.map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      <span className="body-small text-foreground/60">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Transparency */}
            <Card className="border-0 bg-white shadow-soft rounded-[2rem]">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-2xl bg-secondary/15 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-secondary" />
                  </div>
                  <span className="font-black text-sm text-foreground">Transparência</span>
                </div>
                <p className="body-small text-foreground/50 mb-4">
                  Veja como suas doações são utilizadas em nossos relatórios financeiros.
                </p>
                <Button
                  variant="outline"
                  className="w-full btn-premium-md border-2 border-border hover:border-primary hover:text-primary transition-all"
                  onClick={() => navigate('/prestacao-contas')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Ver Relatórios
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ── PIX Payment Modal ── */}
      <Dialog open={showPixPayment} onOpenChange={setShowPixPayment}>
        <DialogContent className="max-w-md rounded-[2.5rem] border-0 shadow-2xl p-8">
          <DialogHeader>
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-primary" />
              </div>
            </div>
            <DialogTitle className="text-center heading-card">Pagamento PIX</DialogTitle>
            <DialogDescription className="text-center body-base text-foreground/60 mt-2">
              Escaneie o QR Code ou copie o código PIX para concluir sua doação.
            </DialogDescription>
          </DialogHeader>

          {pixData && (
            <div className="space-y-5 mt-4">
              {/* QR Code */}
              <div className="flex justify-center">
                <img
                  src={pixData.qrCode}
                  alt="QR Code PIX"
                  className="border-2 border-border rounded-2xl max-w-44"
                />
              </div>

              {/* PIX Key */}
              <div className="p-4 rounded-2xl bg-muted/30 border-2 border-border">
                <p className="font-black text-xs text-foreground/50 mb-1 uppercase tracking-wider">Chave PIX</p>
                <p className="break-all body-small text-foreground/70">{pixData.key}</p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button onClick={handleCopyPix} className="btn-premium-md btn-primary w-full">
                  {pixCopied ? (
                    <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" />Código Copiado!</span>
                  ) : (
                    <span className="flex items-center gap-2"><Copy className="w-4 h-4" />Copiar Código PIX</span>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="btn-premium-md w-full border-2 border-border hover:border-primary hover:text-primary transition-all"
                  onClick={() => { setShowPixPayment(false); navigate(`/doacoes/sucesso?donation_id=${currentDonationId}`); }}
                >
                  Pagamento Realizado ✓
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Donations;