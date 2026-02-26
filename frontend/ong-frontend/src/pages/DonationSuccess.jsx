import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Heart, CheckCircle, ArrowLeft, Share2, Gift, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { donationsAPI } from '../lib/api';
import { motion } from 'framer-motion';

const DonationSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [donation, setDonation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (sessionId) {
      verifyPayment();
    } else {
      setLoading(false);
      setError('Sessão de pagamento não encontrada.');
    }
  }, [sessionId]);

  const verifyPayment = async () => {
    try {
      setLoading(true);
      const response = await donationsAPI.checkStripeStatus(sessionId);
      setDonation(response.data.donation);
    } catch (err) {
      console.error('Erro ao verificar pagamento:', err);
      setError('Não foi possível verificar os detalhes da sua doação, mas não se preocupe, ela será processada em breve!');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Eu acabei de ajudar a ONG Amigo dos Amigos!',
        text: 'Faça como eu e ajude a salvar vidas de cães abandonados.',
        url: window.location.origin + '/doacoes',
      }).catch(console.error);
    } else {
      alert('Link de doação copiado para sua área de transferência!');
      navigator.clipboard.writeText(window.location.origin + '/doacoes');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 font-medium">Verificando sua doação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 section-padding flex items-center">
      <div className="container-max">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-none shadow-xl overflow-hidden">
              <div className="h-2 bg-primary w-full" />
              <CardContent className="pt-12 pb-8 px-6 text-center">
                <div className="mb-6 flex justify-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Obrigado por sua generosidade!
                </h1>
                
                <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                  Sua doação foi processada com sucesso. Cada real recebido é transformado em amor e cuidado para nossos cães.
                </p>

                {donation && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-primary/5 rounded-2xl p-6 mb-8 border border-primary/10"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-sm text-gray-500 uppercase font-semibold tracking-wider">
                        Valor da Doação
                      </span>
                      <span className="text-4xl font-black text-primary">
                        R$ {parseFloat(donation.amount).toFixed(2).replace('.', ',')}
                      </span>
                      {donation.recurring && (
                        <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mt-2">
                          DOAÇÃO MENSAL
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div className="p-4 rounded-xl border border-gray-100 bg-white flex items-start gap-4 text-left">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <Gift className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Onde ajudamos?</h4>
                      <p className="text-xs text-gray-500">Ração, vacinas, castração e tratamentos veterinários.</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-gray-100 bg-white flex items-start gap-4 text-left">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Award className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Transparência</h4>
                      <p className="text-xs text-gray-500">Você receberá atualizações sobre o impacto da sua ajuda.</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button asChild className="w-full sm:w-auto px-8 py-6 rounded-full font-bold btn-accent">
                    <Link to="/">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar ao Início
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleShare}
                    className="w-full sm:w-auto px-8 py-6 rounded-full font-bold border-2"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar
                  </Button>
                </div>

                <p className="mt-8 text-sm text-gray-400 flex items-center justify-center gap-1">
                  Feito com <Heart className="w-3 h-3 fill-primary text-primary" /> pela ONG Amigo dos Amigos
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DonationSuccess;
