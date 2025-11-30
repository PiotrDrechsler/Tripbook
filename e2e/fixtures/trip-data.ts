/**
 * Test data for E2E tests - Create Trip scenarios
 */

export const validTripData = {
  basic: {
    name: "Wycieczka do Tatr",
    mapUrl: "https://mapy.com/s/hulolekoje",
  },
  complete: {
    name: "Wycieczka do Beskidów",
    description:
      "Piękna wycieczka w góry. Będziemy wędrować szlakami Beskidów. Zaplanowane jest zwiedzanie szczytów i schronisk górskich.",
    mapUrl: "https://mapy.com/s/hulolekoje",
    date: "2025-12-15",
  },
  withLongDescription: {
    name: "Wycieczka z długim opisem",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(10),
    mapUrl: "https://mapy.com/s/hulolekoje",
    date: "2025-12-20",
  },
};

export const invalidTripData = {
  emptyName: {
    name: "",
    mapUrl: "https://mapy.com/s/hulolekoje",
  },
  nameTooLong: {
    name: "A".repeat(101), // Exceeds 100 character limit
    mapUrl: "https://mapy.com/s/hulolekoje",
  },
  descriptionTooLong: {
    name: "Valid name",
    description: "A".repeat(2001), // Exceeds 2000 character limit
    mapUrl: "https://mapy.com/s/hulolekoje",
  },
  invalidMapUrl: {
    name: "Valid name",
    mapUrl: "https://google.com", // Not a mapy.cz URL
  },
  emptyMapUrl: {
    name: "Valid name",
    mapUrl: "",
  },
  invalidDateFormat: {
    name: "Valid name",
    mapUrl: "https://mapy.com/s/hulolekoje",
    date: "2025-13-45", // Invalid date
  },
};

export const mapyLinks = {
  valid: [
    "https://mapy.com/s/hulolekoje",
    "https://en.mapy.cz/zakladni?x=14.4378&y=50.0755&z=13",
    "https://mapy.cz/zakladni?vlastni-body&x=14.4378&y=50.0755&z=13&m3d=1&height=461&yaw=0&pitch=-90",
  ],
  invalid: ["https://google.com", "https://maps.google.com", "not-a-url", "ftp://mapy.cz"],
};

export const dateFormats = {
  valid: "2025-12-15", // ISO format YYYY-MM-DD
  today: new Date().toISOString().split("T")[0],
  future: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days from now
  past: "2020-01-01",
};

export const validationErrorMessages = {
  name: {
    required: "Nazwa jest wymagana",
    tooLong: "Nazwa nie może przekraczać 100 znaków",
  },
  mapUrl: {
    required: "Link do mapy jest wymagany",
    invalidFormat: 'Link musi zawierać "mapy.com"',
    noCoordinates: "Najpierw wyciągnij współrzędne z linku mapy.com",
  },
  description: {
    tooLong: "Opis nie może przekraczać 2000 znaków",
  },
};

export const coordinates = {
  prague: {
    latitude: 50.0755,
    longitude: 14.4378,
    dms: "50°04'31.8\"N, 14°26'16.1\"E",
  },
  tatras: {
    latitude: 49.1656,
    longitude: 20.0875,
    dms: "49°09'56.2\"N, 20°05'15.0\"E",
  },
};

/**
 * Helper to generate random trip name
 */
export function generateRandomTripName(): string {
  const adjectives = ["Piękna", "Górska", "Letnia", "Zimowa", "Wiosenna", "Jesienna"];
  const destinations = ["do Tatr", "do Beskidów", "nad morze", "do lasu", "w góry", "nad jezioro"];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const destination = destinations[Math.floor(Math.random() * destinations.length)];
  const timestamp = Date.now();
  return `${adjective} wycieczka ${destination} (${timestamp})`;
}

/**
 * Helper to generate trip data with random name
 */
export function generateTripData(overrides?: Partial<typeof validTripData.complete>) {
  return {
    name: generateRandomTripName(),
    description: "Testowa wycieczka utworzona automatycznie",
    mapUrl: "https://mapy.com/s/hulolekoje",
    date: dateFormats.future,
    ...overrides,
  };
}
