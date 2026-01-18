const Joi = require("joi");

const planSchemaValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().messages({
      "any.required": "Name is required",
    }),
    description: Joi.string().required().messages({
      "any.required": "Description is required",
    }),
    price: Joi.number().required().messages({
      "any.required": "Price is required",
    }),
    features: Joi.array().items(Joi.string()).required().messages({
      "any.required": "Features are required",
    }),
  });
  return schema.validate(data);
};

module.exports = { planSchemaValidation };
