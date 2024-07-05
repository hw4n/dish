import mongoose, { Document, Schema } from 'mongoose';

interface IWord extends Document {
    word: string;
}

const wordSchema = new Schema<IWord>({
    word: {
        type: String,
        required: true,
        unique: true
    }
});

const Word = mongoose.model<IWord>('Word', wordSchema);

export default Word;
