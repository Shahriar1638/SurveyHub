/**
 * Express middleware factory — validates req.body against a Zod schema.
 * Returns 400 with flattened errors on failure.
 */
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: result.error.flatten().fieldErrors,
      });
    }
    req.body = result.data; // use parsed (coerced/defaulted) values
    next();
  };
}

module.exports = validate;
