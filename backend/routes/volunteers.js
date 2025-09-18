const express = require('express');
const { prisma } = require('../config/database');
const { volunteerSchema } = require('../utils/validation');

const router = express.Router();

// Cadastrar voluntário (público)
router.post('/', async (req, res) => {
  try {
    const { error, value } = volunteerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const volunteerData = {
      ...value,
      areas: JSON.stringify(value.areas)
    };

    const volunteer = await prisma.volunteer.create({
      data: volunteerData
    });

    res.status(201).json({
      message: 'Cadastro de voluntário realizado com sucesso',
      volunteer: {
        ...volunteer,
        areas: JSON.parse(volunteer.areas)
      }
    });
  } catch (error) {
    console.error('Erro ao cadastrar voluntário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
