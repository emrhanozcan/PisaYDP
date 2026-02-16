-- Fix mentor_assignments foreign key constraint to allow branch students
-- Originally, mentor_assignments.student_id likely references students(id)

-- 1. Drop the existing foreign key constraint
ALTER TABLE mentor_assignments
DROP CONSTRAINT IF EXISTS mentor_assignments_student_id_fkey;

-- 2. (Optional) Add a check constraint or just rely on application logic if we support multiple tables (students and branch_students)
-- Since we have two tables for students, a simple foreign key won't work unless we use a polymorphic relationship or a common parent table.
-- For now, removing the constraint allows the application to manage the relationship.

-- 3. Ensure mentor_id is still valid (referencing users)
-- (Assuming this constraint exists and is correct)
-- ALTER TABLE mentor_assignments
-- ADD CONSTRAINT mentor_assignments_mentor_id_fkey FOREIGN KEY (mentor_id) REFERENCES users(id);
