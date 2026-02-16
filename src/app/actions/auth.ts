'use server'

import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';

export async function login(prevState: any, formData: FormData) {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = await db.users.getByUsername(username);

    if (!user || user.password !== password) {
        return { message: 'Geçersiz kullanıcı adı veya şifre.' };
    }

    // Set session cookie
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    (await cookies()).set('session', JSON.stringify(user), { expires, httpOnly: true });

    // Redirect based on role
    if (user.role === 'admin') {
        redirect('/admin');
    } else if (user.role === 'branch_user') {
        redirect('/branch');
    } else if (user.role === 'italy_staff') {
        redirect('/italy');
    } else if (user.role === 'technical_support') {
        redirect('/technical');
    } else {
        redirect('/mentor');
    }
}

export async function logout() {
    (await cookies()).delete('session');
    redirect('/login');
}

export async function getSession() {
    const sessionCookie = (await cookies()).get('session');
    if (!sessionCookie) return null;
    try {
        return JSON.parse(sessionCookie.value);
    } catch {
        return null;
    }
}
