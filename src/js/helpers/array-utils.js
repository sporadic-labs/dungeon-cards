export function arrayEqual(array1, array2) {
  return array1.length === array2.length && array1.every((elem, index) => elem === array2[index]);
}
