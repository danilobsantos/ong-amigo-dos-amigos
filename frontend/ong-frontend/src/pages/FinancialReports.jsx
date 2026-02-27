import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { formatDate } from '../utils/date';
import { Download, FileText, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const FinancialReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/financial-reports/public');
      setReports(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (reportId, fileName) => {
    try {
      const response = await api.get(`/financial-reports/public/download/${reportId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar relatório:', error);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero ── */}
      <section className="relative section-padding bg-primary text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="container-max text-center relative z-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white/80 font-black text-xs mb-6 tracking-[0.2em] uppercase">
            📊 Transparência
          </span>
          <h1 className="heading-hero text-white mb-6">Prestação de Contas</h1>
          <p className="body-large text-white/80 max-w-2xl mx-auto">
            Transparência é fundamental para nossa ONG. Aqui você pode acessar todos os
            relatórios financeiros e prestações de contas da organização.
          </p>
        </div>
      </section>

      {/* ── Content ── */}
      <div className="container-max section-padding">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* ── Reports List Card ── */}
          <Card className="border-0 bg-white shadow-soft rounded-[2.5rem]">
            <CardContent className="p-10">

              {/* Card header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h2 className="heading-card">Relatórios Disponíveis</h2>
                  <p className="body-small text-foreground/60">Documentos auditados e publicados pela organização</p>
                </div>
              </div>

              {/* Loading */}
              {loading ? (
                <div className="flex justify-center items-center py-16">
                  <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                </div>
              ) : reports.length === 0 ? (
                /* Empty state */
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-muted rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-10 h-10 text-foreground/20" />
                  </div>
                  <h3 className="heading-card mb-3">Nenhum relatório disponível</h3>
                  <p className="body-base text-foreground/50 max-w-sm mx-auto">
                    Os relatórios financeiros serão publicados em breve.
                  </p>
                </div>
              ) : (
                /* Reports list */
                <div className="divide-y divide-border/40">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between py-5 gap-4 first:pt-0 last:pb-0 hover:bg-muted/20 -mx-2 px-2 rounded-2xl transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-black text-foreground mb-1">
                            Prestação de Contas — {report.period}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                            <span className="body-small text-foreground/50">
                              Publicado em {formatDate(report.createdAt)}
                            </span>
                            {report.fileSize && (
                              <span className="body-small text-foreground/50">{formatFileSize(report.fileSize)}</span>
                            )}
                            {report.uploadedBy && (
                              <span className="body-small text-foreground/50">Por {report.uploadedBy}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDownload(report.id, report.fileName)}
                        className="btn-premium-md btn-primary flex-shrink-0 gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Baixar PDF
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Transparency Info Card ── */}
          <Card className="border-0 bg-white shadow-soft rounded-[2.5rem]">
            <CardContent className="p-10">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="heading-card mb-3">Sobre nossa Transparência</h3>
                  <p className="body-base text-foreground/70 leading-relaxed">
                    A ONG Amigo dos Amigos acredita na transparência total de suas atividades.
                    Todos os nossos relatórios financeiros são auditados e disponibilizados
                    publicamente para que você possa acompanhar como utilizamos as doações
                    recebidas no cuidado dos animais.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default FinancialReports;