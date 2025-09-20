import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { formatDate } from '../utils/date';
import { Download } from 'lucide-react';

const FinancialReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/financial-reports/public');
      console.log('API Response:', response.data);
      // Garantir que reports seja sempre um array
      setReports(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      setReports([]); // Definir como array vazio em caso de erro
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (reportId, fileName) => {
    try {
      const response = await api.get(`/financial-reports/public/download/${reportId}`, {
        responseType: 'blob'
      });
      
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Prestação de Contas
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transparência é fundamental para nossa ONG. Aqui você pode acessar todos os 
            relatórios financeiros e prestações de contas da organização.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Relatórios Disponíveis
              </h2>
            </div>

            {reports.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum relatório disponível
                </h3>
                <p className="text-gray-500">
                  Os relatórios financeiros serão publicados em breve.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {reports.map((report) => (
                  <div key={report.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          Prestação de Contas - {report.period}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Publicado em {formatDate(report.createdAt)}</span>
                          {report.fileSize && (
                            <span>{formatFileSize(report.fileSize)}</span>
                          )}
                          {report.uploadedBy && (
                            <span>Por {report.uploadedBy}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownload(report.id, report.fileName)}
                        className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Baixar PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Sobre nossa Transparência
          </h3>
          <p className="text-blue-800">
            A ONG Amigo dos Amigos acredita na transparência total de suas atividades. 
            Todos os nossos relatórios financeiros são auditados e disponibilizados 
            publicamente para que você possa acompanhar como utilizamos as doações 
            recebidas no cuidado dos animais.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FinancialReports;