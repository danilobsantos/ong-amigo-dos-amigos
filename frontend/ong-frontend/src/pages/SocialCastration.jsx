import React, { useState } from 'react';
import api from '../lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Upload, Heart, CheckCircle } from 'lucide-react';

const SocialCastration = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    // Dados do Animal
    animalName: '',
    animalSize: '',
    animalAge: '',
    animalGender: '',
    animalSpecies: '',
    animalBreed: '',
    animalColor: '',
    animalTemperament: '',
    dogRabiesVaccinated: '',
    dogV10Vaccinated: '',
    catV3V4V5Vaccinated: '',
    catRabiesVaccinated: '',
    animalPhoto: null,
    
    // Dados do Tutor
    tutorName: '',
    tutorBirthDate: '',
    tutorRG: '',
    tutorCPF: '',
    tutorAddress: '',
    tutorNumber: '',
    tutorNeighborhood: '',
    tutorPhone: '',
    householdSize: '',
    totalAnimals: '',
    hasChildren: '',
    childrenCount: '',
    monthlyIncome: '',
    agreesLowIncome: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let finalValue = value;
    
    // Aplicar máscara de telefone
    if (name === 'tutorPhone') {
      finalValue = formatPhoneNumber(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : finalValue
    }));
  };

  const formatPhoneNumber = (value) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara
    if (numbers.length <= 10) {
      // Telefone fixo: (11) 1234-5678
      return numbers.replace(/(\d{0,2})(\d{0,4})(\d{0,4})/, (match, p1, p2, p3) => {
        if (p3) return `(${p1}) ${p2}-${p3}`;
        if (p2) return `(${p1}) ${p2}`;
        if (p1) return `(${p1}`;
        return '';
      });
    } else {
      // Celular: (11) 91234-5678
      return numbers.replace(/(\d{0,2})(\d{0,5})(\d{0,4})/, (match, p1, p2, p3) => {
        if (p3) return `(${p1}) ${p2}-${p3}`;
        if (p2) return `(${p1}) ${p2}`;
        if (p1) return `(${p1}`;
        return '';
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamanho (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Arquivo muito grande. O tamanho máximo é 10MB.');
        return;
      }
      
      // Validar tipo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Apenas arquivos JPEG, JPG e PNG são permitidos.');
        return;
      }
      
      setFormData(prev => ({ ...prev, animalPhoto: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validações
      if (!formData.agreesLowIncome) {
        alert('É necessário concordar que sua situação se enquadra em famílias de baixa renda.');
        setLoading(false);
        return;
      }

      const submitData = new FormData();
      
      // Adicionar todos os campos
      Object.keys(formData).forEach(key => {
        if (key === 'animalPhoto' && formData[key]) {
          submitData.append(key, formData[key]);
        } else if (key !== 'animalPhoto') {
          submitData.append(key, formData[key]);
        }
      });

      await api.post('/social-castration', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

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
      {/* Modal de Sucesso */}
      <Dialog open={success} onOpenChange={setSuccess}>
        <DialogContent className="max-w-md">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Solicitação Enviada!
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 py-4">
            <p className="text-gray-600 text-center">
              Sua solicitação de castração social foi recebida com sucesso. Nossa equipe entrará em contato em breve.
            </p>
          </div>

          <DialogFooter className="flex-shrink-0">
            <Button onClick={() => setSuccess(false)} className="mr-2">
              Fazer Nova Solicitação
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Voltar ao Início
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Formulário Principal */}
    <div className="min-h-screen bg-gray-50 pb-12">
      <section className="bg-primary text-white section-padding w-full">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Cadastro para Castração a Preço Social</h1>
            <p className="text-xl max-w-2xl mx-auto">
              Preencha todos os dados solicitados para solicitar a castração do seu animal
            </p>
          </div>
        </section>

      <div className="max-w-5xl mx-auto mt-16 px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Dados do Animal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-blue-600" />
                Dados do Animal
              </CardTitle>
              <CardDescription>
                Informações sobre o animal que passará pela cirurgia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="animalName">Nome *</Label>
                  <Input
                    id="animalName"
                    name="animalName"
                    value={formData.animalName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="animalSize">Porte *</Label>
                  <Select value={formData.animalSize} onValueChange={(value) => 
                    setFormData(prev => ({...prev, animalSize: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o porte" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pequeno">Pequeno</SelectItem>
                      <SelectItem value="medio">Médio</SelectItem>
                      <SelectItem value="grande">Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="animalAge">Idade *</Label>
                  <Input
                    id="animalAge"
                    name="animalAge"
                    value={formData.animalAge}
                    onChange={handleInputChange}
                    placeholder="Ex: 2 anos"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="animalGender">Sexo *</Label>
                  <Select value={formData.animalGender} onValueChange={(value) => 
                    setFormData(prev => ({...prev, animalGender: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o sexo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="macho">Macho</SelectItem>
                      <SelectItem value="femea">Fêmea</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="animalSpecies">Espécie *</Label>
                  <Select value={formData.animalSpecies} onValueChange={(value) => 
                    setFormData(prev => ({...prev, animalSpecies: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a espécie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cao">Cão</SelectItem>
                      <SelectItem value="gato">Gato</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="animalBreed">Raça</Label>
                  <Input
                    id="animalBreed"
                    name="animalBreed"
                    value={formData.animalBreed}
                    onChange={handleInputChange}
                    placeholder="Ex: SRD, Labrador, Persa"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="animalColor">Cor *</Label>
                  <Input
                    id="animalColor"
                    name="animalColor"
                    value={formData.animalColor}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="animalTemperament">Temperamento *</Label>
                  <Input
                    id="animalTemperament"
                    name="animalTemperament"
                    value={formData.animalTemperament}
                    onChange={handleInputChange}
                    placeholder="Ex: Dócil, Agitado, Calmo"
                    required
                  />
                </div>
              </div>

              {/* Vacinas para Cães */}
              {formData.animalSpecies === 'cao' && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">Vacinas (Cães)</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Vacinado contra Raiva?</Label>
                      <RadioGroup 
                        value={formData.dogRabiesVaccinated} 
                        onValueChange={(value) => setFormData(prev => ({...prev, dogRabiesVaccinated: value}))}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="dogRabies-yes" />
                          <Label htmlFor="dogRabies-yes">Sim</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="dogRabies-no" />
                          <Label htmlFor="dogRabies-no">Não</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="space-y-2">
                      <Label>Vacinado com V10?</Label>
                      <RadioGroup 
                        value={formData.dogV10Vaccinated} 
                        onValueChange={(value) => setFormData(prev => ({...prev, dogV10Vaccinated: value}))}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="dogV10-yes" />
                          <Label htmlFor="dogV10-yes">Sim</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="dogV10-no" />
                          <Label htmlFor="dogV10-no">Não</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              )}

              {/* Vacinas para Gatos */}
              {formData.animalSpecies === 'gato' && (
                <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900">Vacinas (Gatos)</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Vacinado com V3, V4 ou V5?</Label>
                      <RadioGroup 
                        value={formData.catV3V4V5Vaccinated} 
                        onValueChange={(value) => setFormData(prev => ({...prev, catV3V4V5Vaccinated: value}))}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="catV3V4V5-yes" />
                          <Label htmlFor="catV3V4V5-yes">Sim</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="catV3V4V5-no" />
                          <Label htmlFor="catV3V4V5-no">Não</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="space-y-2">
                      <Label>Vacinado contra Raiva?</Label>
                      <RadioGroup 
                        value={formData.catRabiesVaccinated} 
                        onValueChange={(value) => setFormData(prev => ({...prev, catRabiesVaccinated: value}))}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="catRabies-yes" />
                          <Label htmlFor="catRabies-yes">Sim</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="catRabies-no" />
                          <Label htmlFor="catRabies-no">Não</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dados do Tutor */}
          <Card>
            <CardHeader>
              <CardTitle>Dados do Tutor</CardTitle>
              <CardDescription>
                Suas informações pessoais para contato e avaliação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tutorName">Nome Completo *</Label>
                  <Input
                    id="tutorName"
                    name="tutorName"
                    value={formData.tutorName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tutorBirthDate">Data de Nascimento *</Label>
                  <Input
                    id="tutorBirthDate"
                    name="tutorBirthDate"
                    type="date"
                    value={formData.tutorBirthDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tutorRG">RG *</Label>
                  <Input
                    id="tutorRG"
                    name="tutorRG"
                    value={formData.tutorRG}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tutorCPF">CPF *</Label>
                  <Input
                    id="tutorCPF"
                    name="tutorCPF"
                    value={formData.tutorCPF}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="tutorAddress">Endereço *</Label>
                  <Input
                    id="tutorAddress"
                    name="tutorAddress"
                    value={formData.tutorAddress}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tutorNumber">Número *</Label>
                  <Input
                    id="tutorNumber"
                    name="tutorNumber"
                    value={formData.tutorNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tutorNeighborhood">Bairro *</Label>
                  <Input
                    id="tutorNeighborhood"
                    name="tutorNeighborhood"
                    value={formData.tutorNeighborhood}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tutorPhone">Telefone *</Label>
                  <Input
                    id="tutorPhone"
                    name="tutorPhone"
                    value={formData.tutorPhone}
                    onChange={handleInputChange}
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="householdSize">Quantas pessoas moram com você? *</Label>
                  <Input
                    id="householdSize"
                    name="householdSize"
                    type="number"
                    min="1"
                    value={formData.householdSize}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalAnimals">Quantos animais tem no total? *</Label>
                  <Input
                    id="totalAnimals"
                    name="totalAnimals"
                    type="number"
                    min="1"
                    value={formData.totalAnimals}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tem filhos? *</Label>
                  <Select value={formData.hasChildren} onValueChange={(value) => 
                    setFormData(prev => ({...prev, hasChildren: value, childrenCount: value === 'false' ? '' : prev.childrenCount}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Sim</SelectItem>
                      <SelectItem value="false">Não</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.hasChildren === 'true' && (
                <div className="space-y-2">
                  <Label htmlFor="childrenCount">Se sim, quantos? *</Label>
                  <Input
                    id="childrenCount"
                    name="childrenCount"
                    type="number"
                    min="1"
                    value={formData.childrenCount}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="monthlyIncome">Qual a sua renda mensal familiar? *</Label>
                <Select value={formData.monthlyIncome} onValueChange={(value) => 
                  setFormData(prev => ({...prev, monthlyIncome: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a faixa de renda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ate-1-salario">Até 1 salário mínimo</SelectItem>
                    <SelectItem value="1-a-2-salarios">De 1 a 2 salários mínimos</SelectItem>
                    <SelectItem value="2-a-3-salarios">De 2 a 3 salários mínimos</SelectItem>
                    <SelectItem value="3-a-4-salarios">De 3 a 4 salários mínimos</SelectItem>
                    <SelectItem value="acima-4-salarios">Acima de 4 salários mínimos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="agreesLowIncome"
                    checked={formData.agreesLowIncome}
                    onCheckedChange={(checked) => setFormData(prev => ({...prev, agreesLowIncome: checked}))}
                  />
                  <Label htmlFor="agreesLowIncome" className="text-sm leading-relaxed">
                    Concorda que sua situação se enquadra em famílias de baixa renda, que não possui condições de pagar uma castração com valor normal? *
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload da Foto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-green-600" />
                Foto do Animal
              </CardTitle>
              <CardDescription>
                Envie uma foto clara do seu animal que passará pela cirurgia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="animalPhoto">Selecionar Foto *</Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="default"
                    className="btn-primary"
                    onClick={() => document.getElementById('animalPhoto').click()}
                  >
                    Escolher Arquivo
                  </Button>
                  <span className="text-sm text-gray-600">
                    {formData.animalPhoto ? formData.animalPhoto.name : 'Nenhum arquivo selecionado'}
                  </span>
                </div>
                <Input
                  id="animalPhoto"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
                <p className="text-sm text-gray-500">
                  Formatos aceitos: JPEG, JPG, PNG. Tamanho máximo: 10MB
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Aviso Legal */}
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-1">
              <p className="text-red-800 font-medium text-center">
                ⚠️ Qualquer informação falsa resultará em crime judicial.
              </p>
            </CardContent>
          </Card>

          {/* Botão de Envio */}
          <div className="text-center">
            <Button 
              type="submit" 
              disabled={loading || !formData.agreesLowIncome}
              className="w-full md:w-auto px-8 py-3 text-lg"
            >
              {loading ? 'Enviando...' : 'Enviar Solicitação'}
            </Button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};

export default SocialCastration;