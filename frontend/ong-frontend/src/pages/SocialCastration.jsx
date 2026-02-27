import React, { useState } from 'react';
import api from '../lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Upload, Heart, CheckCircle, ArrowRight, AlertTriangle } from 'lucide-react';

// ── Shared input class to keep all inputs consistent ──
const inputClass = 'h-12 rounded-2xl border-2 border-transparent bg-muted/30 focus:bg-white focus:border-primary/20 transition-all';
const selectTriggerClass = 'h-12 rounded-2xl border-2 border-transparent bg-muted/30 hover:bg-white hover:border-primary/20 transition-all font-medium';

// ── Reusable section card ──
const SectionCard = ({ icon, title, description, children }) => (
  <Card className="border-0 bg-white shadow-soft rounded-[2.5rem]">
    <CardContent className="p-10">
      <div className="flex items-start gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div>
          <h2 className="heading-card">{title}</h2>
          {description && <p className="body-small text-foreground/60 mt-1">{description}</p>}
        </div>
      </div>
      {children}
    </CardContent>
  </Card>
);

const SocialCastration = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    animalName: '', animalSize: '', animalAge: '', animalGender: '',
    animalSpecies: '', animalBreed: '', animalColor: '', animalTemperament: '',
    dogRabiesVaccinated: '', dogV10Vaccinated: '',
    catV3V4V5Vaccinated: '', catRabiesVaccinated: '',
    animalPhoto: null,
    tutorName: '', tutorBirthDate: '', tutorRG: '', tutorCPF: '',
    tutorAddress: '', tutorNumber: '', tutorNeighborhood: '', tutorPhone: '',
    householdSize: '', totalAnimals: '', hasChildren: '', childrenCount: '',
    monthlyIncome: '', agreesLowIncome: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = value;
    if (name === 'tutorPhone') finalValue = formatPhoneNumber(value);
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : finalValue }));
  };

  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{0,2})(\d{0,4})(\d{0,4})/, (_, p1, p2, p3) => {
        if (p3) return `(${p1}) ${p2}-${p3}`;
        if (p2) return `(${p1}) ${p2}`;
        if (p1) return `(${p1}`;
        return '';
      });
    }
    return numbers.replace(/(\d{0,2})(\d{0,5})(\d{0,4})/, (_, p1, p2, p3) => {
      if (p3) return `(${p1}) ${p2}-${p3}`;
      if (p2) return `(${p1}) ${p2}`;
      if (p1) return `(${p1}`;
      return '';
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('Arquivo muito grande. Tamanho máximo: 10MB.'); return; }
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) { alert('Apenas JPEG, JPG e PNG são permitidos.'); return; }
    setFormData(prev => ({ ...prev, animalPhoto: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!formData.agreesLowIncome) {
        alert('É necessário concordar que sua situação se enquadra em famílias de baixa renda.');
        setLoading(false);
        return;
      }
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'animalPhoto' && formData[key]) submitData.append(key, formData[key]);
        else if (key !== 'animalPhoto') submitData.append(key, formData[key]);
      });
      await api.post('/social-castration', submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess(true);
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      alert('Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Success Modal ── */}
      <Dialog open={success} onOpenChange={setSuccess}>
        <DialogContent className="max-w-md rounded-[2.5rem] border-0 shadow-2xl">
          <DialogHeader className="text-center pt-4">
            <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <DialogTitle className="heading-card text-2xl text-center">
              Solicitação Enviada! 🎉
            </DialogTitle>
            <p className="body-base text-foreground/60 text-center mt-3">
              Sua solicitação de castração social foi recebida com sucesso. Nossa equipe entrará em contato em breve.
            </p>
          </DialogHeader>
          <DialogFooter className="flex gap-3 mt-6 pb-2 sm:flex-row">
            <Button onClick={() => setSuccess(false)} className="btn-premium-md btn-primary flex-1">
              Nova Solicitação
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/'} className="btn-premium-md flex-1 border-2">
              Voltar ao Início
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Main ── */}
      <div className="min-h-screen bg-background">

        {/* ── Hero ── */}
        <section className="relative section-padding bg-primary text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="container-max text-center relative z-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white/80 font-black text-xs mb-6 tracking-[0.2em] uppercase">
              🏥 Castração Social
            </span>
            <h1 className="heading-hero text-white mb-6">Cadastro para Castração a Preço Social</h1>
            <p className="body-large text-white/80 max-w-2xl mx-auto">
              Preencha todos os dados solicitados para solicitar a castração do seu animal com assistência da ONG.
            </p>
          </div>
        </section>

        {/* ── Form ── */}
        <div className="container-max section-padding">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">

            {/* ── Animal Data ── */}
            <SectionCard
              icon={<Heart className="w-7 h-7 text-primary" />}
              title="Dados do Animal"
              description="Informações sobre o animal que passará pela cirurgia"
            >
              <div className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="body-small font-black text-foreground/80">Nome *</Label>
                    <Input name="animalName" value={formData.animalName} onChange={handleInputChange} required className={inputClass} />
                  </div>
                  <div className="space-y-2">
                    <Label className="body-small font-black text-foreground/80">Porte *</Label>
                    <Select value={formData.animalSize} onValueChange={v => setFormData(p => ({...p, animalSize: v}))}>
                      <SelectTrigger className={selectTriggerClass}><SelectValue placeholder="Selecione o porte" /></SelectTrigger>
                      <SelectContent className="rounded-2xl border-2 border-primary/5 shadow-2xl">
                        <SelectItem value="pequeno">Pequeno</SelectItem>
                        <SelectItem value="medio">Médio</SelectItem>
                        <SelectItem value="grande">Grande</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="body-small font-black text-foreground/80">Idade *</Label>
                    <Input name="animalAge" value={formData.animalAge} onChange={handleInputChange} placeholder="Ex: 2 anos" required className={inputClass} />
                  </div>
                  <div className="space-y-2">
                    <Label className="body-small font-black text-foreground/80">Sexo *</Label>
                    <Select value={formData.animalGender} onValueChange={v => setFormData(p => ({...p, animalGender: v}))}>
                      <SelectTrigger className={selectTriggerClass}><SelectValue placeholder="Selecione o sexo" /></SelectTrigger>
                      <SelectContent className="rounded-2xl border-2 border-primary/5 shadow-2xl">
                        <SelectItem value="macho">Macho</SelectItem>
                        <SelectItem value="femea">Fêmea</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="body-small font-black text-foreground/80">Espécie *</Label>
                    <Select value={formData.animalSpecies} onValueChange={v => setFormData(p => ({...p, animalSpecies: v}))}>
                      <SelectTrigger className={selectTriggerClass}><SelectValue placeholder="Selecione a espécie" /></SelectTrigger>
                      <SelectContent className="rounded-2xl border-2 border-primary/5 shadow-2xl">
                        <SelectItem value="cao">Cão 🐕</SelectItem>
                        <SelectItem value="gato">Gato 🐈</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="body-small font-black text-foreground/80">Raça</Label>
                    <Input name="animalBreed" value={formData.animalBreed} onChange={handleInputChange} placeholder="Ex: SRD, Labrador, Persa" className={inputClass} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="body-small font-black text-foreground/80">Cor *</Label>
                    <Input name="animalColor" value={formData.animalColor} onChange={handleInputChange} required className={inputClass} />
                  </div>
                  <div className="space-y-2">
                    <Label className="body-small font-black text-foreground/80">Temperamento *</Label>
                    <Input name="animalTemperament" value={formData.animalTemperament} onChange={handleInputChange} placeholder="Ex: Dócil, Agitado, Calmo" required className={inputClass} />
                  </div>
                </div>

                {/* Dog vaccines */}
                {formData.animalSpecies === 'cao' && (
                  <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-5">🐕 Vacinas do Cão</p>
                    <div className="grid md:grid-cols-2 gap-6">
                      {[
                        { label: 'Vacinado contra Raiva?', key: 'dogRabiesVaccinated', yes: 'dogRabies-yes', no: 'dogRabies-no' },
                        { label: 'Vacinado com V10?', key: 'dogV10Vaccinated', yes: 'dogV10-yes', no: 'dogV10-no' }
                      ].map(({ label, key, yes, no }) => (
                        <div key={key} className="space-y-3">
                          <Label className="body-small font-black text-foreground/80">{label}</Label>
                          <RadioGroup value={formData[key]} onValueChange={v => setFormData(p => ({...p, [key]: v}))}>
                            <div className="flex gap-6">
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value="true" id={yes} /><Label htmlFor={yes} className="cursor-pointer">Sim</Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value="false" id={no} /><Label htmlFor={no} className="cursor-pointer">Não</Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cat vaccines */}
                {formData.animalSpecies === 'gato' && (
                  <div className="p-6 bg-secondary/5 rounded-2xl border border-secondary/15">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-secondary mb-5">🐈 Vacinas do Gato</p>
                    <div className="grid md:grid-cols-2 gap-6">
                      {[
                        { label: 'Vacinado com V3, V4 ou V5?', key: 'catV3V4V5Vaccinated', yes: 'catV3V4V5-yes', no: 'catV3V4V5-no' },
                        { label: 'Vacinado contra Raiva?', key: 'catRabiesVaccinated', yes: 'catRabies-yes', no: 'catRabies-no' }
                      ].map(({ label, key, yes, no }) => (
                        <div key={key} className="space-y-3">
                          <Label className="body-small font-black text-foreground/80">{label}</Label>
                          <RadioGroup value={formData[key]} onValueChange={v => setFormData(p => ({...p, [key]: v}))}>
                            <div className="flex gap-6">
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value="true" id={yes} /><Label htmlFor={yes} className="cursor-pointer">Sim</Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value="false" id={no} /><Label htmlFor={no} className="cursor-pointer">Não</Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* ── Tutor Data ── */}
            <SectionCard
              icon={<CheckCircle className="w-7 h-7 text-primary" />}
              title="Dados do Tutor"
              description="Suas informações pessoais para contato e avaliação socioeconômica"
            >
              <div className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="body-small font-black text-foreground/80">Nome Completo *</Label>
                    <Input name="tutorName" value={formData.tutorName} onChange={handleInputChange} required className={inputClass} />
                  </div>
                  <div className="space-y-2">
                    <Label className="body-small font-black text-foreground/80">Data de Nascimento *</Label>
                    <Input name="tutorBirthDate" type="date" value={formData.tutorBirthDate} onChange={handleInputChange} required className={inputClass} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="body-small font-black text-foreground/80">RG *</Label>
                    <Input name="tutorRG" value={formData.tutorRG} onChange={handleInputChange} required className={inputClass} />
                  </div>
                  <div className="space-y-2">
                    <Label className="body-small font-black text-foreground/80">CPF *</Label>
                    <Input name="tutorCPF" value={formData.tutorCPF} onChange={handleInputChange} required className={inputClass} />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-5">
                  <div className="space-y-2 md:col-span-2">
                    <Label className="body-small font-black text-foreground/80">Endereço *</Label>
                    <Input name="tutorAddress" value={formData.tutorAddress} onChange={handleInputChange} required className={inputClass} />
                  </div>
                  <div className="space-y-2">
                    <Label className="body-small font-black text-foreground/80">Número *</Label>
                    <Input name="tutorNumber" value={formData.tutorNumber} onChange={handleInputChange} required className={inputClass} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="body-small font-black text-foreground/80">Bairro *</Label>
                    <Input name="tutorNeighborhood" value={formData.tutorNeighborhood} onChange={handleInputChange} required className={inputClass} />
                  </div>
                  <div className="space-y-2">
                    <Label className="body-small font-black text-foreground/80">Telefone *</Label>
                    <Input name="tutorPhone" value={formData.tutorPhone} onChange={handleInputChange} placeholder="(11) 99999-9999" maxLength={15} required className={inputClass} />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <Label className="body-small font-black text-foreground/80">Pessoas na residência *</Label>
                    <Input name="householdSize" type="number" min="1" value={formData.householdSize} onChange={handleInputChange} required className={inputClass} />
                  </div>
                  <div className="space-y-2">
                    <Label className="body-small font-black text-foreground/80">Total de animais *</Label>
                    <Input name="totalAnimals" type="number" min="1" value={formData.totalAnimals} onChange={handleInputChange} required className={inputClass} />
                  </div>
                  <div className="space-y-2">
                    <Label className="body-small font-black text-foreground/80">Tem filhos? *</Label>
                    <Select value={formData.hasChildren} onValueChange={v => setFormData(p => ({...p, hasChildren: v, childrenCount: v === 'false' ? '' : p.childrenCount}))}>
                      <SelectTrigger className={selectTriggerClass}><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent className="rounded-2xl border-2 border-primary/5 shadow-2xl">
                        <SelectItem value="true">Sim</SelectItem>
                        <SelectItem value="false">Não</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.hasChildren === 'true' && (
                  <div className="space-y-2">
                    <Label className="body-small font-black text-foreground/80">Quantos filhos? *</Label>
                    <Input name="childrenCount" type="number" min="1" value={formData.childrenCount} onChange={handleInputChange} required className={`${inputClass} max-w-xs`} />
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="body-small font-black text-foreground/80">Renda mensal familiar *</Label>
                  <Select value={formData.monthlyIncome} onValueChange={v => setFormData(p => ({...p, monthlyIncome: v}))}>
                    <SelectTrigger className={selectTriggerClass}><SelectValue placeholder="Selecione a faixa de renda" /></SelectTrigger>
                    <SelectContent className="rounded-2xl border-2 border-primary/5 shadow-2xl">
                      <SelectItem value="ate-1-salario">Até 1 salário mínimo</SelectItem>
                      <SelectItem value="1-a-2-salarios">De 1 a 2 salários mínimos</SelectItem>
                      <SelectItem value="2-a-3-salarios">De 2 a 3 salários mínimos</SelectItem>
                      <SelectItem value="3-a-4-salarios">De 3 a 4 salários mínimos</SelectItem>
                      <SelectItem value="acima-4-salarios">Acima de 4 salários mínimos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Low income declaration */}
                <label htmlFor="agreesLowIncome" className={`flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${formData.agreesLowIncome ? 'border-primary/40 bg-primary/5' : 'border-border/50 bg-muted/20 hover:border-primary/20'}`}>
                  <Checkbox
                    id="agreesLowIncome"
                    checked={formData.agreesLowIncome}
                    onCheckedChange={checked => setFormData(p => ({...p, agreesLowIncome: checked}))}
                    className="mt-0.5"
                  />
                  <span className="body-small text-foreground/70 leading-relaxed">
                    Concorda que sua situação se enquadra em famílias de baixa renda, que não possui condições de pagar uma castração com valor normal? *
                  </span>
                </label>
              </div>
            </SectionCard>

            {/* ── Photo Upload ── */}
            <SectionCard
              icon={<Upload className="w-7 h-7 text-primary" />}
              title="Foto do Animal"
              description="Envie uma foto clara do seu animal que passará pela cirurgia"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-5">
                  <Button
                    type="button"
                    onClick={() => document.getElementById('animalPhoto').click()}
                    className="btn-premium-md btn-primary flex-shrink-0"
                  >
                    Escolher Arquivo
                  </Button>
                  <span className={`body-small truncate ${formData.animalPhoto ? 'text-primary font-black' : 'text-foreground/40'}`}>
                    {formData.animalPhoto ? formData.animalPhoto.name : 'Nenhum arquivo selecionado'}
                  </span>
                </div>
                <Input id="animalPhoto" type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleFileChange} className="hidden" required />
                <p className="body-small text-foreground/40">Formatos aceitos: JPEG, JPG, PNG · Tamanho máximo: 10MB</p>
              </div>
            </SectionCard>

            {/* ── Legal Warning ── */}
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-secondary/10 border border-secondary/20">
              <AlertTriangle className="w-5 h-5 text-secondary flex-shrink-0" />
              <p className="body-small text-foreground/70 font-black">
                ⚠️ Qualquer informação falsa resultará em crime judicial.
              </p>
            </div>

            {/* ── Submit ── */}
            <Button
              type="submit"
              disabled={loading || !formData.agreesLowIncome}
              className="btn-premium-hero btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Enviando...' : (
                <><span>Enviar Solicitação</span><ArrowRight className="w-5 h-5 ml-2" /></>
              )}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default SocialCastration;