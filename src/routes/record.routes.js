import { Router } from 'express';
import { 
  createRecord, 
  attachReport, 
  getRecord,
  getAllRecords,
  getRecordsByPatient,
  getRecordsByDoctor,
  getRecordsByHospital,
  updateRecord,
  deleteRecord
} from '../controllers/record.controller.js';

const r = Router();

// Create and update
r.post('/', createRecord);
r.post('/report', attachReport);
r.put('/:id', updateRecord);
r.delete('/:id', deleteRecord);

// Get endpoints
r.get('/', getAllRecords);
r.get('/:id', getRecord);
r.get('/patient/:patientId', getRecordsByPatient);
r.get('/doctor/:doctorId', getRecordsByDoctor);
r.get('/hospital/:hospitalId', getRecordsByHospital);

export default r;
