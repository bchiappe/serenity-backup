const nodemailer = require("nodemailer");
const { VM } = require("vm2");
const { getSettings } = require("./settings");

const executeExpression = async (expression, vars = {}) => {
  // Define script context
  const context = {
    $operation: {
      ...vars,
    },
    getDate: (format, adjust, input) => {
      // Create date using moment
      let newDate = input
        ? DateTime.fromFormat(input, format)
        : DateTime.local();
      // Adjust if needed
      if (adjust) {
        adjust = String(adjust);
        const modifiers = [
          "years",
          "quarters",
          "months",
          "weeks",
          "days",
          "hours",
          "minutes",
          "seconds",
        ];
        const sections = adjust.split(" ");
        const modifier =
          sections.length === 2 && modifiers.includes(sections[1])
            ? sections[1]
            : "days";
        adjust = Number(sections[0]);
        console.log("Adjust", { [modifier]: adjust });
        newDate = newDate.plus({ [modifier]: adjust });
      }
      return newDate.toFormat(format);
    },
  };
  // Create a new sandboxed vm
  const vm = new VM({
    console: "inherit",
    require: false,
    sandbox: context,
    wrapper: "none",
  });
  // Prepare script
  console.log("$operation", context.$operation);
  script = `(async () => {
    return ${expression};
  })();`;
  // Run script in sandbox
  try {
    console.log("Script", script);
    const output = await vm.run(script);
    console.log("Output", output);
    return output;
  } catch (e) {
    throw Error(`Error evaluating expression: ${e.message}`);
  }
};

const populateElementExpressions = async (element, vars = {}) => {
  // Check that element is a string
  if (!(typeof element === "string")) {
    return element;
  }
  const funcRegEx = new RegExp(/{{(.*?)}}/g);
  // Get all matches to regex in element
  const matches = element.match(funcRegEx);
  if (Array.isArray(matches)) {
    for (const tag of matches) {
      // Get tag expression
      const expression = tag.replace(/{{/g, "").replace(/}}/g, "");
      // Execute expression
      const output = await executeExpression(expression, vars);
      // Replace expression with output
      element = element.replace(tag, output);
    }
  }
  // Return updated element
  return element;
};

exports.sendEmail = async (options = {}) => {
  // Set up SMTP connection
  const smtp = await getSettings("smtp");
  console.log("SMTP", smtp);
  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465, // true for 465, false for other ports
    auth: {
      user: smtp.user,
      pass: smtp.password,
    },
  });
  // Populate vars in subject/body
  const subject = await populateElementExpressions(
    options.subject,
    options.vars
  );
  const body = await populateElementExpressions(options.body, options.vars);
  // Send email
  const info = await transporter.sendMail({
    from: options.from, // sender address
    to: options.to, // list of receivers
    cc: options.cc,
    bcc: options.bcc,
    subject: subject,
    html: body,
  });
  console.log("Message sent: %s", info.messageId);
  return info.messageId;
};
