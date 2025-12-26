/**
 * Quiz Application - Core Application Logic
 * Includes encryption algorithms, key validation, and quiz functionality
 * Author: vcalibrator
 * Date: 2025-12-26
 */

const crypto = require('crypto');

// ============================================================================
// ENCRYPTION UTILITIES
// ============================================================================

/**
 * Encryption configuration
 */
const ENCRYPTION_CONFIG = {
  algorithm: 'aes-256-cbc',
  keyLength: 32, // 256 bits
  ivLength: 16,  // 128 bits
};

/**
 * Generate a random encryption key
 * @returns {Buffer} Encryption key
 */
function generateEncryptionKey() {
  return crypto.randomBytes(ENCRYPTION_CONFIG.keyLength);
}

/**
 * Encrypt data using AES-256-CBC
 * @param {string} plaintext - Data to encrypt
 * @param {Buffer} key - Encryption key
 * @returns {object} Object containing encrypted data and IV
 */
function encrypt(plaintext, key) {
  if (!Buffer.isBuffer(key) || key.length !== ENCRYPTION_CONFIG.keyLength) {
    throw new Error(`Invalid key: must be a ${ENCRYPTION_CONFIG.keyLength}-byte Buffer`);
  }

  const iv = crypto.randomBytes(ENCRYPTION_CONFIG.ivLength);
  const cipher = crypto.createCipheriv(ENCRYPTION_CONFIG.algorithm, key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted,
  };
}

/**
 * Decrypt data using AES-256-CBC
 * @param {string} encryptedData - Encrypted data (hex string)
 * @param {Buffer} key - Encryption key
 * @param {string} iv - Initialization vector (hex string)
 * @returns {string} Decrypted plaintext
 */
function decrypt(encryptedData, key, iv) {
  if (!Buffer.isBuffer(key) || key.length !== ENCRYPTION_CONFIG.keyLength) {
    throw new Error(`Invalid key: must be a ${ENCRYPTION_CONFIG.keyLength}-byte Buffer`);
  }

  const decipher = crypto.createDecipheriv(
    ENCRYPTION_CONFIG.algorithm,
    key,
    Buffer.from(iv, 'hex')
  );

  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Generate HMAC for data integrity verification
 * @param {string} data - Data to hash
 * @param {Buffer} key - Secret key
 * @returns {string} HMAC (hex string)
 */
function generateHMAC(data, key) {
  return crypto.createHmac('sha256', key).update(data).digest('hex');
}

/**
 * Verify HMAC for data integrity
 * @param {string} data - Original data
 * @param {string} hmac - HMAC to verify
 * @param {Buffer} key - Secret key
 * @returns {boolean} True if HMAC is valid
 */
function verifyHMAC(data, hmac, key) {
  const computedHmac = generateHMAC(data, key);
  return crypto.timingSafeEqual(Buffer.from(computedHmac), Buffer.from(hmac));
}

// ============================================================================
// KEY VALIDATION
// ============================================================================

/**
 * Quiz access key configuration
 */
const KEY_CONFIG = {
  minLength: 8,
  maxLength: 128,
  allowedCharacters: /^[a-zA-Z0-9\-_]+$/,
};

/**
 * Validate quiz access key format
 * @param {string} key - Key to validate
 * @returns {object} Validation result with isValid and errors array
 */
function validateQuizKey(key) {
  const errors = [];

  if (typeof key !== 'string') {
    errors.push('Key must be a string');
    return { isValid: false, errors };
  }

  if (key.length < KEY_CONFIG.minLength) {
    errors.push(`Key must be at least ${KEY_CONFIG.minLength} characters long`);
  }

  if (key.length > KEY_CONFIG.maxLength) {
    errors.push(`Key must not exceed ${KEY_CONFIG.maxLength} characters`);
  }

  if (!KEY_CONFIG.allowedCharacters.test(key)) {
    errors.push('Key contains invalid characters. Only alphanumeric characters, hyphens, and underscores are allowed');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generate a secure quiz key
 * @param {number} length - Length of the key (default: 16)
 * @returns {string} Generated quiz key
 */
function generateQuizKey(length = 16) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let key = '';
  const randomBytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    key += characters[randomBytes[i] % characters.length];
  }

  return key;
}

/**
 * Hash a quiz key using SHA-256
 * @param {string} key - Quiz key to hash
 * @returns {string} Hashed key (hex string)
 */
function hashQuizKey(key) {
  return crypto.createHash('sha256').update(key).digest('hex');
}

// ============================================================================
// QUIZ FUNCTIONALITY
// ============================================================================

/**
 * Quiz Question structure
 */
class Question {
  constructor(id, text, options, correctAnswerIndex, points = 1) {
    this.id = id;
    this.text = text;
    this.options = options;
    this.correctAnswerIndex = correctAnswerIndex;
    this.points = points;
  }

  /**
   * Check if the provided answer is correct
   * @param {number} answerIndex - Index of the selected answer
   * @returns {boolean} True if answer is correct
   */
  isCorrect(answerIndex) {
    return answerIndex === this.correctAnswerIndex;
  }

  /**
   * Get the correct answer text
   * @returns {string} Correct answer
   */
  getCorrectAnswer() {
    return this.options[this.correctAnswerIndex];
  }
}

/**
 * Quiz class managing quiz state and scoring
 */
class Quiz {
  constructor(id, title, description = '', key = null) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.key = key || generateQuizKey();
    this.questions = [];
    this.userAnswers = [];
    this.startTime = null;
    this.endTime = null;
  }

  /**
   * Add a question to the quiz
   * @param {Question} question - Question to add
   */
  addQuestion(question) {
    if (!(question instanceof Question)) {
      throw new Error('Invalid question object');
    }
    this.questions.push(question);
  }

  /**
   * Start the quiz timer
   */
  start() {
    this.startTime = new Date();
    this.userAnswers = [];
  }

  /**
   * Submit an answer for a question
   * @param {number} questionIndex - Index of the question
   * @param {number} answerIndex - Index of the selected answer
   * @returns {boolean} True if answer was recorded successfully
   */
  submitAnswer(questionIndex, answerIndex) {
    if (questionIndex < 0 || questionIndex >= this.questions.length) {
      throw new Error('Invalid question index');
    }

    const question = this.questions[questionIndex];
    if (answerIndex < 0 || answerIndex >= question.options.length) {
      throw new Error('Invalid answer index');
    }

    this.userAnswers[questionIndex] = {
      questionId: question.id,
      answerIndex,
      isCorrect: question.isCorrect(answerIndex),
      points: question.isCorrect(answerIndex) ? question.points : 0,
      timestamp: new Date(),
    };

    return true;
  }

  /**
   * End the quiz and calculate results
   * @returns {object} Quiz results
   */
  finish() {
    this.endTime = new Date();
    return this.getResults();
  }

  /**
   * Get quiz results
   * @returns {object} Results including score, percentage, and detailed answers
   */
  getResults() {
    if (!this.startTime || this.userAnswers.length === 0) {
      return {
        totalQuestions: this.questions.length,
        answeredQuestions: this.userAnswers.length,
        correctAnswers: 0,
        score: 0,
        maxScore: this.getTotalPoints(),
        percentage: 0,
        duration: null,
        details: [],
      };
    }

    const correctAnswers = this.userAnswers.filter(a => a.isCorrect).length;
    const score = this.userAnswers.reduce((sum, a) => sum + a.points, 0);
    const maxScore = this.getTotalPoints();
    const percentage = (score / maxScore) * 100;
    const duration = this.endTime ? this.endTime - this.startTime : new Date() - this.startTime;

    const details = this.userAnswers.map((answer, index) => ({
      questionIndex: index,
      questionText: this.questions[index].text,
      selectedAnswer: this.questions[index].options[answer.answerIndex],
      correctAnswer: this.questions[index].getCorrectAnswer(),
      isCorrect: answer.isCorrect,
      pointsEarned: answer.points,
      maxPoints: this.questions[index].points,
    }));

    return {
      totalQuestions: this.questions.length,
      answeredQuestions: this.userAnswers.length,
      correctAnswers,
      score,
      maxScore,
      percentage: Math.round(percentage * 100) / 100,
      duration,
      details,
    };
  }

  /**
   * Get total possible points for the quiz
   * @returns {number} Total points
   */
  getTotalPoints() {
    return this.questions.reduce((sum, q) => sum + q.points, 0);
  }

  /**
   * Get quiz progress
   * @returns {object} Progress information
   */
  getProgress() {
    return {
      totalQuestions: this.questions.length,
      answeredQuestions: this.userAnswers.length,
      percentComplete: (this.userAnswers.length / this.questions.length) * 100,
      currentScore: this.userAnswers.reduce((sum, a) => sum + a.points, 0),
      maxPossibleScore: this.getTotalPoints(),
    };
  }

  /**
   * Reset quiz state
   */
  reset() {
    this.userAnswers = [];
    this.startTime = null;
    this.endTime = null;
  }

  /**
   * Validate quiz key
   * @param {string} providedKey - Key to validate
   * @returns {boolean} True if key matches
   */
  validateKey(providedKey) {
    return crypto.timingSafeEqual(Buffer.from(this.key), Buffer.from(providedKey));
  }
}

// ============================================================================
// QUIZ MANAGER
// ============================================================================

/**
 * QuizManager class for managing multiple quizzes
 */
class QuizManager {
  constructor() {
    this.quizzes = new Map();
  }

  /**
   * Create a new quiz
   * @param {string} id - Quiz ID
   * @param {string} title - Quiz title
   * @param {string} description - Quiz description
   * @returns {Quiz} Created quiz
   */
  createQuiz(id, title, description = '') {
    if (this.quizzes.has(id)) {
      throw new Error(`Quiz with ID '${id}' already exists`);
    }

    const quiz = new Quiz(id, title, description);
    this.quizzes.set(id, quiz);
    return quiz;
  }

  /**
   * Get a quiz by ID
   * @param {string} id - Quiz ID
   * @returns {Quiz} Quiz object
   */
  getQuiz(id) {
    if (!this.quizzes.has(id)) {
      throw new Error(`Quiz with ID '${id}' not found`);
    }
    return this.quizzes.get(id);
  }

  /**
   * Delete a quiz
   * @param {string} id - Quiz ID
   * @returns {boolean} True if quiz was deleted
   */
  deleteQuiz(id) {
    return this.quizzes.delete(id);
  }

  /**
   * List all quizzes
   * @returns {array} Array of quiz objects
   */
  listQuizzes() {
    return Array.from(this.quizzes.values());
  }

  /**
   * Get quiz count
   * @returns {number} Number of quizzes
   */
  getQuizCount() {
    return this.quizzes.size;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Encryption functions
  generateEncryptionKey,
  encrypt,
  decrypt,
  generateHMAC,
  verifyHMAC,
  ENCRYPTION_CONFIG,

  // Key validation functions
  validateQuizKey,
  generateQuizKey,
  hashQuizKey,
  KEY_CONFIG,

  // Quiz classes
  Question,
  Quiz,
  QuizManager,
};
