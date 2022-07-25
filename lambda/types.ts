type QuestionCustomUserFields = {
  title: string;
  type: "select" | "multiselect" | "text";
  cufId: number;
  options?: { id: number; name: string }[];
};

type FormBody = {
  title: string;
  questions: QuestionCustomUserFields[];
};
