type QuestionCustomUserFields = {
  title: string;
  type: "select" | "multi-select" | "text";
  cufId: number;
  options?: { id: number; value: string }[];
};

type FormBody = {
  title: string;
  questions: QuestionCustomUserFields[];
};
