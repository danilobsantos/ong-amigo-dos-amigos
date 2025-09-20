import React, { useState, useEffect, useRef } from 'react';
import { Upload, Download, Trash2, FileText, Calendar, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { financialReportsAPI } from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

const AdminFinancialReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [period, setPeriod] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await financialReportsAPI.getAll();
      setReports(response.data.reports || []);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setLoading(false);
    }
  };

  const openUpload = () => {
    setPeriod('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowUpload(true);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Apenas arquivos PDF são permitidos');
        event.target.value = '';
        setSelectedFile(null);
        return;
      }
      if (file.size > 30 * 1024 * 1024) { // 30MB
        alert('Arquivo muito grande. Tamanho máximo: 30MB');
        event.target.value = '';
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!period.trim()) {
      alert('Por favor, informe o período de competência');
      return;
    }
    if (!selectedFile) {
      alert('Por favor, selecione um arquivo PDF');
      return;
    }

    try {
      setUploadLoading(true);
      const formData = new FormData();
      formData.append('report', selectedFile);
      formData.append('period', period.trim());

      await financialReportsAPI.upload(formData);
      setShowUpload(false);
      loadReports();
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert(error.response?.data?.error || 'Erro ao fazer upload do relatório');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDownload = async (id, fileName) => {
    try {
      const response = await financialReportsAPI.download(id);
      
      // Criar URL para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      alert('Erro ao fazer download do relatório');
    }
  };

  const handleDelete = async (id, period) => {
    if (window.confirm(`Tem certeza que deseja excluir o relatório do período "${period}"?`)) {
      try {
        await financialReportsAPI.delete(id);
        loadReports();
      } catch (error) {
        console.error('Erro ao excluir relatório:', error);
        alert('Erro ao excluir relatório');
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Prestação de Contas</h1>
            <p className="text-gray-600">Gerencie os relatórios financeiros da organização</p>
          </div>
          <Button onClick={openUpload}>
            <Upload className="w-4 h-4 mr-2" />
            Novo Relatório
          </Button>
        </div>

        {/* Lista de Relatórios */}
        <Card>
          <CardHeader>
            <CardTitle>Relatórios Financeiros ({reports.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg animate-pulse">
                    <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum relatório financeiro encontrado</p>
                <Button variant="outline" onClick={openUpload} className="mt-4">
                  <Upload className="w-4 h-4 mr-2" />
                  Enviar Primeiro Relatório
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <FileText className="w-8 h-8 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-gray-900">Prestação de Contas</h3>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {report.period}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Arquivo: {report.fileName}</p>
                          <div className="flex items-center gap-4">
                            <span>Tamanho: {report.fileSize ? formatFileSize(report.fileSize) : 'N/A'}</span>
                            <span>Enviado em: {formatDate(report.createdAt)}</span>
                            {report.uploadedBy && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                por {report.uploadedBy}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(report.id, report.fileName)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(report.id, report.period)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de Upload */}
        <Dialog open={showUpload} onOpenChange={setShowUpload}>
          <DialogContent className="!max-w-md">
            <DialogHeader>
              <DialogTitle>Enviar Relatório Financeiro</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="period">Período de Competência *</Label>
                <Input
                  id="period"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  placeholder="Ex: Janeiro 2025, 2025-01, Q1 2025"
                />
                <p className="text-xs text-gray-500">
                  Informe o período que este relatório abrange
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="file">Arquivo PDF *</Label>
                <input
                  ref={fileInputRef}
                  id="file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {selectedFile && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    <p><strong>Arquivo selecionado:</strong> {selectedFile.name}</p>
                    <p><strong>Tamanho:</strong> {formatFileSize(selectedFile.size)}</p>
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Apenas arquivos PDF. Tamanho máximo: 30MB
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <div className="flex gap-2 w-full justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowUpload(false)}
                  disabled={uploadLoading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={uploadLoading || !period.trim() || !selectedFile}
                >
                  {uploadLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Enviar Relatório
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

export default AdminFinancialReports;