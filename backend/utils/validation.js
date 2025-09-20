const Joi = require('joi');

// Validação para cães
const dogSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  age: Joi.string().required(),
  size: Joi.string().valid('pequeno', 'médio', 'grande').required(),
  gender: Joi.string().valid('macho', 'fêmea').required(),
  breed: Joi.string().max(50).allow('', null),
  animalType: Joi.string().valid('cachorro', 'gato').default('cachorro'),
  description: Joi.string().min(10).max(1000).required(),
  temperament: Joi.string().min(5).max(200).required(),
  vaccinated: Joi.boolean(),
  neutered: Joi.boolean(),
  available: Joi.boolean(),
  images: Joi.array().items(Joi.string().uri())
});

// Validação para adoção
const adoptionSchema = Joi.object({
  dogId: Joi.number().integer().positive().required(),
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(10).max(15).required(),
  address: Joi.string().min(10).max(500).required(),
  experience: Joi.string().min(10).max(1000).required(),
  reason: Joi.string().min(10).max(1000).required()
});

// Validação para voluntário
const volunteerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(10).max(15).required(),
  availability: Joi.string().min(10).max(500).required(),
  experience: Joi.string().max(1000).allow('', null),
  areas: Joi.array().items(Joi.string()).min(1).required()
});

// Validação para contato
const contactSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  subject: Joi.string().max(200).allow('', null),
  message: Joi.string().min(10).max(1000).required()
});

// Validação para post do blog
const blogPostSchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  content: Joi.string().min(50).required(),
  excerpt: Joi.string().min(20).max(300).required(),
  category: Joi.string().valid('resgates', 'eventos', 'campanhas', 'transparencia').required(),
  image: Joi.string().uri().allow('', null),
  published: Joi.boolean()
});

// Validação para login
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

// Validação para doação
const donationSchema = Joi.object({
  amount: Joi.number().positive().min(1).max(10000).required(),
  paymentMethod: Joi.string().valid('pix', 'stripe').required(),
  donorName: Joi.string().max(100).allow('', null),
  donorEmail: Joi.string().email().allow('', null),
  recurring: Joi.boolean()
});

module.exports = {
  dogSchema,
  adoptionSchema,
  volunteerSchema,
  contactSchema,
  blogPostSchema,
  loginSchema,
  donationSchema
};

