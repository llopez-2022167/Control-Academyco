'use strict';

import User from './user.model.js';
import { encrypt, checkPassword } from '../utils/validator.js'
import { generateJwt } from '../utils/jwt.js'

export const register = async (req, res) => {
    try {
        // Capturar los datos del formulario
        let data = req.body;

        // Verificar si el nombre de usuario ya existe
        let existingUser = await User.findOne({ username: data.username }).populate('courses', ['name']);
        if (existingUser) {
            return res.status(400).send({ message: 'El nombre de usuario ya está en uso' });
        }

        // Encriptar la contraseña
        data.password = await encrypt(data.password);

        // Asignar el rol por defecto
        if (!data.role) {
            data.role = 'STUDENT_ROLE';
        }

        // Guardar la información en la base de datos
        let user = new User(data);
        await user.save();

        // Responder al usuario
        return res.send({ message: `Registrado correctamente, puede iniciar sesión con el nombre de usuario ${user.username}` });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error al registrar usuario', err });
    }
};


export const login = async (req, res) => {
    try {
        let { username, password } = req.body;
        let user = await User.findOne({ username });
        if (user && await checkPassword(password, user.password)) {
            let loggedUser = {
                uid: user._id,
                username: user.username,
                name: user.name,
                role: user.role
            }
            //generar el token
            let token = await generateJwt(loggedUser)
            //responde al usuario
            return res.send({
                message: `Welcome ${loggedUser.username}`,
                loggedUser,
                token
            })
        }
        return res.status(404).send({ message: 'Invalid credentials' })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error to login' })
    }
}

export const assignCourse = async (req, res) => {
    try {
        let { id } = req.params;
        let { courseId } = req.body;

        // Verificar si el usuario es un estudiante
        let user = await User.findById(id);
        if (!user || user.role !== 'STUDENT_ROLE') {
            return res.send({ message: 'No autorizado para asignar cursos' });
        }

        // Verificar si el usuario ya está inscrito en el curso
        if (user.courses.includes(courseId)) {
            return res.send({ message: 'El usuario ya está inscrito en este curso' });
        }

        // Verificar si el usuario ha alcanzado el límite de cursos
        if (user.courses.length >= 3) {
            return res.send({ message: 'El usuario ha alcanzado el límite máximo de cursos' });
        }

        // Asignar el curso al usuario
        user.courses.push(courseId);
        await user.save();

        return res.status(200).send({ message: 'Curso asignado correctamente' });
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error al asignar cursos' })
    }
}

export const getCourses = async (req, res) => {
    try {
        // Verificar si el usuario existe
        let { id } = req.params
        let user = await User.findById(id).populate('courses', ['name']);
        if (!user) {
            return res.status(404).send({ message: 'Usuario no encontrado' });
        }

        // Verificar si el usuario tiene cursos asignados
        if (!user.courses || user.courses.length === 0) {
            return res.send({ message: 'El usuario no tiene cursos asignados', courses: [] });
        }

        // Retornar los cursos asignados al usuario
        return res.send({ message: 'Lista de cursos asignados al usuario', courses: user.courses });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error al obtener los cursos del usuario', err });
    }
};



// Editar perfil de usuario
export const editProfile = async (req, res) => {
    try {
        let { id } = req.params;
        let { username, password } = req.body;
        let user = await User.findById(id);
        if (!user) {
            return res.send({ message: 'Usuario no encontrado' });
        }
        if (username) {
            user.username = username;
        }
        if (password) {
            user.password = password;
        }
        await user.save();
        return res.send({ message: 'Profile updated successfully', user });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error updating profile', err });
    }
}

// Eliminar perfil de usuario
export const deleteProfile = async (req, res) => {
    try {
        let { id } = req.params;
        let user = await User.findByIdAndDelete(id);
        if (user.deleteCount === 0) return res.status(404).send({ message: 'Profile not found' })
        return res.send({ message: 'Profile deleted successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error deleting profile', err });
    }
}