import { Schema, model } from 'mongoose';

const courseSchema = Schema({
    name: {
        type: String,
        required: true
    },
    teacher: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    students: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    }
}, {
    versionKey: false
});

export default model('course', courseSchema);
