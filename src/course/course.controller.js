'use strict';

import User from '../user/user.model.js';
import Course from './course.model.js';

export const createCourse = async (req, res) => {
    try {
        // Capturar los datos del formulario
        let data = req.body;

        // Verificar si el profesor asignado existe y tiene el rol correcto
        const teacher = await User.findOne({ _id: data.teacher }).populate('user', ['username']);
        if (!teacher || teacher.role !== 'TEACHER_ROLE') {
            return res.status(404).send({ message: 'Profesor no encontrado o rol inválido' });
        }

        // Crear el curso
        const course = new Course(data);
        await course.save();

        // Responder al usuario
        return res.send({ message: 'Curso creado correctamente', course });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error al crear el curso', err });
    }
};



export const editCourse = async (req, res) => {
    try {
        let { courseId } = req.params;
        let { name } = req.body;
        let course = await Course.findById(courseId);
        if (!course) {
            return res.send({ message: 'Curso no encontrado' });
        }
        // Si el curso tiene alumnos asignados, actualizar también el curso en los alumnos
        if (course.students.length > 0) {
            await User.updateMany(
                { _id: { $in: course.students } },
                { $set: { 'courses.$[elem].name': name } },
                { arrayFilters: [{ 'elem._id': course._id }], multi: true }
            );
        }

        course.name = name;
        await course.save();

        return res.status(200).send({ message: 'Curso actualizado correctamente', course });
    } catch (err) {
        return res.status(400).send({ message: 'Error updating course' });
    }
}

export const deleteCourse = async (req, res) => {
    try {
        let { courseId } = req.params;
        let course = await Course.findById(courseId);
        if (!course) {
            return res.send({ message: 'Curso no encontrado' });
        }
        // Si el curso tiene alumnos asignados, desasignar automáticamente el curso
        if (course.students.length > 0) {
            await User.updateMany(
                { _id: { $in: course.students } },
                { $pull: { course: course._id } },
                { multi: true }
            );
        }

        await course.remove();

        return res.status(200).send({ message: 'Curso eliminado correctamente' });
    } catch (err) {
        return res.status(400).send({ message: 'Course not deleted', err });
    }
}

export const getCourseStudents = async (req, res) => {
    try {
        let { courseId } = req.params;

        let course = await Course.findById(courseId).populate('students', 'username');
        if (!course) {
            return res.send({ message: 'Curso no encontrado' });
        }
        return res.status(200).send({ message: 'This is the list of courses' });
    } catch (err) {
        return res.status(400).send(err);
    }
}
