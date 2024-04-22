export function generateRandomSixDigitNumber() {
  return String(Math.floor(Math.random() * 9000) + 1000);
}
