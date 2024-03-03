'use strict';

import { Router } from 'express';
import { createCourse, deleteCourse, editCourse, getCourseStudents } from './course.controller.js';

const api = Router()

// Rutas para cursos
api.post('/createCourse', createCourse);
api.put('/editCourse/:courseId', editCourse);
api.delete('/deleteCourse/:courseId', deleteCourse);
api.get('/getCourseStudents/:courseId/students', getCourseStudents);

export default api;
