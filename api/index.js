
import app from '../index.js';


let isInitialized = false;

export default async function handler(req, res) {
  if (!isInitialized) {
    
    isInitialized = true;
  }
  app(req, res);
}