declare type QuestionCustomUserFields = {
  title: string;
  type: "select" | "multiselect" | "text";
  cufId: number;
  options?: {
    id: number;
    value: string;
  }[];
};
declare type FormBody = {
  title: string;
  questions: QuestionCustomUserFields[];
};
