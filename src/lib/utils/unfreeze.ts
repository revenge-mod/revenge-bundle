// https://stackoverflow.com/a/68339174

export default function unfreeze(obj: object) {
  if (Object.isFrozen(obj)) return Object.assign({}, obj);
  return obj;
}
