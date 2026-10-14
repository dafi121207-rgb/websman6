export type SessionUser = {
  id: string;
  identifier: string;
  name: string;
  role: "ADMIN" | "GURU" | "SISWA";
  kelas: string | null;
};

export type QuestionDTO = {
  id: string;
  questionText: string;
  options: string[];
};

export type QuizMetaDTO = {
  id: string;
  moduleId: string;
  title: string;
  durationMin: number;
  passScore: number;
  moduleTitle: string;
  category: string;
  questionCount: number;
  myScore?: number | null;
  myStatus?: "BELUM" | "LULUS" | "GAGAL";
};

export type AttemptResultDTO = {
  score: number;
  isPassed: boolean;
  passScore: number;
  review: Array<{
    questionText: string;
    options: string[];
    chosen: number | null;
    correctAnswer: number;
    explanation: string | null;
  }>;
};

export type ProfileDTO = {
  title: string;
  email: string;
  phone: string;
  tagline: string;
  welcomeText: string;
  vision: string;
  mission: string[];
};
