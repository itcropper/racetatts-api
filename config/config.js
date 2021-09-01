const { join } = require('bluebird');
const Joi = require('joi');

// require and configure dotenv, will load vars in .env in PROCESS.ENV
require('dotenv').config();

// define validation for all the env vars
const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string()
    .allow(['development', 'production', 'test', 'provision'])
    .default('development'),
  PORT: Joi.number()
    .default(3001),
  AWS_SECRET_ACCESS_KEY: Joi.string()
    .required(),
  AWS_SECRET_ACCESS_KEY: Joi.string()
    .required()
  // JWT_SECRET: Joi.string().required()
  //   .description('JWT Secret required to sign')
  //   .default('asdf23qweq23etager4ygasdr13'),
}).unknown()
  .required();

const { error, value: envVars } = Joi.validate(process.env, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  // jwtSecret: envVars.JWT_SECRET,
  AWS_SECRET_ACCESS_KEY: envVars.AWS_SECRET_ACCESS_KEY,
  AWS_SECRET_ACCESS_KEY: envVars.AWS_SECRET_ACCESS_KEY
};

module.exports = config;