-- Bir hizmet tipi aynı öğrenci için yalnızca bir kez kaydedilebilir.
-- Mentor kimliği özellikle kontrole dahil edilmez; kural tüm mentorlar için ortaktır.
--
-- Geçmişte oluşmuş mükerrer kayıtlar finansal/hizmet geçmişini korumak için silinmez.
-- Bu migration yalnızca bundan sonraki mükerrer INSERT işlemlerini engeller.

-- Tetikleyicinin kontrol sorgusunu hızlandırır. Bu normal (unique olmayan) bir indekstir;
-- dolayısıyla mevcut mükerrer kayıtlar migration'ın çalışmasını engellemez.
CREATE INDEX IF NOT EXISTS service_logs_student_service_type_idx
    ON public.service_logs (student_id, service_type_id);

CREATE OR REPLACE FUNCTION public.prevent_duplicate_student_service_log()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Aynı öğrenci-hizmet çifti için eşzamanlı iki isteği sıraya alır.
    PERFORM pg_advisory_xact_lock(
        hashtextextended(
            COALESCE(NEW.student_id::text, '') || ':' || COALESCE(NEW.service_type_id::text, ''),
            0
        )
    );

    IF EXISTS (
        SELECT 1
        FROM public.service_logs
        WHERE student_id = NEW.student_id
          AND service_type_id = NEW.service_type_id
    ) THEN
        RAISE EXCEPTION
            'Bu hizmet öğrenciye daha önce eklenmiş. Aynı hizmet tekrar eklenemez.'
            USING
                ERRCODE = '23505',
                CONSTRAINT = 'service_logs_student_service_type_unique';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_duplicate_student_service_log
    ON public.service_logs;

CREATE TRIGGER prevent_duplicate_student_service_log
    BEFORE INSERT ON public.service_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_duplicate_student_service_log();

-- İstenirse geçmiş mükerrerleri yalnızca görüntülemek için:
-- SELECT student_id, service_type_id, COUNT(*) AS kayit_sayisi
-- FROM public.service_logs
-- GROUP BY student_id, service_type_id
-- HAVING COUNT(*) > 1
-- ORDER BY kayit_sayisi DESC, student_id, service_type_id;
