const Joi = require('joi');
const { LANGUAGES, LIMITS } = require('../config/constants');
const logger = require('../utils/logger');

const executeValidator = (req, res, next) => {
  const schema = Joi.object({
    code: Joi.string()
      .max(LIMITS.MAX_CODE_SIZE)
      .required()
      .messages({
        'string.max': `Code must be at most ${LIMITS.MAX_CODE_SIZE} characters long`,
        'any.required': 'Code is required',
      }),
    language: Joi.string()
      .valid(...LANGUAGES)
      .required()
      .messages({
        'any.only': `Language must be one of [${LANGUAGES.join(', ')}]`,
        'any.required': 'Language is required',
      }),
    stdin: Joi.string()
      .max(LIMITS.MAX_STDIN_SIZE)
      .optional()
      .allow('')
      .messages({
        'string.max': `Stdin must be at most ${LIMITS.MAX_STDIN_SIZE} characters long`,
      }),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    logger.warn(`Validation error: ${error.details[0].message}`);
    return res.status(400).json({
      error: error.details[0].message,
    });
  }

  next();
};

module.exports = {
  executeValidator,
};
