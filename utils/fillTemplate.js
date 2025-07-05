// utils/fillTemplate.js

function fillTemplate(template, variables) {
  return template.replace(/{{(\w+)}}/g, (_, key) => variables[key] || "");
}

module.exports = fillTemplate;
