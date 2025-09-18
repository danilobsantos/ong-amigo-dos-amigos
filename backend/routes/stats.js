const express = require('express');
const { prisma } = require('../config/database');

const router = express.Router();

// Buscar estatísticas públicas
router.get('/', async (req, res) => {
  try {
    // Buscar estatísticas em tempo real
    const [
      dogsRescued,
      dogsAdopted,
      activeVolunteers,
      totalDonationsResult
    ] = await Promise.all([
      prisma.dog.count(),
      prisma.adoption.count({ where: { status: 'approved' } }),
      prisma.volunteer.count({ where: { status: 'active' } }),
      prisma.donation.aggregate({
        where: { status: 'completed' },
        _sum: { amount: true }
      })
    ]);

    const stats = {
      dogsRescued,
      dogsAdopted,
      activeVolunteers,
      totalDonations: totalDonationsResult._sum.amount || 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
