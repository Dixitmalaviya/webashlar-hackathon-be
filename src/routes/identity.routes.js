import { Router } from 'express';
import { 
  registerPatient, 
  registerDoctor, 
  registerHospital,
  getPatient,
  getDoctor,
  getHospital,
  getAllPatients,
  getAllDoctors,
  getAllHospitals,
  getAllHospitalsAll
} from '../controllers/identity.controller.js';

const r = Router();

// Registration endpoints
r.post('/patient/register', registerPatient);
r.post('/doctor/register', registerDoctor);
r.post('/hospital/register', registerHospital);

// Get endpoints
r.get('/patient/:id', getPatient);
r.get('/doctor/:id', getDoctor);
r.get('/hospital/:id', getHospital);

// List endpoints
r.get('/patients', getAllPatients);
r.get('/doctors', getAllDoctors);
r.get('/hospitals', getAllHospitals);
r.get('/hospitals/options', getAllHospitalsAll);

export default r;
