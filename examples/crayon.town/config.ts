export const wsUrl = import.meta.env.DEV ? 'http://localhost:8087' : 'http://ws.crayon.town';

export const imgUrl = import.meta.env.DEV
  ? 'https://storage.googleapis.com/sketch-paper-public'
  : 'https://storage.googleapis.com/crayontown';
