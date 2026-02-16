'use client';

import { University } from '@/types';
import StudentForm from '../StudentForm';

interface NewStudentFormProps {
    universities: University[];
}

export default function NewStudentForm({ universities }: NewStudentFormProps) {
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Yeni Öğrenci Ekle</h1>
            <StudentForm universities={universities} />
        </div>
    );
}
