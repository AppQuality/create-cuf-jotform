import fetch, { Headers } from "node-fetch";

class Jotform {
  private baseUrl: string;
  private formUrl: string;
  private folderUrl: string;
  private formId: string | undefined;
  constructor(private apiKey: string) {
    this.baseUrl = `${process.env.JOTFORM_API_HOST}`;
    this.formUrl = `${this.baseUrl}/form`;
    this.folderUrl = `${this.baseUrl}/folder`;
  }

  async create(body: FormBody) {
    const response = await fetch(this.getJotformUrl(body), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const results = await response.json();
    if (results.content.id) {
      this.formId = results.content.id;
      await this.setThankYouPage();
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
  private async setThankYouPage() {
    if (!this.formId) throw new Error("No form id");
    const redirectUrl =
      "https://webhook.site/effd43fc-1cd5-4c03-9146-22a037eba368";

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

  private getJotformUrl(body: FormBody): string {
    return (
      this.formUrl +
      `?` +
      this.serializeParameters({
        apiKey: this.apiKey,
        questions: { ...this.formQuestions(body.questions) },
        properties: { ...this.formProperties(body.title) },
      })
    );
  }

  private selectFormQuestions(
    questionNumber: number,
    question: QuestionCustomUserFields
  ) {
    if (!question.options) throw new Error("No options provided");
    return {
      text: question.title,
      type: "control_dropdown",
      name: `cuf_${question.cufId}`,
      emptyText: "Seleziona qualcosa",
      required: "Yes",
      autoFixed: "No",
      labelAlign: "Auto",
      multipleSelections: "No",
      order: questionNumber,
      searchText: "Search",
      shuffle: "No",
      size: "0",
      special: "None",
      useCalculations: "Yes",
      visibleOptions: "1",
      width: "310",
      options: this.convertListToPipedString(question.options, "name"),
      calcValues: this.convertListToPipedString(
        [{ id: "0" }, ...question.options],
        "id"
      ),
    };
  }
  private multiselectFormQuestions(
    questionNumber: number,
    question: QuestionCustomUserFields
  ) {
    if (!question.options) throw new Error("No options provided");
    return {
      text: question.title,
      type: "control_checkbox",
      name: `cuf_${question.cufId}`,
      useCalculations: "Yes",
      required: "No",
      readonly: "No",
      labelAlign: "Auto",
      multipleSelections: "No",
      order: questionNumber,
      shuffle: "No",
      special: "None",
      otherText: "Other",
      spreadCols: "3",
      options: this.convertListToPipedString(question.options, "name"),
      calcValues: this.convertListToPipedString(question.options, "id"),
    };
  }
  private textFormQuestions(
    questionNumber: number,
    question: QuestionCustomUserFields
  ) {
    return {
      text: question.title,
      type: "control_textbox",
      name: `cuf_${question.cufId}`,
      order: questionNumber,
      autoFixed: "No",
      labelAlign: "Auto",
      required: "No",
      readonly: "No",
      size: "310",
      validation: "None",
    };
  }

  private formQuestions(questions: QuestionCustomUserFields[]) {
    let result: { [key: number]: any } = {};
    questions.forEach((question, index) => {
      const questionNumber = index + 1;
      switch (question.type) {
        case "select":
          result[questionNumber] = this.selectFormQuestions(
            questionNumber,
            question
          );
          break;
        case "multiselect":
          result[questionNumber] = this.multiselectFormQuestions(
            questionNumber,
            question
          );

          break;
        case "text":
          result[questionNumber] = this.textFormQuestions(
            questionNumber,
            question
          );
          break;
        default:
          break;
      }
    });

    return result;
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
          logo: "https://icons.jotfor.ms/cardforms/assets/icons/icon-sets-v2/solid/Hardware/jfc_icon_solid-computer.svg",
          showQuestionCount: "Yes",
          subTitle: "Hi there, please fill out and submit this form.",
          title: "Welcome",
        },
      ],
      type: "CARD",
      isEUForm: "1",
      formType: "cardForm",
      themeID: "59647bf8cf3bfe639c0b7cb1",
      autoStyleFromBgImage: "Yes",
      clearFieldOnHide: "disable",
      defaultTheme: "v2",
      optioncolor: "%23000",
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
