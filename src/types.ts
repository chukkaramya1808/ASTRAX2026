export interface Competition {
  id: string;
  number: string;
  name: string;
  category: string;
  shortDesc: string;
  detailedDesc: string;
  icon: string;
  rules: string[];
  teamFormat: string;
  coordinator: string;
  eligibleYears: string[];
}

export interface Registration {
  id: number;
  student_name: string;
  college: string;
  course: string;
  year: string;
  suc_code: string;
  competition: string;
  registered_at: string;
}

export interface RegistrationStats {
  total: number;
  byCompetition: Record<string, number>;
  byYear: Record<string, number>;
  byCourse: Record<string, number>;
}

export interface AdminUser {
  username: string;
  token: string;
}
