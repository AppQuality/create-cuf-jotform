import { APIGatewayProxyResultV2, APIGatewayEvent } from "aws-lambda";
import fetch from "node-fetch";

export async function main(
  event: APIGatewayEvent
): Promise<APIGatewayProxyResultV2> {
  if (!event.body) {
    return {
      body: "Empty request",
      statusCode: 400,
    };
  }
  const body: FormBody = JSON.parse(event.body);

  const postNewJotform = await fetch(getJotformUrl(body), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  console.log(postNewJotform);

  //move the new jotform to the cuf folder
  // await fetch(`
  //   ${process.env.JOTFORM_API_HOST}/folder/${process.env.JOTFORM_CUF_FOLDER_ID}
  //   ?apiKey=${process.env.JOTFORM_API_KEY}`, {
  //   method: "PUT",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({forms: [postNewJotform.id.toString()]}),
  // });

  return {
    body: JSON.stringify({ body: event.body }),
    statusCode: 200,
  };

  function getJotformUrl(body: FormBody): string {
    console.log(body);
    //base path + api key
    let newJotformUrl = [
      `${process.env.JOTFORM_API_HOST}/form?
    apiKey=${process.env.JOTFORM_API_KEY}`,
    ];
    //properties
    newJotformUrl.push(getStringifiedProperties());
    //questions
    newJotformUrl.push(getStringifiedQuestions(body.questions));
    return newJotformUrl.join("&");
  }

  function getStringifiedQuestions(
    questions: QuestionCustomUserFields[]
  ): string {
    let stringified = "";
    questions.forEach((question, index) => {
      const questionNumber = index + 1;
      switch (question.type) {
        case "select":
          stringified += `
          questions[${questionNumber}][text]=${question.title}&
          questions[${questionNumber}][type]=control_dropdown&
          ${getOptionsAndValues(question, questionNumber)}
          questions[${questionNumber}][name]=cuf_${question.cufId}&
          questions[${questionNumber}][emptyText]=Seleziona qualcosa&
          questions[${questionNumber}][required]=Yes&
          questions[${questionNumber}][autoFixed]=No&
          questions[${questionNumber}][labelAlign]=Auto&
          questions[${questionNumber}][multipleSelections]=No&
          questions[${questionNumber}][order]=${questionNumber}&
          questions[${questionNumber}][searchText]=Search&
          questions[${questionNumber}][shuffle]=No&
          questions[${questionNumber}][size]=0&
          questions[${questionNumber}][special]=None&
          questions[${questionNumber}][useCalculations]=Yes&
          questions[${questionNumber}][visibleOptions]=1&
          questions[${questionNumber}][width]=310&`;
          break;
        case "multiselect":
          stringified += `
          questions[${questionNumber}][text]=${question.title}&
          questions[${questionNumber}][type]=control_checkbox&
          ${getOptionsAndValues(question, questionNumber)}
          questions[${questionNumber}][name]=cuf_${question.cufId}&
          questions[${questionNumber}][useCalculations]=Yes&
          questions[${questionNumber}][required]=No&
          questions[${questionNumber}][readonly]=No&
          questions[${questionNumber}][labelAlign]=Auto&
          questions[${questionNumber}][multipleSelections]=No&
          questions[${questionNumber}][order]=${questionNumber}&
          questions[${questionNumber}][shuffle]=No&
          questions[${questionNumber}][special]=None&
          questions[${questionNumber}][otherText]=Other&
          questions[${questionNumber}][spreadCols]=3&`;
          break;
        case "text":
          stringified += `
          questions[${questionNumber}][text]=${question.title}&
          questions[${questionNumber}][type]=control_textbox&
          questions[${questionNumber}][name]=cuf_${question.cufId}&
          questions[${questionNumber}][order]=${questionNumber}&
          questions[${questionNumber}][autoFixed]=No&
          questions[${questionNumber}][labelAlign]=Auto&
          questions[${questionNumber}][required]=No&
          questions[${questionNumber}][readonly]=No&
          questions[${questionNumber}][size]=310&
          questions[${questionNumber}][validation]=None`;
          break;
        default:
          break;
      }
    });
    return stringified;
  }

  function getOptionsAndValues(
    question: QuestionCustomUserFields,
    questionNumber: number
  ): string {
    const options = question.options
      ? question.options.map((el) => el.value).join("|")
      : "0";
    let values = "";
    if (question.type === "multiselect")
      values = question.options
        ? question.options.map((el) => el.id).join("|")
        : "0";
    else if (question.type === "select")
      values = question.options
        ? "0|" + question.options.map((el) => el.id).join("|")
        : "0";
    return `
      questions[${questionNumber}][options]=${options}&
      questions[${questionNumber}][calcValues]=${values}&`;
  }
  function getStringifiedProperties(): string {
    let stringified = `
    properties[title]=${body.title}&
    properties[pagetitle]=${body.title}&
    properties[welcomePage][0][buttonText]=START&
    properties[welcomePage][0][isActive]=1&
    properties[welcomePage][0][logo]=https://icons.jotfor.ms/cardforms/assets/icons/icon-sets-v2/solid/Hardware/jfc_icon_solid-computer.svg&
    properties[welcomePage][0][showQuestionCount]=Yes&
    properties[welcomePage][0][subTitle]=Hi there, please fill out and submit this form.&
    properties[welcomePage][0][title]=Welcome&
    properties[sendpostdata]=Yes&
    properties[activeRedirect]=thankurl&
    properties[thanktext]=<div class=\"thankyou-wrapper\"><p class=\"thank-you-icon\" style=\"text-align: center;\"><img src=\"https://cdn.jotfor.ms/img/Thankyou-iconV2.png?v=0.1\" alt=\"\" width=\"153\" height=\"156\" </p><div style=\"text-align: center;\"><h1 class=\"thankyou-main-text ty-text\" style=\"text-align: center;\">Thank You!</h1><p class=\"thankyou-sub-text ty-text\" style=\"text-align: center;\">Your submission has been received.</p></div></div>&
    properties[thankurl]=https://webhook.site/effd43fc-1cd5-4c03-9146-22a037eba368&
    properties[thankYouPageLayout]=smallImageUp&
    properties[thankYouPage][0][imageSrc]=https://cdn.jotfor.ms/img/check-icon.png&
    properties[thankYouPage][0][redirectLink]=https://webhook.site/effd43fc-1cd5-4c03-9146-22a037eba368&
    properties[thankYouPage][0][subTitle]=Your submission has been received!&
    properties[thankYouPage][0][title]=Thank You!&
    properties[thankYouPage][0][type]=redirect&
    properties[thankYouPage][0][uniqueGlobalSubHeaderEditorName]=thankYouSubHeader&
    properties[status]=ENABLED&
    properties[type]=CARD&
    properties[creationLanguage]=en-US&
    properties[owner]=AppQuality&
    properties[formOwnerAccountType]=GOLD&
    properties[isEUForm]=1
    properties[alignment]=Top&
    properties[font]=Inter&
    properties[fontsize]=16&
    properties[formStringsChanged]=No&
    properties[formType]=cardForm&
    properties[formWidth]=752&
    properties[fullScreen]=1&
    properties[labelWidth]=230&
    properties[background]=%23fff&
    properties[fontcolor]=%232C3345&
    properties[lineSpacing]=12&
    properties[themeID]=59647bf8cf3bfe639c0b7cb1&
    properties[height]=539&
    properties[isHIPAA]=0&
    properties[allowSubmissionEdit]=No&
    properties[assignSlug]=222013390887052&
    properties[autoStyleFromBgImage]=Yes&
    properties[clearFieldOnHide]=disable&
    properties[defaultAutoResponderEmailAssigned]=Yes&
    properties[defaultEmailAssigned]=Yes&
    properties[defaultTheme]=v2&
    properties[expireDate]=NoLimit&
    properties[hideEmptySubmissionFields]=Yes&
    properties[hideMailEmptyFields]=enable&
    properties[hideNonInputSubmissionFields]=Yes&
    properties[hideSubmissionHeader]=No&
    properties[highlightLine]=Enabled&
    properties[iconPrediction]={\"icon\":\"https:\\/\\/icons.jotfor.ms\\/cardforms\\/assets\\/icons\\/icon-sets-v2\\/solid\\/Hardware\\/jfc_icon_solid-computer.svg\",\"type\":\"industry\",\"value\":\"Software\",\"keyword\":\"Software\"}&
    properties[isEncrypted]=No&
    properties[messageOfLimitedForm]=Thisformiscurrentlyunavailable!&
    properties[limitSubmission]=NoLimit&
    properties[mobileGoButton]=enable&
    properties[newPaymentUIForNewCreatedForms]=Yes&
    properties[optioncolor]=%23000&
    properties[pageTitleChanged]=No&
    properties[preventCloningForm]=No&
    properties[responsive]=No&
    properties[reviewBeforeSubmit]=No&
    properties[showJotFormLogo]=No&
    properties[showProgressBar]=disable&
    properties[smartEmbed]=0&
    properties[submitCaptcha]=No&
    properties[submitError]=jumpToFirstError&
    properties[unique]=None&
    properties[uniqueField]=<Field Id>&
    properties[usesNewPDF]=Yes&
    properties[v4]=1&
    properties[autoFill][0][menu]=disable&
    properties[slug]=222013255658048
    `;
    return stringified;
  }
}
