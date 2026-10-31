const express = require('express');
const router = express.Router();

// GET /api/knowledge
router.get('/', (req, res) => {
  res.json([
    {
      id: 1,
      title: 'Rider Onboarding Guide',
      description: 'Learn how to onboard a new rider',
      icon: 'book',
      href: '/knowledge/onboarding',
    },
    {
      id: 2,
      title: 'Ride Policies & Guidelines',
      description: 'View policies and important guidelines',
      icon: 'document',
      href: '/knowledge/policies',
    },
    {
      id: 3,
      title: 'FAQ',
      description: 'Get answers to common questions',
      icon: 'question',
      href: '/knowledge/faq',
    },
  ]);
});

module.exports = router;
