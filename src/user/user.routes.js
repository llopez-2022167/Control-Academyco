'use strict';

import { Router } from 'express';
import { assignCourse, deleteProfile, editProfile, getCourses, login, register } from './user.controller.js';

const api = Router()

// Rutas para registro y login
api.post('/register', register);
api.post('/login', login);

// Rutas protegidas por autenticación
api.post('/assignCourse:id', assignCourse);
api.post('/getCourses/:id', getCourses);
api.put('/editProfile/:id', editProfile);
api.delete('/deleteProfile/:id', deleteProfile);

export default api;
