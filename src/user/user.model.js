import { Schema, model } from 'mongoose';

const userSchema = Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minLenght: [8, 'Password must be 8 characters']
    },
    role: {
        type: String,
        uppercase: true,
        enum: ['TEACHER_ROLE','STUDENT_ROLE'],
        required: true
    },
    courses: {
        type: Schema.Types.ObjectId,
        ref: 'course'
    }
}, {
    versionKey: false
})

export default model('user', userSchema);
