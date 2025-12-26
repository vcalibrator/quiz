/**
 * Quiz Configuration
 * Contains mysterious symbols, secret keywords, and quiz question data
 * Generated: 2025-12-26 03:17:08 UTC
 */

module.exports = {
  // Mysterious Symbols Configuration
  mysteriousSymbols: {
    arcane: ['✦', '✧', '✩', '✪', '✫', '✬', '✭', '✮'],
    esoteric: ['◇', '◆', '◈', '◉', '◊', '○', '●', '◐'],
    mystical: ['⬢', '⬡', '⬢', '☆', '★', '✡', '✤', '✥'],
    forbidden: ['⚡', '⚔', '⚰', '⚱', '☠', '☢', '☣', '☤'],
    sacred: ['☬', '☮', '☯', '☫', '☪', '☸', '☹', '☺']
  },

  // Secret Keywords Configuration
  secretKeywords: {
    activation: ['whisper', 'shadow', 'echo', 'cipher', 'nexus', 'vortex'],
    restriction: ['forbidden', 'sealed', 'locked', 'hidden', 'veiled', 'dormant'],
    revelation: ['manifest', 'unveil', 'awaken', 'illuminate', 'transcend', 'ascend'],
    protection: ['shield', 'ward', 'barrier', 'sanctuary', 'refuge', 'haven'],
    transformation: ['morph', 'transmute', 'evolve', 'metamorph', 'transfigure', 'convert']
  },

  // Quiz Questions Data
  quizQuestions: [
    {
      id: 1,
      category: 'Fundamentals',
      difficulty: 'easy',
      question: 'What is the primary purpose of configuration files?',
      options: [
        'To store application settings and preferences',
        'To execute code directly',
        'To replace database systems',
        'To authenticate users'
      ],
      correctAnswer: 0,
      explanation: 'Configuration files centralize settings, making applications flexible and maintainable.'
    },
    {
      id: 2,
      category: 'Advanced',
      difficulty: 'hard',
      question: 'Which of these is NOT a common configuration format?',
      options: [
        'JSON',
        'YAML',
        'XML',
        'JPEG'
      ],
      correctAnswer: 3,
      explanation: 'JPEG is an image format, not a configuration format. JSON, YAML, and XML are all common configuration formats.'
    },
    {
      id: 3,
      category: 'Security',
      difficulty: 'medium',
      question: 'What should be kept secret in configuration?',
      options: [
        'API keys and database passwords',
        'Application name',
        'Server IP addresses',
        'Public endpoints'
      ],
      correctAnswer: 0,
      explanation: 'Sensitive credentials like API keys and passwords must be kept secret and not committed to version control.'
    },
    {
      id: 4,
      category: 'Best Practices',
      difficulty: 'medium',
      question: 'What is a best practice for managing environment-specific configurations?',
      options: [
        'Use environment variables',
        'Hardcode values directly',
        'Store in comments',
        'Use comments as documentation'
      ],
      correctAnswer: 0,
      explanation: 'Environment variables allow the same code to run across different environments with different settings.'
    },
    {
      id: 5,
      category: 'Intermediate',
      difficulty: 'medium',
      question: 'Which configuration management tool is most commonly used in Node.js projects?',
      options: [
        'dotenv',
        'SecretManager',
        'ConfigureMe',
        'SettingsHub'
      ],
      correctAnswer: 0,
      explanation: 'dotenv is a popular npm package for managing environment variables from .env files.'
    }
  ],

  // Configuration Metadata
  metadata: {
    version: '1.0.0',
    createdAt: '2025-12-26T03:17:08Z',
    author: 'vcalibrator',
    lastModified: '2025-12-26T03:17:08Z',
    description: 'Core configuration for the Quiz application'
  },

  // Feature Flags
  features: {
    enableMysteryMode: true,
    enableSecretKeywords: true,
    enableAdaptiveDifficulty: false,
    enableAnalytics: true,
    enableNotifications: true
  },

  // Application Settings
  settings: {
    maxQuestionsPerQuiz: 10,
    timePerQuestion: 30, // seconds
    passingScore: 70, // percentage
    maxAttempts: 3,
    sessionTimeout: 3600 // seconds
  }
};
