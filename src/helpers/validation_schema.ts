import Joi from 'joi'

export const authSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(2).required(),
})

export const signupSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(6).required(),
})

export const transferSchema = Joi.object({
  fromAccount: Joi.string().required(),
  toAccount: Joi.string().required(),
  amount: Joi.number().positive().required(),
})
export const accountSchema = Joi.object({
  accountNumber: Joi.string().required(),
  accountType: Joi.string().valid('savings', 'checking').required(),
  balance: Joi.number().min(0).required(),
})