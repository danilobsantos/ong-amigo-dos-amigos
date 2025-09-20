import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { usersAPI } from '../../lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { user: currentUser } = useAuth();

  const load = async () => {
    try {
      setLoading(true);
      const res = await usersAPI.list();
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Create user form
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onCreate = async (data) => {
    try {
      await usersAPI.create(data);
      setShowCreate(false);
      reset();
      await load();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao criar usuário');
    }
  };

  // Password modal form
  const pwdForm = useForm();
  const { register: registerPwd, handleSubmit: handlePwdSubmit, reset: resetPwd, formState: { errors: pwdErrors, isSubmitting: pwdSubmitting } } = pwdForm;

  const openPasswordModal = (user) => {
    setSelectedUser(user);
    setShowPasswordModal(true);
    resetPwd();
  };

  const onResetPassword = async (data) => {
    try {
      await usersAPI.resetPassword(selectedUser.id, { newPassword: data.newPassword });
      setShowPasswordModal(false);
      setSelectedUser(null);
      resetPwd();
      await load();
      alert('Senha alterada com sucesso');
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao alterar senha');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Usuários</h1>
          <p className="text-gray-600">Gerencie acessos administrativos</p>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => setShowCreate(true)}>Criar Usuário</Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <div>Carregando...</div>
          ) : (
            users.map((u) => (
              <Card key={u.id}>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{u.name}</div>
                    <div className="text-sm text-gray-500">{u.email}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openPasswordModal(u)}>Alterar Senha</Button>
                    {currentUser?.id !== u.id && (
                      <Button variant="destructive" size="sm" onClick={() => {
                        setSelectedUser(u);
                        setShowDeleteConfirm(true);
                      }}>Excluir</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Create User Dialog */}
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Usuário</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label>Nome</Label>
                <Input {...register('name', { required: 'Nome é obrigatório', minLength: { value: 2, message: 'Mínimo 2 caracteres' } })} />
                {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <Label>E-mail</Label>
                <Input {...register('email', { required: 'E-mail é obrigatório', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'E-mail inválido' } })} />
                {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <Label>Senha</Label>
                <Input type="password" {...register('password', { required: 'Senha é obrigatória', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })} />
                {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
              </div>
              <DialogFooter>
                <div className="flex gap-2 w-full justify-end">
                  <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancelar</Button>
                  <Button type="submit" disabled={isSubmitting}>Criar</Button>
                </div>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Change Password Dialog (Admin resets user password) */}
        <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Alterar Senha - {selectedUser?.name}</DialogTitle>
              <DialogDescription>Insira a nova senha para este usuário.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handlePwdSubmit(onResetPassword)} className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label>Nova Senha</Label>
                <Input type="password" {...registerPwd('newPassword', { required: 'Senha obrigatória', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })} />
                {pwdErrors.newPassword && <p className="text-sm text-red-600">{pwdErrors.newPassword.message}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <Label>Confirmar Senha</Label>
                <Input type="password" {...registerPwd('confirmPassword', { required: 'Confirmação obrigatória', validate: (v) => v === pwdForm.getValues('newPassword') || 'As senhas não conferem' })} />
                {pwdErrors.confirmPassword && <p className="text-sm text-red-600">{pwdErrors.confirmPassword.message}</p>}
              </div>
              <DialogFooter>
                <div className="flex gap-2 w-full justify-end">
                  <Button variant="ghost" onClick={() => setShowPasswordModal(false)}>Cancelar</Button>
                  <Button type="submit" disabled={pwdSubmitting}>Alterar</Button>
                </div>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar exclusão</DialogTitle>
              <DialogDescription>Tem certeza que deseja excluir o usuário "{selectedUser?.name}"? Esta ação não pode ser desfeita.</DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 w-full justify-end mt-4">
              <Button variant="ghost" onClick={() => { setShowDeleteConfirm(false); setSelectedUser(null); }}>Cancelar</Button>
              <Button variant="destructive" onClick={async () => {
                try {
                  await usersAPI.delete(selectedUser.id);
                  setShowDeleteConfirm(false);
                  setSelectedUser(null);
                  await load();
                } catch (err) {
                  alert(err.response?.data?.error || 'Erro ao excluir usuário');
                }
              }}>Excluir</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default Users;
