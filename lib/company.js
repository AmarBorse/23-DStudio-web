// Studio details printed on quotations (and later invoices). Edit here.
export const COMPANY = {
  name: "Twenty-Three D STUDIO",
  address: "Shop 1, Govind Sahnivas Co-op Society, Sharanpur Rd, P&T Colony, Nashik, INDIA 422005",
  email: "info@23dstudio.com",
  phone: "+91 90215 07499",
  website: "23dstudio.com",
};

// Pre-filled on every new quotation (can be changed per quotation)
export const QUOTE_DEFAULTS = {
  preparedByName: "ID. Ritika Yeole",
  preparedByPhone: "+91 93599 21928",
  validDays: 15,
  gstPercent: 18,
  closing: "We look forward to working with you on this project.",
  terms: [
    "The quotation includes only the drawings mentioned in the scope of work.",
    "Plumbing and electrical layouts will be charged separately if floor-wise changes are required.",
    "POP ceiling charges will depend on whether the design is the same or different on each floor.",
    "Any additional drawings or major revisions beyond the agreed scope will be charged extra.",
    "Work will begin after quotation approval, and payments will be made as mutually agreed.",
  ],
};

// Pre-filled on every new invoice (can be changed per invoice)
export const INVOICE_DEFAULTS = {
  // Text between **two stars** is printed in bold
  notes: [
    "Project will commence after **50% advance** is received.",
    "Final output will be released only after full payment is received.",
    "Changes in file After Final Approval are chargeable.",
    "Please provide accurate reference and textures for acceptable results.",
    "Renders provided are for screen viewing and not for offset and large media printing.",
  ],
  bank: [
    "Account Name:- Duse Gaurav Bharat",
    "Bank Name:- Bank of Baroda",
    "Acc. NO. :- 42890100004422",
    "IFSC Code:- BARB0TRINAS  (Fifth Character is Zero)",
  ],
  closing: "Thank you for choosing us!",
  gstPercent: 18,
};

// Offer letters (layout from the Canva "Job Offer Letter" template). Pre-filled on every new letter.
export const OFFER_DEFAULTS = {
  // colours of the corner shapes and icons (template: teal + amber)
  accent: "#009d93",
  accent2: "#ffbd59",
  workLocation: "Nashik office",
  benefits: "paid leave and performance bonuses",
  acceptDays: 7, // "accept by" date = letter date + this many days
  closing: "Warm Regards,",
  signatoryName: "Gaurav Duse",
  signatoryTitle: "", // optional line under the name (left empty: only the name is printed)
  // Letter text. {placeholders} are filled from the form; text between **two stars** is bold.
  body: [
    "We are pleased to offer you the position of **{position}** at **{company}**, starting on {start_date}. In this role, you will report to **{reporting_to}** and will be based at our {location}.",
    "Your monthly salary will be {salary}, along with benefits including {benefits}. Full details will be shared upon confirmation.",
    "Please confirm your acceptance by signing and returning this letter by **{accept_by}**.",
    "We look forward to having you onboard and seeing your creative ideas come to life!",
  ].join("\n\n"),
};

// Internship offer letters (1 page, same template). Format: date, candidate, letter, signature, candidate's acceptance.
export const INTERNSHIP_DEFAULTS = {
  department: "Human Resources",
  workMode: "hybrid",
  workingHours: "Monday to Friday, from 10 am to 6 pm",
  durationMonths: 6,
  closing: "Sincerely,",
  // the tasks sentence in the letter ("…with tasks such as {duties}.")
  duties:
    "sourcing and screening candidates, coordinating interviews, preparing offer letters and joining documents, and onboarding new team members",
  body: [
    "We are delighted to inform you that you have been selected for the position of **{position}** at **{company}**. We were highly impressed by your qualifications and your enthusiasm to learn during the selection process, and we are excited to welcome you to our team.",
    "Your internship will commence on **{start_date}** and will continue for {duration}, until **{end_date}**. This is a paid internship, and you will receive a monthly stipend of **{stipend}**. Your work schedule will be {working_hours}, and your mode of work will be {location}.",
    "During your internship, you will support our {department} team with tasks such as {duties}. You will work under the direct supervision of **{reporting_to}**, who will guide, mentor and support you throughout your internship.",
    "A laptop will be issued to you for the duration of your internship, and you are expected to return it at the end of your tenure. Please note that this offer letter does not guarantee full-time employment with the studio.",
    "We request you to review the information in this letter carefully. If you have any questions or need further clarification, please contact us at {email}. We kindly request you to share a signed copy of this letter by **{accept_by}**. We look forward to working with you.",
  ].join("\n\n"),
  acceptance:
    "I, **{name}**, hereby accept the internship offer outlined in this letter and agree to all the terms and conditions.",
};

// Internship completion letters (1 page, same template). Issued after the internship ends.
export const COMPLETION_DEFAULTS = {
  heading: "TO WHOM IT MAY CONCERN",
  closing: "Sincerely,",
  // completes "During the internship, {first_name} assisted the team with …"
  duties:
    "sourcing and screening candidates, coordinating interviews, preparing offer letters and joining documents, and onboarding new team members",
  body: [
    "This is to certify that **{name}** has successfully completed an internship with **{company}** as **{position}** in our {department} department, from **{start_date}** to **{end_date}**, a period of {duration}.",
    "During the internship, {first_name} assisted the team with {duties}, under the supervision of **{reporting_to}**.",
    "{first_name} was sincere, punctual and eager to learn throughout the internship, maintained a professional attitude and good conduct, and completed all assigned work to our satisfaction.",
    "We appreciate the contribution made to the studio during this period and wish {first_name} every success in all future endeavours.",
  ].join("\n\n"),
};
