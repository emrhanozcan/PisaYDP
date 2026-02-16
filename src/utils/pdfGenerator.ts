import jsPDF from 'jspdf';

// Font loading helper
const loadFont = async (doc: jsPDF) => {
    try {
        const fontUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf';
        const fontResponse = await fetch(fontUrl);
        const fontBuffer = await fontResponse.arrayBuffer();
        const fontUint8 = new Uint8Array(fontBuffer);

        // Convert to binary string
        let binaryString = '';
        for (let i = 0; i < fontUint8.length; i++) {
            binaryString += String.fromCharCode(fontUint8[i]);
        }

        // Add font to VFS
        doc.addFileToVFS('Roboto-Regular.ttf', btoa(binaryString));
        doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
        doc.setFont('Roboto');
    } catch (error) {
        console.error('Font loading failed, falling back to standard font', error);
        doc.setFont('helvetica');
    }
};

interface PdfData {
    title: string;
    student: any;
    type: 'general' | 'scholarship' | 'accommodation' | 'residence' | 'guardian' | 'life-support' | 'universities';
}

export const generatePDF = async ({ title, student, type }: PdfData) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    // Load custom font for Turkish support
    await loadFont(doc);

    // --- HELPER FUNCTIONS ---
    let yPos = 20;
    const leftMargin = 20;
    const lineHeight = 7;
    const pageWidth = doc.internal.pageSize.getWidth();

    const addTitle = (text: string) => {
        doc.setFontSize(18);
        doc.setTextColor(26, 26, 46); // #1a1a2e
        doc.text(text, leftMargin, yPos);
        yPos += 10;

        // Divider
        doc.setDrawColor(200, 200, 200);
        doc.line(leftMargin, yPos, pageWidth - leftMargin, yPos);
        yPos += 10;
    };

    const addSectionTitle = (text: string) => {
        yPos += 5;
        doc.setFontSize(12);
        doc.setTextColor(108, 92, 231); // #6C5CE7
        doc.text(text, leftMargin, yPos);
        yPos += 8;
        doc.setTextColor(0, 0, 0); // Reset
        doc.setFontSize(10);
    };

    const addField = (label: string, value: any, extraInfo?: string) => {
        if (!value && value !== 0) value = '-';
        if (typeof value === 'boolean') value = value ? 'Evet' : 'Hayır';

        // Append extra info if exists (e.g. status for documents)
        const displayValue = extraInfo ? `${String(value)} (${extraInfo})` : String(value);

        doc.setFont('Roboto', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`${label}:`, leftMargin, yPos);

        doc.setTextColor(0, 0, 0);
        // Align value at 60mm
        doc.text(displayValue, leftMargin + 40, yPos);

        yPos += lineHeight;
        checkPageBreak();
    };

    const checkPageBreak = () => {
        if (yPos > 270) {
            doc.addPage();
            yPos = 20;
        }
    };

    const addEducationInfo = () => {
        addSectionTitle('Eğitim Bilgileri');
        if (student.educations && student.educations.length > 0) {
            student.educations.forEach((edu: any, index: number) => {
                if (index > 0) {
                    yPos += 2;
                    doc.setDrawColor(240, 240, 240);
                    doc.line(leftMargin, yPos, pageWidth - leftMargin, yPos);
                    yPos += 4;
                }

                // Try to find University Name if available in the context, otherwise show ID
                // Note: In a real scenario, we might want to pass university list or name maps.
                // For now, we rely on what's passed in the student object.

                addField(`Üniversite (${index + 1})`, edu.universityName || edu.universityId);
                addField('Bölüm', edu.department);
                addField('Program', edu.program);
                addField('Sınıf', edu.grade);
            });
        } else {
            // Fallback for students without education array (legacy or empty)
            addField('Program', student.program);
            addField('Sınıf', student.grade);
            addField('Bölüm', student.department);
        }
    };

    const addParentInfo = () => {
        addSectionTitle('Veli Bilgileri');
        addField('Veli Adı', student.parentName);
        addField('Veli Telefon', student.parentPhone);
        addField('Veli Email', student.parentEmail);
    };

    // --- CONTENT GENERATION ---

    // 1. Header & Basic Info (Always present)
    addTitle(title);

    addSectionTitle('Öğrenci Bilgileri');
    addField('Ad Soyad', `${student.firstName} ${student.lastName}`);
    addField('Pasaport No', student.passportNo);
    addField('Email', student.email);
    addField('Telefon', student.phone);
    if (student.branchName) addField('Şube', student.branchName);

    // 2. Specific Module Content
    if (type === 'scholarship') {
        addSectionTitle('Burs Başvuru Takibi');
        addField('Okul Ücreti', student.scholarshipTracking?.applicationTuitionFee);
        addField('Okul Ücreti Durumu', student.scholarshipTracking?.applicationTuitionFeeStatus);
        addField('ISEE Durumu', student.scholarshipTracking?.applicationIseeStatus);
        addField('Yurt Durumu', student.scholarshipTracking?.applicationDormStatus);
        addField('Burs Durumu', student.scholarshipTracking?.applicationScholarshipStatus);

        addSectionTitle('Evraklar');
        addField('Anket', student.scholarshipTracking?.documentsSurvey, student.scholarshipTracking?.documentsSurveyStatus);
        addField('Türkçe Evraklar', student.scholarshipTracking?.documentsTurkish, student.scholarshipTracking?.documentsTurkishStatus);
        addField('İtalyanca Çeviriler', student.scholarshipTracking?.documentsItalian, student.scholarshipTracking?.documentsItalianStatus);

        addSectionTitle('Sonuçlar');
        addField('Sıralama', student.scholarshipTracking?.resultRanking);
        addField('Sonuç', student.scholarshipTracking?.resultStatus);
        addField('Bloke Hesap', student.scholarshipTracking?.resultBlockAccount);
        addField('Kira Kontratı', student.scholarshipTracking?.resultItalyLease);
        addField('IBAN', student.scholarshipTracking?.resultIban);
        addField('Sonuç Notları', student.scholarshipTracking?.resultNotes);

        addParentInfo();
    }

    if (type === 'accommodation') {
        addSectionTitle('Konaklama Bilgileri');
        addField('Şehir', student.accommodationCity);
        addField('Tip', student.accommodationType);
        addField('Adres', student.accommodationAddress);
        addField('Aylık Kira', student.accommodationMonthlyRent);
        addField('Fark Ödemesi', student.accommodationDiffPayment);
        addField('Ödeme Durumu', student.accommodationPaymentStatus);
        addField('Kontrat/Yerleşim Durumu', student.accommodationStatus);
        addField('Giriş Tarihi', student.accommodationDate);

        addParentInfo();
    }

    if (type === 'residence') {
        addSectionTitle('Oturum İzni (Permesso di Soggiorno)');
        addField('Randevu Tarihi', student.residencePermitAppointmentDate);
        addField('Randevu Yeri', student.residencePermitPlace);
        addField('Randevu Saati', student.residencePermitTime);
        addField('Dosya Sorumlusu', student.residencePermitHandler);
        addField('Geliş Tarihi', student.residencePermitArrivalDate);
        addField('Durum', student.residencePermitStatus);

        addSectionTitle('Codice Fiscale');
        addField('Randevu Tarihi', student.codiceFiscaleAppointmentDate);
        addField('Durum', student.codiceFiscaleStatus);

        addParentInfo();
    }

    if (type === 'guardian') {
        addSectionTitle('Vasi Hizmeti');
        addField('İşlemi Yapan', student.guardianOperator);
        addField('Geliş Tarihi', student.guardianArrivalDate);
        addField('Şehir', student.guardianCity);
        addField('Buluşma Yeri', student.guardianLocation);
        addField('Buluşma Saati', student.guardianTime);
        addField('Durum', student.guardianStatus);

        addEducationInfo();
        addParentInfo();
    }

    if (type === 'life-support') {
        addSectionTitle('Eğitim Bilgileri');
        if (student.educations && student.educations.length > 0) {
            student.educations.forEach((edu: any, index: number) => {
                if (index > 0) yPos += 2;
                addField(`Program ${index + 1}`, edu.program);
                // We assume universityID is passed, ideally we'd map it but for now:
                addField('Üniversite', edu.universityId);
                addField('Bölüm', edu.department);
                addField('Sınıf', edu.grade);
            });
        }

        addSectionTitle('Geliş Ayrıntıları');
        addField('Şehir', student.arrivalCity);
        addField('Ödeme Durumu', student.arrivalPaymentStatus);
        addField('İşlemi Yapan', student.arrivalOperator);
        addField('Geliş Tarihi', student.arrivalDate);
        addField('Havalimanı', student.arrivalAirport);
        addField('Uçuş Saati', student.arrivalTime);

        addSectionTitle('Yaşam Destek Paketi (YDP)');
        addField('Karşılama', student.ydtWelcomeDate, student.ydtWelcomeStatus);
        addField('Okul Kayıt İşlemleri', student.ydtSchoolRegDate, student.ydtSchoolRegStatus);
        addField('Oturum İzni', student.ydtResPermitDate, student.ydtResPermitStatus);
        addField('Ulaşım Kartı / SİM', student.ydtSimDate, student.ydtSimStatus);
        addField('Banka Hesabı', student.ydtBankDate, student.ydtBankStatus);

        addSectionTitle('Codice Fiscale');
        addField('İşlemi Yapan', student.codiceFiscaleHandler);
        addField('Geliş Tarihi', student.codiceFiscaleArrivalDate);
        addField('Randevu Tarihi', student.codiceFiscaleAppointmentDate);
        addField('Yeri', student.codiceFiscalePlace);
        addField('Saati', student.codiceFiscaleTime);
        addField('Durumu', student.codiceFiscaleStatus);

        addSectionTitle('Danışman');
        addField('Adı Soyadı', student.consultantName);
        addField('İletişim', student.consultantContact);
    }

    if (type === 'general' || type === 'universities') {
        addEducationInfo();

        addParentInfo();

        addSectionTitle('Mali Bilgiler');
        addField('IBAN', student.iban);
        addField('Sıralama', student.examResult);
        addField('Bloke', student.visaResult);
        addField('Kira Kontratı', student.selectionResult);
        addField('Ödeme', student.paymentStatus);
        addField('Ücret', student.fee);

        addSectionTitle('Hizmet & Sonuç');
        addField('Sonuç', student.finalStatus);
        addField('Danışmanlık', student.supportPackage);
        addField('Konaklama', student.accommodationService);
        addField('Burs Paketi', student.scholarshipPackage);
        addField('YDP', student.ydtSupport);

        if (student.description || student.notes) {
            addSectionTitle('Açıklama / Notlar');
            if (student.description) addField('Açıklama', student.description);
            if (student.notes) addField('Notlar', student.notes);
        }
    }

    // Common Footer
    yPos = 280;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Oluşturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, leftMargin, yPos);
    doc.text('PisaYDP Öğrenci Takip Sistemi', pageWidth - leftMargin - 40, yPos);

    doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
};
