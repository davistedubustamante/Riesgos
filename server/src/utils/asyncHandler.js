// Wrapper para que los errores de los controladores lleguen al middleware de errores.
export function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
