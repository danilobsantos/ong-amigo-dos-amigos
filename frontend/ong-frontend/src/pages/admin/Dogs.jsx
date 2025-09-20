import React, { useState, useRef } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { dogsAPI, uploadsAPI } from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { useForm, Controller } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';

const AdminDogs = () => {
  // derive backend origin from VITE_API_URL (which includes /api) or fallback
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  const BACKEND_ORIGIN = API_BASE.replace(/\/api\/?$/,'');

  const normalizeImageUrl = (url) => {
    if (!url) return '/api/placeholder/64/64';
    if (/^https?:\/\//.test(url)) return url;
    // If the path is under /uploads, it's served by backend
    if (url.startsWith('/uploads/')) return `${BACKEND_ORIGIN}${url}`;
    // If the path is under /images, assume it's a frontend static asset
    if (url.startsWith('/images/')) return `${window.location.origin}${url}`;
    // otherwise default to backend origin
    if (url.startsWith('/')) return `${BACKEND_ORIGIN}${url}`;
    return url;
  };
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'available', 'adopted'
  const [animalTypeFilter, setAnimalTypeFilter] = useState('all'); // 'all', 'cachorro', 'gato'
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState(false);
  const [selectedDog, setSelectedDog] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const createForm = useForm();
  const editForm = useForm();
  const createFileRef = useRef(null);
  const editFileRef = useRef(null);
  const [createFilesList, setCreateFilesList] = useState([]);
  const [editFilesList, setEditFilesList] = useState([]);
  const [editExistingImages, setEditExistingImages] = useState([]);
  const [createSelectedFiles, setCreateSelectedFiles] = useState([]); // { file, name, url }
  const [editSelectedFiles, setEditSelectedFiles] = useState([]); // { file, name, url }

  const loadDogs = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined
      };

      // Handle status filter
      if (statusFilter === 'all') {
        params.all = 'true'; // Show all dogs (both available and adopted)
      } else if (statusFilter === 'available') {
        params.available = true; // Show only available dogs
      } else if (statusFilter === 'adopted') {
        params.available = false; // Show only adopted dogs
      }

      // Handle animal type filter
      if (animalTypeFilter !== 'all') {
        params.animalType = animalTypeFilter;
      }

      const response = await dogsAPI.getAll(params);
      setDogs(response.data.dogs || []);
      setPagination(prev => ({
        ...prev,
        ...response.data.pagination
      }));
    } catch (error) {
      console.error('Erro ao carregar pets:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, statusFilter, animalTypeFilter]);


  React.useEffect(() => {
    loadDogs();
    // Listener para evento global de reload
    const handler = () => loadDogs();
    window.addEventListener('reload-dogs', handler);
    
    // Listener para abrir modal de criação vindo do dashboard
    const openCreateHandler = () => openCreate();
    window.addEventListener('open-create-dog-modal', openCreateHandler);
    
    return () => {
      window.removeEventListener('reload-dogs', handler);
      window.removeEventListener('open-create-dog-modal', openCreateHandler);
    };
  }, [loadDogs]);

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este cão?')) {
      try {
        await dogsAPI.delete(id);
        loadDogs();
      } catch (error) {
        console.error('Erro ao excluir cão:', error);
        alert('Erro ao excluir cão');
      }
    }
  };

  const openCreate = () => {
    // clean up any previous previews
    createSelectedFiles.forEach(f => f.url && URL.revokeObjectURL(f.url));
    setCreateSelectedFiles([]);
    setCreateFilesList([]);
  createForm.reset({ name: '', age: '', size: 'médio', gender: 'macho', breed: '', animalType: 'cachorro', description: '', temperament: '', vaccinated: false, neutered: false, available: 'true', imagesText: '' });
    setShowCreate(true);
  };

  const onCreate = async (data) => {
    try {
      setCreateLoading(true);
      let images = [];
      // If there are selected files, upload them
      if (createSelectedFiles && createSelectedFiles.length > 0) {
        const fd = new FormData();
        createSelectedFiles.forEach(f => fd.append('images', f.file));
        const uploadRes = await uploadsAPI.uploadImages(fd);
        images = uploadRes.data.urls || [];
      }

      const payload = {
        name: data.name,
        age: data.age,
        size: data.size,
        gender: data.gender,
        breed: data.breed,
        animalType: data.animalType,
        description: data.description,
        temperament: data.temperament,
        vaccinated: !!data.vaccinated,
        neutered: !!data.neutered,
        available: (typeof data.available === 'string') ? (data.available === 'true') : !!data.available,
        images
      };
      await dogsAPI.create(payload);
      // cleanup previews
      createSelectedFiles.forEach(f => f.url && URL.revokeObjectURL(f.url));
      setCreateSelectedFiles([]);
      setCreateFilesList([]);
      setShowCreate(false);
      await loadDogs();
    } catch (err) {
      console.error('Erro ao criar cão:', err);
      alert(err.response?.data?.error || 'Erro ao criar cão');
    } finally {
      setCreateLoading(false);
    }
  };

  const openEdit = (dog) => {
    setSelectedDog(dog);
    editForm.reset({
      name: dog.name || '',
      age: dog.age || '',
      size: dog.size || 'médio',
      gender: dog.gender || 'macho',
      breed: dog.breed || '',
      animalType: dog.animalType || 'cachorro',
      description: dog.description || '',
      temperament: dog.temperament || '',
      vaccinated: !!dog.vaccinated,
      neutered: !!dog.neutered,
      available: (dog.available === true || dog.available === 'true') ? 'true' : 'false',
      imagesText: (dog.images || []).join('\n')
    });
    setEditExistingImages(dog.images || []);
    setShowEdit(true);
  };

  const onUpdate = async (data) => {
    try {
      setEditLoading(true);
      // Start with the existing images that the admin did not remove
      let images = Array.isArray(editExistingImages) ? [...editExistingImages] : [];

      // If new files were selected, upload them and append returned URLs
      if (data.images && data.images.length > 0) {
        const fd = new FormData();
        for (let i = 0; i < data.images.length; i++) fd.append('images', data.images[i]);
        const uploadRes = await uploadsAPI.uploadImages(fd);
        const uploaded = uploadRes.data.urls || [];
        images = images.concat(uploaded);
      }

      const payload = {
        name: data.name,
        age: data.age,
        size: data.size,
        gender: data.gender,
        breed: data.breed,
        animalType: data.animalType,
        description: data.description,
        temperament: data.temperament,
        vaccinated: !!data.vaccinated,
        neutered: !!data.neutered,
        available: (typeof data.available === 'string') ? (data.available === 'true') : !!data.available,
        images
      };
      await dogsAPI.update(selectedDog.id, payload);
      setShowEdit(false);
      setSelectedDog(null);
      setEditExistingImages([]);
      await loadDogs();
    } catch (err) {
      console.error('Erro ao atualizar cão:', err);
      alert(err.response?.data?.error || 'Erro ao atualizar cão');
    } finally {
      setEditLoading(false);
    }
  };

  const openView = (dog) => {
    setSelectedDog(dog);
    setShowView(true);
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Pets</h1>
            <p className="text-gray-600">Cadastre e gerencie os pets disponíveis para adoção</p>
          </div>
          <Button className="btn-primary" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Cadastro
          </Button>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-9 px-3 py-1 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                >
                  <option value="all">Todos os pets</option>
                  <option value="available">Para adoção</option>
                  <option value="adopted">Adotados</option>
                </select>
              </div>
              <div className="w-40">
                <select
                  value={animalTypeFilter}
                  onChange={(e) => setAnimalTypeFilter(e.target.value)}
                  className="w-full h-9 px-3 py-1 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                >
                  <option value="all">Todos</option>
                  <option value="cachorro">Cães</option>
                  <option value="gato">Gatos</option>
                </select>
              </div>
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setAnimalTypeFilter('all');
              }}>
                Limpar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Pets */}
        <Card>
          <CardHeader>
            <CardTitle>Pets Cadastrados ({pagination.total})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
                    <div className="w-16 h-16 bg-gray-300 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : dogs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhum cão encontrado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dogs.map((dog) => (
                  <div key={dog.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                    <img
                      src={normalizeImageUrl(dog.images?.[0])}
                      alt={dog.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{dog.name}</h3>
                        <Badge variant={dog.available ? 'default' : 'secondary'} className={dog.available ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}>
                          {dog.available ? 'Para adoção' : 'Adotado'}
                        </Badge>
                        <Badge variant="outline">{dog.size}</Badge>
                        <Badge variant="outline">{dog.gender}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {dog.age} • {dog.breed || 'SRD'} • {dog.temperament}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openView(dog)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEdit(dog)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(dog.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Paginação */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Anterior
                </Button>
                
                <div className="flex gap-1">
                  {[...Array(pagination.pages)].map((_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={page === pagination.page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                >
                  Próxima
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

            {/* Create Dog Dialog */}
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
              <DialogContent className="!max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="flex-shrink-0">
                  <DialogTitle>Cadastrar Pet</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto pr-2">
                  <form onSubmit={createForm.handleSubmit(onCreate)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <Label>Tipo de Animal</Label>
                        <select {...createForm.register('animalType', { required: true })} className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm">
                          <option value="cachorro">Cachorro</option>
                          <option value="gato">Gato</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>Disponibilidade</Label>
                        <select {...createForm.register('available')} className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm">
                          <option value={'true'}>Para adoção</option>
                          <option value={'false'}>Adotado</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <Label>Nome</Label>
                        <Input {...createForm.register('name', { required: true })} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>Idade</Label>
                        <Input {...createForm.register('age', { required: true })} />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <Label>Porte</Label>
                        <select {...createForm.register('size', { required: true })} className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm">
                          <option value="pequeno">Pequeno</option>
                          <option value="médio">Médio</option>
                          <option value="grande">Grande</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>Gênero</Label>
                        <select {...createForm.register('gender', { required: true })} className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm">
                          <option value="macho">Macho</option>
                          <option value="fêmea">Fêmea</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <Label>Raça</Label>
                        <Input {...createForm.register('breed')} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>Vacinado/Castrado</Label>
                        <div className="flex items-center gap-4 h-9">
                          <Controller
                            control={createForm.control}
                            name="vaccinated"
                            defaultValue={false}
                            render={({ field }) => (
                              <div className="flex items-center gap-2">
                                <Checkbox checked={!!field.value} onCheckedChange={(val) => field.onChange(!!val)} />
                                <Label>Vacinado</Label>
                              </div>
                            )}
                          />
                          <Controller
                            control={createForm.control}
                            name="neutered"
                            defaultValue={false}
                            render={({ field }) => (
                              <div className="flex items-center gap-2">
                                <Checkbox checked={!!field.value} onCheckedChange={(val) => field.onChange(!!val)} />
                                <Label>Castrado</Label>
                              </div>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label>Descrição</Label>
                      <Textarea {...createForm.register('description', { required: true })} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label>Temperamento</Label>
                      <Textarea {...createForm.register('temperament', { required: true })} />
                    </div>
                    
                    

                    <div className="flex flex-col gap-2">
                      <Label>Imagens</Label>
                      <input ref={createFileRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        createForm.setValue('images', e.target.files);
                        setCreateFilesList(files.map(f => f.name));
                        // revoke previous previews
                        createSelectedFiles.forEach(f => f.url && URL.revokeObjectURL(f.url));
                        const mapped = files.map(f => ({ file: f, name: f.name, url: URL.createObjectURL(f) }));
                        setCreateSelectedFiles(mapped);
                      }} />
                      <div className="flex items-center gap-2">
                        <Button type="button" onClick={() => createFileRef.current?.click()}>Enviar fotos</Button>
                        <div className="text-sm text-gray-600">{createFilesList.length > 0 ? `${createFilesList.length} arquivo(s) selecionado(s)` : 'Nenhum arquivo escolhido'}</div>
                      </div>
                      {createFilesList.length > 0 && (
                        <ul className="mt-2 text-sm list-disc list-inside text-gray-700">
                          {createFilesList.map((n, i) => <li key={i}>{n}</li>)}
                        </ul>
                      )}

                      {createSelectedFiles && createSelectedFiles.length > 0 && (
                        <div className="mt-3 grid grid-cols-4 gap-3">
                          {createSelectedFiles.map((f, idx) => (
                            <div key={idx} className="relative">
                              <img src={f.url} alt={f.name} className="w-24 h-24 object-cover rounded-md border" />
                              <button type="button" onClick={() => {
                                // remove and revoke
                                setCreateSelectedFiles(prev => {
                                  prev[idx] && prev[idx].url && URL.revokeObjectURL(prev[idx].url);
                                  return prev.filter((_, i) => i !== idx);
                                });
                                const remaining = createSelectedFiles.filter((_, i) => i !== idx).map(p => p.file);
                                if (createFileRef.current) createFileRef.current.value = null;
                                if (remaining.length === 0) {
                                  createForm.setValue('images', undefined);
                                  setCreateFilesList([]);
                                } else {
                                  setCreateFilesList(remaining.map(r => r.name));
                                  createForm.setValue('images', remaining);
                                }
                              }} className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow text-red-600 hover:text-red-700">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  </form>
                </div>
                <DialogFooter className="flex-shrink-0">
                  <div className="flex gap-2 w-full justify-end">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCreate(false)} 
                      className="min-w-[80px]"
                      disabled={createLoading}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      onClick={createForm.handleSubmit(onCreate)} 
                      className="min-w-[80px]"
                      disabled={createLoading}
                    >
                      {createLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        'Criar'
                      )}
                    </Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Edit Dog Dialog */}
            <Dialog open={showEdit} onOpenChange={setShowEdit}>
              <DialogContent className="!max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="flex-shrink-0">
                  <DialogTitle>Editar Pet</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto pr-2">
                  <form onSubmit={editForm.handleSubmit(onUpdate)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <Label>Tipo de Animal</Label>
                        <select {...editForm.register('animalType', { required: true })} className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm">
                          <option value="cachorro">Cachorro</option>
                          <option value="gato">Gato</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>Disponibilidade</Label>
                        <select {...editForm.register('available')} className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm">
                          <option value={'true'}>Para adoção</option>
                          <option value={'false'}>Adotado</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <Label>Nome</Label>
                        <Input {...editForm.register('name', { required: true })} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>Idade</Label>
                        <Input {...editForm.register('age', { required: true })} />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <Label>Porte</Label>
                        <select {...editForm.register('size', { required: true })} className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm">
                          <option value="pequeno">Pequeno</option>
                          <option value="médio">Médio</option>
                          <option value="grande">Grande</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>Gênero</Label>
                        <select {...editForm.register('gender', { required: true })} className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm">
                          <option value="macho">Macho</option>
                          <option value="fêmea">Fêmea</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <Label>Raça</Label>
                        <Input {...editForm.register('breed')} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>Vacinado/Castrado</Label>
                        <div className="flex items-center gap-4 h-9">
                          <Controller
                            control={editForm.control}
                            name="vaccinated"
                            defaultValue={false}
                            render={({ field }) => (
                              <div className="flex items-center gap-2">
                                <Checkbox checked={!!field.value} onCheckedChange={(val) => field.onChange(!!val)} />
                                <Label>Vacinado</Label>
                              </div>
                            )}
                          />
                          <Controller
                            control={editForm.control}
                            name="neutered"
                            defaultValue={false}
                            render={({ field }) => (
                              <div className="flex items-center gap-2">
                                <Checkbox checked={!!field.value} onCheckedChange={(val) => field.onChange(!!val)} />
                                <Label>Castrado</Label>
                              </div>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Label>Descrição</Label>
                      <Textarea {...editForm.register('description', { required: true })} />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Label>Temperamento</Label>
                      <Textarea {...editForm.register('temperament', { required: true })} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label>Imagens</Label>
                      <input ref={editFileRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        editForm.setValue('images', e.target.files);
                        setEditFilesList(files.map(f => f.name));
                        // create previews
                        const mapped = files.map(f => ({ file: f, name: f.name, url: URL.createObjectURL(f) }));
                        // revoke previous selected previews
                        editSelectedFiles.forEach(f => f.url && URL.revokeObjectURL(f.url));
                        setEditSelectedFiles(mapped);
                      }} />
                      <div className="flex items-center gap-2">
                        <Button type="button" onClick={() => editFileRef.current?.click()}>Enviar fotos</Button>
                        <div className="text-sm text-gray-600">{editFilesList.length > 0 ? `${editFilesList.length} arquivo(s) selecionado(s)` : 'Nenhum arquivo escolhido'}</div>
                      </div>
                      {editFilesList.length > 0 && (
                        <ul className="mt-2 text-sm list-disc list-inside text-gray-700">
                          {editFilesList.map((n, i) => <li key={i}>{n}</li>)}
                        </ul>
                      )}

                      {/* Existing uploaded images (thumbnails) with delete buttons */}
                      <div className="mt-3 grid grid-cols-4 gap-3">
                        { /* existing uploaded images */ }
                        {editExistingImages && editExistingImages.map((url, idx) => (
                          <div key={`existing-${idx}`} className="relative">
                              <img src={normalizeImageUrl(url)} alt={`img-${idx}`} className="w-24 h-24 object-cover rounded-md border" />
                            <button type="button" onClick={() => {
                              setEditExistingImages(prev => prev.filter((_, i) => i !== idx));
                            }} className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}

                        { /* previews for newly selected files */ }
                        {editSelectedFiles && editSelectedFiles.map((f, idx) => (
                          <div key={`selected-${idx}`} className="relative">
                            <img src={f.url} alt={f.name} className="w-24 h-24 object-cover rounded-md border" />
                            <button type="button" onClick={() => {
                              // remove preview and revoke object URL
                              setEditSelectedFiles(prev => {
                                prev[idx] && prev[idx].url && URL.revokeObjectURL(prev[idx].url);
                                return prev.filter((_, i) => i !== idx);
                              });
                              // also remove from editForm 'images' FileList by clearing the input and re-setting from remaining
                              const remaining = editSelectedFiles.filter((_, i) => i !== idx).map(p => p.file);
                              if (editFileRef.current) {
                                editFileRef.current.value = null;
                              }
                              if (remaining.length === 0) {
                                editForm.setValue('images', undefined);
                                setEditFilesList([]);
                              } else {
                                // can't programmatically set FileList; keep the selectedFiles state and names
                                setEditFilesList(remaining.map(r => r.name));
                                editForm.setValue('images', remaining);
                              }
                            }} className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </form>
                </div>
                <DialogFooter className="flex-shrink-0">
                  <div className="flex gap-2 w-full justify-end">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowEdit(false)} 
                      className="min-w-[80px]"
                      disabled={editLoading}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      onClick={editForm.handleSubmit(onUpdate)} 
                      className="min-w-[80px]"
                      disabled={editLoading}
                    >
                      {editLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        'Salvar'
                      )}
                    </Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* View Dog Dialog */}
            <Dialog open={showView} onOpenChange={setShowView}>
              <DialogContent className="!max-w-2xl max-h-[90vh] h-[32rem] overflow-hidden flex flex-col">
                <DialogHeader className="flex-shrink-0">
                  <DialogTitle>Visualizar Pet</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto pr-2">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Imagem do Pet */}
                    <div className="lg:w-50 w-full flex-shrink-0">
                      <div className="relative">
                        <img
                          src={normalizeImageUrl(selectedDog?.images?.[0])}
                          alt={selectedDog?.name}
                          className="w-full h-50 object-cover rounded-lg border shadow-sm"
                        />
                        <div className="absolute top-3 right-3">
                          <Badge variant={selectedDog?.available ? 'default' : 'secondary'} className={`text-xs ${selectedDog?.available ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}>
                            {selectedDog?.available ? 'Para adoção' : 'Adotado'}
                          </Badge>
                        </div>
                      </div>
                      
                    </div>

                    {/* Informações do Pet */}
                    <div className="flex-1 space-y-6">
                      {/* Cabeçalho com nome e badges */}
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedDog?.name}</h2>
                        <p className="text-lg text-gray-600 mb-4">{selectedDog?.age} • {selectedDog?.breed || 'SRD'}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="capitalize">
                            {selectedDog?.animalType || 'cachorro'}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {selectedDog?.size}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {selectedDog?.gender}
                          </Badge>
                          <Badge variant={selectedDog?.vaccinated ? 'default' : 'secondary'}>
                            {selectedDog?.vaccinated ? 'Vacinado' : 'Não vacinado'}
                          </Badge>
                          <Badge variant={selectedDog?.neutered ? 'default' : 'secondary'}>
                            {selectedDog?.neutered ? 'Castrado' : 'Não castrado'}
                          </Badge>
                        </div>
                      </div>

                      {/* Descrição */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Descrição</h3>
                        <p className="text-gray-700 leading-relaxed">
                          {selectedDog?.description || <span className="text-gray-500 italic">Sem descrição informada</span>}
                        </p>
                      </div>

                      {/* Temperamento */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Temperamento</h3>
                        <p className="text-gray-700 leading-relaxed">
                          {selectedDog?.temperament || <span className="text-gray-500 italic">Sem informação sobre temperamento</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter className="flex-shrink-0">
                  <div className="flex gap-2 w-full justify-end">
                    <Button className="btn-primary" onClick={() => setShowView(false)}>Fechar</Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminDogs;
