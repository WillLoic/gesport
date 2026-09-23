import { AcademyStudent } from '../types';

const API_BASE_URL = 'http://localhost:8000/api/v1/sport/academy';

export interface BackendAcademyStudent {
  id: number;
  member: number | null;
  member_id?: number | null;
  member_detail?: {
    id: number;
    first_name: string;
    last_name: string;
    category?: string;
    date_of_birth?: string;
    phone?: string;
  } | null;
  school_name: string;
  grade_level: string;
  academic_gpa?: number;
  tutor_name?: string;
  tutor_phone?: string;
  observations?: string;
  created_at?: string;
}

export function mapBackendAcademyStudentToFrontend(b: BackendAcademyStudent): AcademyStudent {
  const memberName = b.member_detail
    ? `${b.member_detail.first_name} ${b.member_detail.last_name}`
    : 'Élève Académie';

  let age = 16;
  if (b.member_detail?.date_of_birth) {
    const birthYear = new Date(b.member_detail.date_of_birth).getFullYear();
    if (!isNaN(birthYear)) {
      age = new Date().getFullYear() - birthYear;
    }
  }

  const category = (b.member_detail?.category || 'U18 Espoirs') as any;

  return {
    id: String(b.id),
    memberId: b.member ? String(b.member) : (b.member_detail ? String(b.member_detail.id) : '1'),
    studentName: memberName,
    category,
    age,
    tutorCoachName: b.tutor_name || 'Non assigné',
    schoolGrade: `${b.grade_level}${b.school_name ? ` (${b.school_name})` : ''}`,
    schoolSupportNeeded: (b.academic_gpa !== undefined && b.academic_gpa < 10.0),
    progressScores: [
      {
        quarter: 'Trimestre en cours (Bilan Global)',
        technicalScore: Math.round(((b.academic_gpa || 14) / 20) * 20),
        tacticalScore: Math.round(((b.academic_gpa || 14) / 20) * 19),
        athleticScore: Math.round(((b.academic_gpa || 14) / 20) * 18),
        attitudeScore: Math.round(((b.academic_gpa || 14) / 20) * 20),
      },
    ],
    parentsName: b.tutor_name || 'Parents Référents',
    parentsPhone: b.tutor_phone || 'Non renseigné',
    coachComments: b.observations || 'Aucune observation enregistrée.',
  };
}

export function mapFrontendAcademyStudentToBackend(f: Partial<AcademyStudent>): Partial<BackendAcademyStudent> {
  const memberIdNum = f.memberId ? parseInt(f.memberId, 10) : undefined;
  
  return {
    ...(memberIdNum && !isNaN(memberIdNum) ? { member_id: memberIdNum } : {}),
    school_name: f.schoolGrade?.includes('(') ? f.schoolGrade.split('(')[1].replace(')', '').trim() : 'Établissement scolaire',
    grade_level: f.schoolGrade?.includes('(') ? f.schoolGrade.split('(')[0].trim() : (f.schoolGrade || 'Scolarité'),
    academic_gpa: f.schoolSupportNeeded ? 9.5 : 14.0,
    tutor_name: f.tutorCoachName || f.parentsName || '',
    tutor_phone: f.parentsPhone || '',
    observations: f.coachComments || '',
  };
}

export const academyService = {
  async getStudents(clubId: number = 1): Promise<AcademyStudent[]> {
    const response = await fetch(`${API_BASE_URL}/students/?club_id=${clubId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch academy students: ${response.statusText}`);
    }
    const data: BackendAcademyStudent[] = await response.json();
    return data.map(mapBackendAcademyStudentToFrontend);
  },

  async createOrUpdateStudent(student: Partial<AcademyStudent>): Promise<AcademyStudent> {
    const payload = mapFrontendAcademyStudentToBackend(student);
    const isUpdate = student.id && !student.id.startsWith('acad-');
    const url = isUpdate
      ? `${API_BASE_URL}/students/${student.id}/`
      : `${API_BASE_URL}/students/`;
    const method = isUpdate ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to save student: ${errText}`);
    }

    const data: BackendAcademyStudent = await response.json();
    return mapBackendAcademyStudentToFrontend(data);
  },

  async deleteStudent(id: string): Promise<void> {
    if (id.startsWith('acad-')) return;
    const response = await fetch(`${API_BASE_URL}/students/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete student: ${response.statusText}`);
    }
  },
};
