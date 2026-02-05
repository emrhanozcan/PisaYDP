
import { db } from "@/lib/db";
import PayoutsClient from "./PayoutsClient";

export default function PayoutsPage() {
    const mentors = db.users.getAll().filter(u => u.role === 'mentor');
    const logs = db.logs.getAll().filter(l => l.status === 'submitted' || l.status === 'approved');
    const serviceTypes = db.serviceTypes.getAll();

    // Calculate earnings per mentor
    const data = mentors.map(mentor => {
        const mentorLogs = logs.filter(l => l.mentorId === mentor.id);

        let totalAmount = 0;
        const breakdown: Record<string, number> = {};

        mentorLogs.forEach(log => {
            const service = serviceTypes.find(t => t.id === log.serviceTypeId);
            if (service) {
                let amount = 0;
                if (service.pricingModel === 'fixed') {
                    amount = service.unitPrice;
                } else if (service.pricingModel === 'hourly') {
                    amount = (log.durationMinutes / 60) * service.unitPrice;
                }
                totalAmount += amount;

                // Stats
                breakdown[service.name] = (breakdown[service.name] || 0) + 1;
            }
        });

        return {
            mentorId: mentor.id,
            mentorName: `${mentor.firstName} ${mentor.lastName}`,
            totalLogs: mentorLogs.length,
            totalAmount,
            breakdown
        };
    });

    return <PayoutsClient data={data} />;
}
