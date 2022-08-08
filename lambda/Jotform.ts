import fetch, { Headers } from "node-fetch";

class Jotform {
  private baseUrl: string;
  private formUrl: string;
  private folderUrl: string;
  private formId: string | undefined;
  public jotformUrl: string | undefined;
  constructor(private apiKey: string) {
    this.baseUrl = `${process.env.JOTFORM_API_HOST}`;
    this.formUrl = `${this.baseUrl}/form`;
    this.folderUrl = `${this.baseUrl}/folder`;
  }

  async create(body: FormBody) {
    const response = await fetch(this.getCreateFormUrl(body), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const results = await response.json();
    if (results.content.id) {
      this.formId = results.content.id;
      this.jotformUrl = `https://eu.jotform.com/${this.formId}`;
      return results;
    }
    throw new Error("Failed to create form");
  }

  async moveToFolder(folderId: string) {
    if (!this.formId) throw new Error("No form id");
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    await fetch(`${this.folderUrl}/${folderId}?apiKey=${this.apiKey}`, {
      method: "PUT",
      headers: myHeaders,
      body: JSON.stringify({ forms: [this.formId] }),
    });
  }

  public async setThankYouPage(redirectUrl: string) {
    if (!this.formId) throw new Error("No form id");

    const properties = {
      activeRedirect: "thankurl",
      thankurl: redirectUrl,
      thankYouPage: [
        {
          imageSrc: "https://cdn.jotfor.ms/img/check-icon.png",
          redirectLink: redirectUrl,
          subTitle: "Your submission has been received!",
          title: "Thank You!",
          type: "redirect",
        },
      ],
    };
    await fetch(
      `${this.formUrl}/${this.formId}/properties?apiKey=${
        process.env.JOTFORM_API_KEY
      }&${this.serializeParameters({ properties })}`,
      {
        method: "POST",
      }
    );
  }

  private getCreateFormUrl(body: FormBody): string {
    return (
      this.formUrl +
      `?` +
      this.serializeParameters({
        apiKey: this.apiKey,
        questions: [
          ...this.getParameterFromQuestions(body.questions),
          this.getTesterIdHiddenQuestion(),
        ],
        properties: { ...this.formProperties(body.title) },
      })
    );
  }

  private defaultQuestionOptions({
    title,
    name,
    order,
  }: {
    title: string;
    name: string;
    order: number;
  }) {
    return {
      text: title,
      name: name,
      order: order,
      labelAlign: "Auto",
    };
  }

  private selectFormQuestions(
    question: QuestionCustomUserFields & { order: number }
  ) {
    if (!question.options) throw new Error("No options provided");
    return {
      ...this.defaultQuestionOptions({
        title: question.title,
        name: `cuf_${question.cufId}`,
        order: question.order,
      }),
      type: "control_dropdown",
      emptyText: "Choose an option",
      useCalculations: "Yes",
      required: "No",
      options: this.convertListToPipedString(question.options, "name"),
      calcValues: this.convertListToPipedString(
        [{ id: "0" }, ...question.options],
        "id"
      ),
    };
  }

  private multiselectFormQuestions(
    question: QuestionCustomUserFields & { order: number }
  ) {
    if (!question.options) throw new Error("No options provided");
    return {
      ...this.defaultQuestionOptions({
        title: question.title,
        name: `cuf_${question.cufId}`,
        order: question.order,
      }),
      type: "control_checkbox",
      useCalculations: "Yes",
      required: "No",
      options: this.convertListToPipedString(question.options, "name"),
      calcValues: this.convertListToPipedString(question.options, "id"),
    };
  }
  private getTesterIdHiddenQuestion() {
    return {
      ...this.defaultQuestionOptions({
        title: "Tester Id",
        name: "testerId",
        order: 1000,
      }),
      type: "control_textbox",
      hidden: "Yes",
      readonly: "Yes",
    };
  }
  private textFormQuestions(
    question: QuestionCustomUserFields & { order: number }
  ) {
    return {
      ...this.defaultQuestionOptions({
        title: question.title,
        name: `cuf_${question.cufId}`,
        order: question.order,
      }),
      type: "control_textbox",
      required: "No",
    };
  }

  private getParameterFromQuestions(questions: QuestionCustomUserFields[]) {
    const enhancedQuestions = questions.map((question, index) => ({
      order: index,
      ...question,
    }));
    return enhancedQuestions.map((question) => {
      if (question.type === "select") {
        return this.selectFormQuestions(question);
      } else if (question.type === "multiselect") {
        return this.multiselectFormQuestions(question);
      } else if (question.type === "text") {
        return this.textFormQuestions(question);
      } else {
        throw new Error("Unknown question type");
      }
    });
  }

  private convertListToPipedString(
    list: { [key: string]: string | number }[],
    key: string
  ) {
    return list.map((el) => el[key]).join("|");
  }

  private formProperties(title: string) {
    return {
      title: title,
      pagetitle: title,
      sendpostdata: "Yes",
      welcomePage: [
        {
          buttonText: "START",
          isActive: "1",
          logo: "https://www.jotform.com/uploads/AppQuality/form_files/Group%201402.62e4008c96bc24.95736921.svg",
          showQuestionCount: "Yes",
          subTitle: "Hi there, please fill out and submit this form.",
          title: "Welcome",
        },
      ],
      type: "CARD",
      isEUForm: "1",
      formType: "cardForm",
      themeID: "62e3f72e87750700ab148691",
      themeRevisionID: "62e3f72e87750700ab148692",
      autoStyleFromBgImage: "Yes",
      styleJSON:
        '{"pageBg-image":"https://www.jotform.com/uploads/AppQuality/form_files/Group%201606.62e3fda12e1286.10913009.png","pageBg-video":"","thankYouPage-bgColor":"#007ce2","thankYou-descColor":"#ffffff","thankYou-titleColor":"#ffffff","welcomePage-bgColor":"#7100D2"}',
      clearFieldOnHide: "disable",
      defaultTheme: "v2",
      optioncolor: "%23000",
      owner: "AppQuality",
    };
  }

  private serializeParameters(obj: any, prefix?: string): string {
    var str = [],
      p;
    for (p in obj) {
      if (obj.hasOwnProperty(p)) {
        var k = prefix ? prefix + "[" + p + "]" : p,
          v = obj[p];
        str.push(
          v !== null && typeof v === "object"
            ? this.serializeParameters(v, k)
            : encodeURIComponent(k) + "=" + encodeURIComponent(v)
        );
      }
    }
    return str.join("&");
  }
}

export default Jotform;
