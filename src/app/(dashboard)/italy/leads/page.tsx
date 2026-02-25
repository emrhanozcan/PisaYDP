import { db } from '@/lib/db';
import LeadsClient from './LeadsClient';

export default async function LeadsPage() {
    // Fetch leads data from the database
    // Note: If the table doesn't exist yet, this might error. 
    // We handle it gracefully or let Next.js show an error boundary.
    let leads = [];
    try {
        leads = await db.leads.getAll();
    } catch (error) {
        console.error('Failed to fetch leads:', error);
        // Fallback to empty array if table doesn't exist or other error
    }

    return (
        <LeadsClient initialLeads={leads} />
    );
}
