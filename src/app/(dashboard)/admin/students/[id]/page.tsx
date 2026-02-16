import { getStudentFullDetails } from "@/app/actions/student-details";
import Link from "next/link";
import {
    ArrowLeft, User
} from "lucide-react";
import StudentDetailView from "@/components/admin/StudentDetailView";

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const details = await getStudentFullDetails(id);

    if (!details) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '50vh',
                color: '#9ca3af'
            }}>
                <User size={64} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                <h2 style={{ fontSize: '1.5rem', color: '#374151', marginBottom: '0.5rem' }}>Öğrenci Bulunamadı</h2>
                <p style={{ marginBottom: '1.5rem' }}>Bu ID ile eşleşen öğrenci kaydı mevcut değil.</p>
                <Link href="/admin/students" className="btn btn-primary">
                    <ArrowLeft size={16} /> Listeye Dön
                </Link>
            </div>
        );
    }

    const { student, assignments, serviceLogs, mentors, serviceTypes, totalSpent, stats } = details;

    return (
        <StudentDetailView
            student={student}
            assignments={assignments}
            serviceLogs={serviceLogs}
            mentors={mentors}
            serviceTypes={serviceTypes}
            totalSpent={totalSpent}
            stats={stats}
        />
    );
}
