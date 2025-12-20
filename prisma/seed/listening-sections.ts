// IELTS Listening Sections
// Each section includes audio URL, questions, and answer key
// Note: Audio URLs are placeholders - replace with actual IELTS-style audio files

export interface ListeningQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false_ng' | 'matching' | 'short_answer';
  text: string;
  options?: string[];
  items?: string[];
  maxWords?: number;
}

export interface ListeningSection {
  id: string;
  title: string;
  audioUrl: string;
  transcript?: string;
  questions: ListeningQuestion[];
  answers: Record<string, string | string[]>;
  difficultyBand: number;
  section: 1 | 2 | 3 | 4;
}

export const listeningSections: ListeningSection[] = [
  {
    id: 'listening-001',
    title: 'Section 1: University Accommodation Office',
    // Placeholder audio - replace with actual audio URL
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    transcript: `Receptionist: Good morning, University Accommodation Office. How can I help you?

Student: Hello, I'm calling about student housing for next semester. My name is Sarah Mitchell.

Receptionist: Of course, Sarah. Let me pull up your information. Can you confirm your student ID number?

Student: Yes, it's 2-0-4-5-8-7.

Receptionist: Thank you. I can see you're currently in Campbell Hall. Are you looking to stay there or move to a different residence?

Student: Actually, I'd like to move. I need somewhere quieter for studying. Campbell Hall is a bit too social for me.

Receptionist: I understand. We have availability in Riverside Court, which is our postgraduate and mature student residence. It's much quieter. The rooms are 450 pounds per month, including utilities.

Student: That sounds good. Is there a kitchen in the building?

Receptionist: Yes, there's a shared kitchen on each floor with two refrigerators, a microwave, and cooking facilities. You'd be sharing with five other students.

Student: Perfect. What about internet access?

Receptionist: High-speed wifi is included in the rent. We also have a computer room on the ground floor that's open twenty-four hours.

Student: Great. How do I apply for a room there?

Receptionist: You'll need to fill out a transfer request form. The deadline is the fifteenth of March, and you'll hear back within two weeks.

Student: And when would I be able to move in?

Receptionist: The start of the new semester, which is September the fourth. Shall I email you the form?

Student: Yes, please. My email is sarah.mitchell@university.edu.

Receptionist: Perfect. I'll send that right over. Is there anything else I can help you with?

Student: No, that's everything. Thank you so much.

Receptionist: You're welcome. Have a great day.`,
    questions: [
      {
        id: 'l1-q1',
        type: 'short_answer',
        text: "What is the student's name?",
        maxWords: 2,
      },
      {
        id: 'l1-q2',
        type: 'short_answer',
        text: "What is the student's ID number?",
        maxWords: 1,
      },
      {
        id: 'l1-q3',
        type: 'short_answer',
        text: 'Which residence hall is the student currently living in?',
        maxWords: 2,
      },
      {
        id: 'l1-q4',
        type: 'multiple_choice',
        text: 'Why does the student want to move?',
        options: [
          'A) The rent is too expensive',
          'B) She needs a quieter place to study',
          'C) She wants to be closer to campus',
          'D) Her roommate is moving out',
        ],
      },
      {
        id: 'l1-q5',
        type: 'short_answer',
        text: 'How much does a room at Riverside Court cost per month?',
        maxWords: 3,
      },
      {
        id: 'l1-q6',
        type: 'short_answer',
        text: 'How many students share each kitchen?',
        maxWords: 1,
      },
      {
        id: 'l1-q7',
        type: 'short_answer',
        text: 'What is the deadline for the transfer request?',
        maxWords: 3,
      },
      {
        id: 'l1-q8',
        type: 'short_answer',
        text: 'When does the new semester start?',
        maxWords: 3,
      },
    ],
    answers: {
      'l1-q1': 'Sarah Mitchell',
      'l1-q2': '204587',
      'l1-q3': 'Campbell Hall',
      'l1-q4': 'B',
      'l1-q5': '450 pounds',
      'l1-q6': '6',
      'l1-q7': '15th March',
      'l1-q8': 'September 4th',
    },
    difficultyBand: 5.5,
    section: 1,
  },
  {
    id: 'listening-002',
    title: 'Section 2: City Museum Tour Information',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    transcript: `Welcome to the City Museum audio guide. Before we begin our tour, let me share some important information about the museum and its facilities.

The museum is open from nine a.m. to six p.m. on weekdays, and from ten a.m. to eight p.m. on weekends. Please note that last admission is one hour before closing time.

We have three floors of exhibits. The ground floor houses our permanent collection of ancient artifacts, including Egyptian mummies and Greek sculptures. The first floor features rotating exhibitions—currently, we have a special display on Renaissance art that will run until December fifteenth. The second floor is dedicated to interactive science exhibits, which are particularly popular with families.

Guided tours are available at eleven a.m. and two p.m. each day. Tours last approximately ninety minutes and are included with your admission ticket. Private group tours can be arranged for parties of ten or more by contacting our bookings office.

The museum café is located on the ground floor near the east entrance. It serves hot and cold drinks, sandwiches, and cakes. For a full meal, our restaurant on the first floor offers a seasonal menu with vegetarian and vegan options.

Photography is permitted in most areas of the museum, but please do not use flash, as it can damage the artworks. The Renaissance exhibition is an exception—no photography is allowed there at all due to loan agreements with other institutions.

Lockers are available near the main entrance for storing large bags and coats. They require a one-pound coin, which is refunded when you collect your belongings. Pushchairs and wheelchairs are available free of charge from the information desk.

If you need assistance at any time, look for staff members in blue uniforms. They'll be happy to help you. Enjoy your visit.`,
    questions: [
      {
        id: 'l2-q1',
        type: 'short_answer',
        text: 'What time does the museum open on weekends?',
        maxWords: 2,
      },
      {
        id: 'l2-q2',
        type: 'short_answer',
        text: 'How many floors of exhibits does the museum have?',
        maxWords: 1,
      },
      {
        id: 'l2-q3',
        type: 'multiple_choice',
        text: 'What is displayed on the first floor?',
        options: [
          'A) Ancient artifacts',
          'B) Rotating exhibitions',
          'C) Interactive science exhibits',
          'D) Egyptian mummies',
        ],
      },
      {
        id: 'l2-q4',
        type: 'short_answer',
        text: 'When does the Renaissance exhibition end?',
        maxWords: 2,
      },
      {
        id: 'l2-q5',
        type: 'short_answer',
        text: 'How long do the guided tours last?',
        maxWords: 2,
      },
      {
        id: 'l2-q6',
        type: 'true_false_ng',
        text: 'Photography is allowed in the Renaissance exhibition.',
      },
      {
        id: 'l2-q7',
        type: 'true_false_ng',
        text: 'The café serves full meals.',
      },
      {
        id: 'l2-q8',
        type: 'short_answer',
        text: 'What color uniforms do the staff wear?',
        maxWords: 1,
      },
    ],
    answers: {
      'l2-q1': '10 a.m.',
      'l2-q2': '3',
      'l2-q3': 'B',
      'l2-q4': 'December 15th',
      'l2-q5': '90 minutes',
      'l2-q6': 'FALSE',
      'l2-q7': 'FALSE',
      'l2-q8': 'blue',
    },
    difficultyBand: 6.0,
    section: 2,
  },
  {
    id: 'listening-003',
    title: 'Section 3: Academic Discussion on Climate Research',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    transcript: `Professor: Good afternoon, everyone. Today we're discussing your research proposals with Dr. Chen, who'll be supervising the climate research projects this year. James, let's start with you.

James: Thank you, Professor. Dr. Chen, I'm planning to study the impact of urban heat islands on local weather patterns. I want to focus specifically on how tall buildings affect wind flow and temperature distribution in city centers.

Dr. Chen: That's an interesting topic, James. What methodology are you considering?

James: I'm thinking of using a combination of satellite thermal imaging and ground-level sensors. I'd like to collect data over a twelve-month period to capture seasonal variations.

Dr. Chen: A full year would certainly give you comprehensive data. What about your sample location?

James: I was hoping to use the city center here, plus two suburban areas for comparison.

Dr. Chen: Good thinking. Having comparison sites will strengthen your findings. What about you, Maria?

Maria: I'm interested in ocean acidification and its effects on coral reef ecosystems. Specifically, I want to examine how reduced pH levels affect coral growth rates.

Dr. Chen: That's highly relevant research. How do you plan to measure growth rates?

Maria: I'll use photographic documentation at regular intervals, along with calcium carbonate measurements. I've already identified three reef sites in the Pacific where I could conduct field studies.

Dr. Chen: Field work in the Pacific sounds expensive. Have you considered the budget implications?

Maria: Yes, I've applied for a research grant from the Marine Conservation Society. I should hear back by next month.

Professor: Excellent initiative. Now, both of you should be aware that ethics approval is required before you begin data collection. The forms need to be submitted by the end of October at the latest.

Dr. Chen: And remember, your literature reviews should be completed before the December break. That gives you time to refine your methodology based on previous studies.

James: Should we book regular supervision meetings now?

Dr. Chen: Yes, let's set up fortnightly meetings starting in November. You can sign up through the department's online booking system.`,
    questions: [
      {
        id: 'l3-q1',
        type: 'short_answer',
        text: "What is the topic of James's research?",
        maxWords: 4,
      },
      {
        id: 'l3-q2',
        type: 'multiple_choice',
        text: 'What methods will James use to collect data?',
        options: [
          'A) Interviews and surveys',
          'B) Satellite imaging and ground sensors',
          'C) Computer simulations only',
          'D) Historical weather records',
        ],
      },
      {
        id: 'l3-q3',
        type: 'short_answer',
        text: 'How long will James collect data for?',
        maxWords: 2,
      },
      {
        id: 'l3-q4',
        type: 'short_answer',
        text: 'What is Maria studying the effects of on coral reefs?',
        maxWords: 2,
      },
      {
        id: 'l3-q5',
        type: 'short_answer',
        text: 'Which organization has Maria applied to for funding?',
        maxWords: 4,
      },
      {
        id: 'l3-q6',
        type: 'short_answer',
        text: 'By when must ethics approval forms be submitted?',
        maxWords: 3,
      },
      {
        id: 'l3-q7',
        type: 'short_answer',
        text: 'When should literature reviews be completed?',
        maxWords: 3,
      },
      {
        id: 'l3-q8',
        type: 'multiple_choice',
        text: 'How often will supervision meetings take place?',
        options: ['A) Weekly', 'B) Fortnightly', 'C) Monthly', 'D) Every term'],
      },
    ],
    answers: {
      'l3-q1': 'urban heat islands',
      'l3-q2': 'B',
      'l3-q3': '12 months',
      'l3-q4': 'ocean acidification',
      'l3-q5': 'Marine Conservation Society',
      'l3-q6': 'end of October',
      'l3-q7': 'before December break',
      'l3-q8': 'B',
    },
    difficultyBand: 7.0,
    section: 3,
  },
];
