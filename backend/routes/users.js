const express = require('express');
const bcrypt = require('bcryptjs');
const { prisma } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');
const Joi = require('joi');

const router = express.Router();

// Validation
const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'editor').default('admin')
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  role: Joi.string().valid('admin', 'editor').optional()
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(6).optional(), // optional for admin reset
  newPassword: Joi.string().min(6).required()
});

// List users (admin)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
    res.json({ users });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Create user (admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { error, value } = createUserSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const hashed = await bcrypt.hash(value.password, 10);
    const user = await prisma.user.create({
      data: {
        name: value.name,
        email: value.email,
        password: hashed,
        role: value.role || 'admin'
      },
      select: { id: true, name: true, email: true, role: true }
    });

    res.status(201).json({ message: 'Usuário criado', user });
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Email já cadastrado' });
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Update user (admin)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { error, value } = updateUserSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const id = parseInt(req.params.id);
    const user = await prisma.user.update({
      where: { id },
      data: value,
      select: { id: true, name: true, email: true, role: true }
    });

    res.json({ message: 'Usuário atualizado', user });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Usuário não encontrado' });
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Admin reset password for user
router.post('/:id/reset-password', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const id = parseInt(req.params.id);
    const hashed = await bcrypt.hash(value.newPassword, 10);

    await prisma.user.update({
      where: { id },
      data: { password: hashed }
    });

    res.json({ message: 'Senha alterada com sucesso pelo admin' });
  } catch (error) {
    console.error('Erro ao resetar senha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Delete user (admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const requesterId = req.user?.id;
    if (requesterId && requesterId === id) {
      return res.status(400).json({ error: 'Admins não podem excluir a si mesmos' });
    }

    await prisma.user.delete({ where: { id } });
    res.json({ message: 'Usuário excluído com sucesso' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Usuário não encontrado' });
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// User change own password
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const userId = req.user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    // If currentPassword provided, verify it (for non-admin flows)
    if (value.currentPassword) {
      const valid = await bcrypt.compare(value.currentPassword, user.password);
      if (!valid) return res.status(401).json({ error: 'Senha atual incorreta' });
    }

    const hashed = await bcrypt.hash(value.newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
