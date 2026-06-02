const officeAddressLines = [
  "7/25, Tower F, 2nd Floor",
  "Kirti Nagar",
  "New Delhi - 110015, India",
];

const officeAddressText = officeAddressLines.join(", ");
const encodedOfficeAddress = encodeURIComponent(officeAddressText);

export const contactInfo = {
  officeName: "Delhi Office",
  officeAddressLines,
  officeAddressText,
  phoneDisplay: "+91 79053 50134",
  phoneHref: "tel:+917905350134",
  whatsappDisplay: "+91 79053 50134",
  whatsappHref: "https://wa.me/917905350134",
  email: "sales@smarthomeappliances.co",
  emailHref: "mailto:sales@smarthomeappliances.co",
  businessHoursDays: "Mon - Sat",
  businessHoursTime: "9:30 AM - 6:30 PM",
  businessHours: "Mon - Sat 9:30 AM - 6:30 PM",
  responseTime: "Within 24-48 Hours",
  mapsEmbedUrl: `https://maps.google.com/maps?q=${encodedOfficeAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`,
};
