/**
 * Response serializer to guarantee backward compatibility with the frontend.
 * Ensures that any object with an `id` property also exposes `_id`.
 */
const serializeWithId = (data) => {
  if (data === null || data === undefined) return data;
  if (Array.isArray(data)) {
    return data.map(serializeWithId);
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const copy = { ...data };
    if (copy.id && copy._id === undefined) {
      copy._id = copy.id;
    }
    for (const key of Object.keys(copy)) {
      if (typeof copy[key] === 'object' && copy[key] !== null) {
        copy[key] = serializeWithId(copy[key]);
      }
    }
    return copy;
  }
  return data;
};

module.exports = serializeWithId;
