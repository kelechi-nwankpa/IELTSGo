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
  accent: 'british' | 'american' | 'australian' | 'indian' | 'mixed';
}

export const listeningSections: ListeningSection[] = [
  {
    id: 'listening-001',
    title: 'Section 1: University Accommodation Office',
    // Placeholder audio - replace with actual audio URL
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    accent: 'british',
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
    accent: 'british',
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
    accent: 'british',
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
  // NEW SECTIONS BELOW
  {
    id: 'listening-004',
    title: 'Section 1: Library Membership Registration',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    accent: 'british',
    transcript: `Librarian: Good morning, welcome to Westfield Public Library. How can I help you today?

Visitor: Hi, I'd like to register for a library membership please.

Librarian: Of course. Are you a resident of Westfield?

Visitor: Yes, I just moved here last month. My name is Thomas Henderson.

Librarian: Welcome to the area, Thomas. I'll need some details from you. Could you give me your address?

Visitor: Sure, it's 47 Oak Street, Westfield.

Librarian: And your postcode?

Visitor: WF7 3PQ.

Librarian: Perfect. And a contact number?

Visitor: My mobile is 07845 293167.

Librarian: Great. Now, we have two types of membership. The standard membership is free and allows you to borrow up to eight items at a time. The premium membership is twelve pounds per year and lets you borrow up to fifteen items, plus you get free access to our online audiobook collection.

Visitor: I think I'll start with the standard membership for now.

Librarian: No problem. You can upgrade at any time. Books can be borrowed for three weeks, and DVDs for one week. You can renew items twice, either online, by phone, or in person.

Visitor: What if I return something late?

Librarian: There's a fine of twenty pence per day for books and fifty pence per day for DVDs. But we send email reminders three days before items are due.

Visitor: That's helpful. What about the opening hours?

Librarian: We're open Monday to Friday from nine thirty a.m. to seven p.m., and Saturdays from ten a.m. to four p.m. We're closed on Sundays.

Visitor: Do you have computers I can use?

Librarian: Yes, we have twelve computers available for public use. You can book a session for up to two hours. There's also free wifi throughout the building.

Visitor: Brilliant. Is there a children's section? I have a six-year-old daughter.

Librarian: Absolutely. The children's library is on the ground floor at the back. We run story time sessions every Wednesday at three thirty p.m. Your daughter would be very welcome.

Visitor: She'd love that. Thank you so much.

Librarian: You're welcome. Here's your temporary card. Your permanent card with your photo will be ready to collect in five working days.`,
    questions: [
      {
        id: 'l4-q1',
        type: 'short_answer',
        text: "What is the visitor's full name?",
        maxWords: 2,
      },
      {
        id: 'l4-q2',
        type: 'short_answer',
        text: "What is the visitor's postcode?",
        maxWords: 2,
      },
      {
        id: 'l4-q3',
        type: 'short_answer',
        text: 'How much does premium membership cost per year?',
        maxWords: 2,
      },
      {
        id: 'l4-q4',
        type: 'multiple_choice',
        text: 'How many items can standard members borrow at once?',
        options: ['A) 5 items', 'B) 8 items', 'C) 12 items', 'D) 15 items'],
      },
      {
        id: 'l4-q5',
        type: 'short_answer',
        text: 'How long can books be borrowed for?',
        maxWords: 2,
      },
      {
        id: 'l4-q6',
        type: 'short_answer',
        text: 'What is the daily fine for late DVDs?',
        maxWords: 2,
      },
      {
        id: 'l4-q7',
        type: 'short_answer',
        text: 'What time does the library close on Saturdays?',
        maxWords: 2,
      },
      {
        id: 'l4-q8',
        type: 'short_answer',
        text: 'On which day are story time sessions held?',
        maxWords: 1,
      },
    ],
    answers: {
      'l4-q1': 'Thomas Henderson',
      'l4-q2': 'WF7 3PQ',
      'l4-q3': '12 pounds',
      'l4-q4': 'B',
      'l4-q5': '3 weeks',
      'l4-q6': '50 pence',
      'l4-q7': '4 p.m.',
      'l4-q8': 'Wednesday',
    },
    difficultyBand: 5.5,
    section: 1,
  },
  {
    id: 'listening-005',
    title: 'Section 2: Campus Facilities Tour',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    accent: 'american',
    transcript: `Good morning, everyone, and welcome to Lakewood University! I'm Jessica, and I'll be your guide for today's campus facilities tour. We have a lot to cover, so let's get started.

We're currently standing in the main plaza, which is the heart of campus life. The building directly behind me is the Student Center, which houses the cafeteria, a coffee shop, the campus bookstore, and various student organization offices. The cafeteria is open from seven a.m. to nine p.m. on weekdays and offers meal plans ranging from ten to twenty-one meals per week.

To your left is the Recreation Center, which we just completed renovating last summer. It features an Olympic-sized swimming pool, basketball and volleyball courts, a fully-equipped fitness center, and a rock climbing wall. All full-time students get free access with their student ID. The center is open from six a.m. to eleven p.m. daily.

Walking north from here, you'll find the Academic Commons, our main library. It has over two million volumes and provides study spaces for more than a thousand students. There are individual study carrels on the upper floors and group study rooms that you can reserve online. During finals week, the library stays open twenty-four hours.

The building with the glass facade to your right is the Science and Technology Center. It houses state-of-the-art laboratories, including our new robotics lab that opened in January. All engineering and natural science classes are held there.

Now, if you'll follow me this way, we'll head toward the residence halls. Freshmen are required to live on campus and are typically assigned to either Maple Hall or Cedar Hall. Both buildings were renovated three years ago and feature suite-style living with shared common areas. Each floor has a resident advisor, and there's a twenty-four-hour security desk at each entrance.

For those of you with cars, student parking is available in Lot C, which is about a five-minute walk from the main plaza. Parking permits cost two hundred dollars per semester. However, I'd recommend using our free shuttle service, which runs every fifteen minutes between campus and the downtown transit station.

Are there any questions so far? Great, let's continue to the Performing Arts Center.`,
    questions: [
      {
        id: 'l5-q1',
        type: 'short_answer',
        text: "What is the tour guide's name?",
        maxWords: 1,
      },
      {
        id: 'l5-q2',
        type: 'short_answer',
        text: 'What time does the cafeteria close on weekdays?',
        maxWords: 2,
      },
      {
        id: 'l5-q3',
        type: 'multiple_choice',
        text: 'When was the Recreation Center renovated?',
        options: ['A) Last winter', 'B) Last summer', 'C) Two years ago', 'D) Three years ago'],
      },
      {
        id: 'l5-q4',
        type: 'short_answer',
        text: 'How many volumes does the library have?',
        maxWords: 3,
      },
      {
        id: 'l5-q5',
        type: 'short_answer',
        text: 'When did the new robotics lab open?',
        maxWords: 1,
      },
      {
        id: 'l5-q6',
        type: 'true_false_ng',
        text: 'Freshmen can choose whether to live on or off campus.',
      },
      {
        id: 'l5-q7',
        type: 'short_answer',
        text: 'How much does a parking permit cost per semester?',
        maxWords: 2,
      },
      {
        id: 'l5-q8',
        type: 'short_answer',
        text: 'How often does the shuttle service run?',
        maxWords: 3,
      },
    ],
    answers: {
      'l5-q1': 'Jessica',
      'l5-q2': '9 p.m.',
      'l5-q3': 'B',
      'l5-q4': 'two million',
      'l5-q5': 'January',
      'l5-q6': 'FALSE',
      'l5-q7': '200 dollars',
      'l5-q8': 'every 15 minutes',
    },
    difficultyBand: 6.0,
    section: 2,
  },
  {
    id: 'listening-006',
    title: 'Section 3: Research Project Discussion',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    accent: 'australian',
    transcript: `Dr. Walsh: G'day, Emma and Liam. Thanks for coming in. I wanted to chat about your joint research project on sustainable agriculture. How's it progressing?

Emma: Thanks for seeing us, Dr. Walsh. We've made good progress on the literature review. We've identified about forty relevant studies so far.

Liam: Yeah, and we've narrowed our focus to vertical farming technologies, specifically looking at water usage efficiency compared to traditional farming methods.

Dr. Walsh: That's a solid angle. What's your hypothesis at this stage?

Emma: We're predicting that vertical farms use at least seventy percent less water than conventional farms for the same crop yield.

Dr. Walsh: That's quite a specific claim. What evidence are you basing that on?

Liam: There are several case studies from Singapore and Japan that show water reductions between sixty-five and ninety percent. We want to verify these figures using local data.

Dr. Walsh: Speaking of local data, have you made contact with any farms in the region?

Emma: Yes, actually. We've arranged to visit GreenTech Farms next Thursday. They run one of the largest vertical farming operations in Queensland. They've agreed to share their water consumption data with us.

Dr. Walsh: Brilliant. That's exactly the kind of primary research that will strengthen your project. What about your methodology?

Liam: We're planning a comparative analysis. We'll collect data from three vertical farms and three traditional farms growing similar crops—mainly lettuce and herbs—over a three-month period.

Dr. Walsh: Three months should give you reliable seasonal data. How will you control for variables like crop type and growth stage?

Emma: We've created a standardized data collection template that accounts for those factors. Each farm will record daily water usage, crop weights, and environmental conditions.

Dr. Walsh: Very thorough. Now, what's your timeline looking like?

Liam: Data collection runs from March to May. We'll spend June analyzing the results, and we're aiming to have the first draft ready by mid-July.

Dr. Walsh: That gives you a good buffer before the August deadline. One last thing—have you considered the economic aspects? Water efficiency is important, but farms also need to be financially viable.

Emma: That's a great point. We hadn't included economic analysis initially, but we could add a section comparing operational costs.

Dr. Walsh: I'd recommend it. It would make your findings more relevant to industry practitioners. Right, I think you're on track. Let's meet again in three weeks to review your data collection progress.`,
    questions: [
      {
        id: 'l6-q1',
        type: 'short_answer',
        text: 'What is the main focus of Emma and Liam\'s research project?',
        maxWords: 3,
      },
      {
        id: 'l6-q2',
        type: 'short_answer',
        text: 'According to their hypothesis, how much less water do vertical farms use?',
        maxWords: 3,
      },
      {
        id: 'l6-q3',
        type: 'multiple_choice',
        text: 'Which countries have case studies the students are referencing?',
        options: [
          'A) China and Japan',
          'B) Singapore and Japan',
          'C) Singapore and South Korea',
          'D) Australia and Japan',
        ],
      },
      {
        id: 'l6-q4',
        type: 'short_answer',
        text: 'What is the name of the farm they will visit?',
        maxWords: 3,
      },
      {
        id: 'l6-q5',
        type: 'short_answer',
        text: 'How many farms in total will they collect data from?',
        maxWords: 1,
      },
      {
        id: 'l6-q6',
        type: 'short_answer',
        text: 'What crops will be studied?',
        maxWords: 3,
      },
      {
        id: 'l6-q7',
        type: 'short_answer',
        text: 'When is the first draft due?',
        maxWords: 2,
      },
      {
        id: 'l6-q8',
        type: 'multiple_choice',
        text: 'What additional aspect does Dr. Walsh suggest they include?',
        options: [
          'A) Environmental impact',
          'B) Economic analysis',
          'C) Climate data',
          'D) Consumer surveys',
        ],
      },
    ],
    answers: {
      'l6-q1': 'vertical farming',
      'l6-q2': '70 percent',
      'l6-q3': 'B',
      'l6-q4': 'GreenTech Farms',
      'l6-q5': '6',
      'l6-q6': 'lettuce and herbs',
      'l6-q7': 'mid-July',
      'l6-q8': 'B',
    },
    difficultyBand: 6.5,
    section: 3,
  },
  {
    id: 'listening-007',
    title: 'Section 4: Lecture on Marine Biology - Bioluminescence',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    accent: 'british',
    transcript: `Good morning, everyone. Today we'll be examining one of the ocean's most fascinating phenomena: bioluminescence—the ability of living organisms to produce light through chemical reactions within their bodies.

Bioluminescence occurs in a remarkable variety of marine creatures. It's estimated that approximately seventy-six percent of deep-sea animals are bioluminescent. This includes fish, jellyfish, squid, crustaceans, and even some species of sharks. The light is typically produced through the oxidation of a molecule called luciferin, catalyzed by an enzyme called luciferase.

Now, why would an organism evolve the ability to produce light? There are several important functions. First, and perhaps most commonly, bioluminescence is used for predation. The anglerfish is the classic example here. It possesses a modified dorsal spine that acts as a lure, dangling a glowing appendage in front of its mouth to attract prey in the darkness of the deep sea.

Second, bioluminescence serves a defensive purpose. When threatened, some species, like certain squid, release clouds of luminescent mucus to confuse predators—much like the ink of an octopus, but with added visual impact. Others, such as the firefly squid, can illuminate their entire body, potentially to eliminate their shadow and avoid detection by predators lurking below.

Third, many species use light for communication and mate attraction. Deep-sea dragonfish, for instance, can produce species-specific light patterns to identify potential mates in the vast darkness of the ocean depths.

Let's talk about the mechanics of this light production. Unlike traditional light sources, bioluminescence is remarkably efficient. Normal light bulbs convert only about ten percent of energy into visible light, with the rest lost as heat. Bioluminescent reactions, however, convert approximately ninety percent of energy directly into light—what scientists call "cold light."

The color of bioluminescent light varies depending on the organism and its environment. Most deep-sea creatures produce blue or green light, as these wavelengths travel furthest through water. However, some species, like the loosejaw dragonfish, can produce far-red light, which is invisible to most marine creatures but allows the dragonfish to illuminate prey without being detected.

Research into bioluminescence has significant practical applications. Scientists have successfully isolated and cloned the genes responsible for light production, creating glowing laboratory mice and fish for research purposes. Medical researchers are now using bioluminescent markers to track cancer cells and study disease progression in real time.

For your assignment due next week, I'd like you to select one bioluminescent organism and analyze how its light production has evolved as an adaptation to its specific ecological niche.`,
    questions: [
      {
        id: 'l7-q1',
        type: 'short_answer',
        text: 'What percentage of deep-sea animals are bioluminescent?',
        maxWords: 2,
      },
      {
        id: 'l7-q2',
        type: 'short_answer',
        text: 'What molecule is oxidized to produce bioluminescent light?',
        maxWords: 1,
      },
      {
        id: 'l7-q3',
        type: 'multiple_choice',
        text: 'Which fish is given as an example of using bioluminescence for predation?',
        options: ['A) Dragonfish', 'B) Anglerfish', 'C) Shark', 'D) Firefly squid'],
      },
      {
        id: 'l7-q4',
        type: 'short_answer',
        text: 'What do some squid release to confuse predators?',
        maxWords: 2,
      },
      {
        id: 'l7-q5',
        type: 'short_answer',
        text: 'What percentage of energy do bioluminescent reactions convert to light?',
        maxWords: 2,
      },
      {
        id: 'l7-q6',
        type: 'multiple_choice',
        text: 'Why do most deep-sea creatures produce blue or green light?',
        options: [
          'A) It attracts more prey',
          'B) These wavelengths travel furthest through water',
          'C) It is invisible to predators',
          'D) It requires less energy to produce',
        ],
      },
      {
        id: 'l7-q7',
        type: 'short_answer',
        text: 'What color light can the loosejaw dragonfish produce?',
        maxWords: 2,
      },
      {
        id: 'l7-q8',
        type: 'short_answer',
        text: 'What are medical researchers using bioluminescent markers to track?',
        maxWords: 2,
      },
    ],
    answers: {
      'l7-q1': '76 percent',
      'l7-q2': 'luciferin',
      'l7-q3': 'B',
      'l7-q4': 'luminescent mucus',
      'l7-q5': '90 percent',
      'l7-q6': 'B',
      'l7-q7': 'far-red',
      'l7-q8': 'cancer cells',
    },
    difficultyBand: 7.0,
    section: 4,
  },
  {
    id: 'listening-008',
    title: 'Section 1: Hotel Reservation',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    accent: 'american',
    transcript: `Receptionist: Good afternoon, Riverside Grand Hotel. This is Amanda speaking. How may I assist you?

Caller: Hi, I'd like to make a reservation for next month.

Receptionist: Of course. What dates were you looking at?

Caller: I need a room from March fifteenth through the eighteenth. That's three nights.

Receptionist: Let me check our availability. And how many guests will be staying?

Caller: Just two—myself and my husband. My name is Catherine Brooks, by the way.

Receptionist: Thank you, Mrs. Brooks. For those dates, we have standard rooms available at one hundred and twenty-nine dollars per night, or deluxe rooms with a river view at one hundred and seventy-nine dollars.

Caller: What's included in the deluxe room?

Receptionist: The deluxe rooms are larger, about four hundred square feet, and they include a king-size bed, a sitting area, complimentary breakfast for two, and access to our executive lounge.

Caller: That sounds nice. Does the executive lounge have any special amenities?

Receptionist: Yes, it offers complimentary afternoon tea and evening appetizers, along with a business center with printing services.

Caller: We'll take the deluxe room then.

Receptionist: Excellent choice. Could I get a phone number for the reservation?

Caller: Sure, it's 555-0147.

Receptionist: And an email address for confirmation?

Caller: c.brooks@mailbox.com.

Receptionist: Perfect. Now, do you have any special requests?

Caller: Actually, yes. My husband has a severe nut allergy. Can you make a note about that for the restaurant?

Receptionist: Absolutely. I've flagged that in our system, and our kitchen staff will be informed. Is there anything else?

Caller: What time is check-in?

Receptionist: Check-in is at three p.m., and check-out is at eleven a.m. However, if you'd like to arrive earlier, we can store your luggage at the front desk.

Caller: That's helpful. We're flying in that morning. Our flight lands at ten-thirty.

Receptionist: We also offer airport shuttle service for thirty-five dollars each way, if you're interested.

Caller: Oh, yes please. Can you arrange a pickup for us?

Receptionist: Certainly. Just call us when you've collected your baggage, and we'll send a driver. The shuttle takes approximately forty minutes from the airport.

Caller: Wonderful. What's the total for the reservation?

Receptionist: Three nights in the deluxe room comes to five hundred and thirty-seven dollars, plus seventy dollars for the round-trip shuttle. Your total is six hundred and seven dollars before tax.

Caller: Great. I'll pay when I check in.

Receptionist: That's fine. We just need a credit card to hold the reservation.

Caller: Of course. It's a Visa, number 4532 7891 2345 6789.

Receptionist: Thank you, Mrs. Brooks. Your reservation is confirmed. You'll receive a confirmation email shortly.`,
    questions: [
      {
        id: 'l8-q1',
        type: 'short_answer',
        text: "What is the caller's full name?",
        maxWords: 2,
      },
      {
        id: 'l8-q2',
        type: 'short_answer',
        text: 'How many nights is the reservation for?',
        maxWords: 1,
      },
      {
        id: 'l8-q3',
        type: 'short_answer',
        text: 'How much does the deluxe room cost per night?',
        maxWords: 2,
      },
      {
        id: 'l8-q4',
        type: 'multiple_choice',
        text: 'What is included with the deluxe room?',
        options: [
          'A) Airport shuttle',
          'B) Complimentary breakfast',
          'C) Spa access',
          'D) Free parking',
        ],
      },
      {
        id: 'l8-q5',
        type: 'short_answer',
        text: 'What allergy does the caller\'s husband have?',
        maxWords: 1,
      },
      {
        id: 'l8-q6',
        type: 'short_answer',
        text: 'What time is check-out?',
        maxWords: 2,
      },
      {
        id: 'l8-q7',
        type: 'short_answer',
        text: 'How long does the shuttle take from the airport?',
        maxWords: 2,
      },
      {
        id: 'l8-q8',
        type: 'short_answer',
        text: 'What is the total cost before tax?',
        maxWords: 2,
      },
    ],
    answers: {
      'l8-q1': 'Catherine Brooks',
      'l8-q2': '3',
      'l8-q3': '179 dollars',
      'l8-q4': 'B',
      'l8-q5': 'nut',
      'l8-q6': '11 a.m.',
      'l8-q7': '40 minutes',
      'l8-q8': '607 dollars',
    },
    difficultyBand: 5.5,
    section: 1,
  },
  {
    id: 'listening-009',
    title: 'Section 2: Local Festival Information',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    accent: 'british',
    transcript: `Good evening, and thank you for tuning in to Community Spotlight. I'm here to give you all the details about the upcoming Hartfield Summer Festival, which runs from the twenty-second to the twenty-fourth of July.

This year marks the festival's twenty-fifth anniversary, and the organizing committee has put together an exceptional programme. The festival will take place in Victoria Park, and entry is free for all three days, though some events require tickets.

Let's start with the opening ceremony. On Friday the twenty-second at six p.m., Mayor Thompson will officially open the festival with a speech, followed by a performance from the Hartfield Youth Orchestra. This will take place on the main stage near the park's east entrance.

Throughout the weekend, you'll find over eighty market stalls selling everything from handmade crafts to locally produced food. The food village, located near the lake, features cuisine from around the world—we've got Thai, Mexican, Italian, and of course, traditional British fare. Food stalls open at eleven a.m. each day.

For families, there's a dedicated children's zone with face painting, puppet shows, and a bouncy castle. The highlight for kids will be Saturday's treasure hunt, which starts at two p.m. from the information tent. Participation is free, and every child receives a small prize.

Music lovers will want to check out the acoustic tent, where local bands perform from noon until eight p.m. On Saturday evening, headline act "The Riverside Collective" will take the main stage at seven-thirty. Tickets for this concert are fifteen pounds and can be purchased online or at the festival box office.

For those interested in learning something new, we're running free workshops throughout the weekend. There's a pottery class on Saturday morning, a photography walk on Sunday at ten a.m., and cooking demonstrations every afternoon at three p.m.

A few practical matters: parking is available at the recreation ground on Mill Lane, about a ten-minute walk from the park. The parking fee is five pounds for the full day. Alternatively, a free shuttle bus runs every twenty minutes from the town center.

In case of rain, most activities will continue, as we've arranged marquees for the market stalls and performance areas. However, some outdoor activities may be cancelled—please check our social media pages for updates on the day.

For more information, visit our website at hartfieldfestival.co.uk, or pick up a programme from the town hall or local library. We look forward to seeing you there!`,
    questions: [
      {
        id: 'l9-q1',
        type: 'short_answer',
        text: 'What anniversary is the festival celebrating this year?',
        maxWords: 1,
      },
      {
        id: 'l9-q2',
        type: 'short_answer',
        text: 'Where will the festival be held?',
        maxWords: 2,
      },
      {
        id: 'l9-q3',
        type: 'short_answer',
        text: 'What time does the opening ceremony begin?',
        maxWords: 2,
      },
      {
        id: 'l9-q4',
        type: 'multiple_choice',
        text: 'Where is the food village located?',
        options: [
          'A) Near the east entrance',
          'B) Near the lake',
          'C) In the children\'s zone',
          'D) At the recreation ground',
        ],
      },
      {
        id: 'l9-q5',
        type: 'short_answer',
        text: 'What time does the treasure hunt start on Saturday?',
        maxWords: 2,
      },
      {
        id: 'l9-q6',
        type: 'short_answer',
        text: 'How much do tickets cost for the headline concert?',
        maxWords: 2,
      },
      {
        id: 'l9-q7',
        type: 'short_answer',
        text: 'What is the daily parking fee?',
        maxWords: 2,
      },
      {
        id: 'l9-q8',
        type: 'true_false_ng',
        text: 'All activities will be cancelled if it rains.',
      },
    ],
    answers: {
      'l9-q1': '25th',
      'l9-q2': 'Victoria Park',
      'l9-q3': '6 p.m.',
      'l9-q4': 'B',
      'l9-q5': '2 p.m.',
      'l9-q6': '15 pounds',
      'l9-q7': '5 pounds',
      'l9-q8': 'FALSE',
    },
    difficultyBand: 6.0,
    section: 2,
  },
  {
    id: 'listening-010',
    title: 'Section 3: Student Thesis Meeting',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    accent: 'australian',
    transcript: `Dr. Chen: Alright, Sophie, let's have a look at where you're at with your thesis on renewable energy adoption in rural communities. How's the writing going?

Sophie: Thanks for meeting with me, Dr. Chen. I've completed the first three chapters—introduction, literature review, and methodology. I'm currently working on the data analysis.

Dr. Chen: Good progress. Have you finished collecting all your survey responses?

Sophie: Yes, I received two hundred and forty-seven completed surveys from residents across five rural districts. The response rate was about sixty-two percent, which I'm quite pleased with.

Dr. Chen: That's actually above average for postal surveys. What about your interviews?

Sophie: I conducted eighteen semi-structured interviews with local council members, business owners, and community leaders. I finished transcribing them last week—it took ages, but it's done now.

Dr. Chen: Excellent. So what patterns are emerging from the data?

Sophie: Well, there are some interesting findings. The main barrier to solar panel adoption isn't cost, as I initially hypothesized. It's actually lack of information. Seventy-three percent of respondents said they didn't know enough about government subsidies and installation processes.

Dr. Chen: That's significant. Does that vary by age group?

Sophie: Interestingly, yes. Residents over sixty-five were actually more likely to have installed solar panels than those aged thirty to forty-five. The older group had more time to research and were more motivated by reducing electricity bills.

Dr. Chen: That contradicts the common assumption about technology adoption among older populations. Make sure you explore that in your discussion chapter.

Sophie: I definitely will. Another finding is that community trust plays a huge role. In districts where local tradespeople offered installation services, adoption rates were thirty-five percent higher than in areas relying on outside contractors.

Dr. Chen: That's a really valuable insight. It suggests policy implications for supporting local businesses in the renewable energy sector. Have you thought about your recommendations chapter yet?

Sophie: I've started drafting some ideas. I'm thinking of recommending targeted information campaigns through community centers, partnering with local trade schools for installer training, and establishing community solar buying groups.

Dr. Chen: Those sound practical and grounded in your findings. Now, let's talk timeline. When do you expect to have a complete first draft?

Sophie: I'm aiming for the twentieth of April. That gives me about eight weeks.

Dr. Chen: And the deadline for final submission is mid-June, correct?

Sophie: Yes, June fifteenth. I want to leave time for revisions and the external examiner's review.

Dr. Chen: Smart planning. Let's meet again in four weeks to review your analysis chapters. Book a slot through the online system.

Sophie: Will do. Thanks so much, Dr. Chen.`,
    questions: [
      {
        id: 'l10-q1',
        type: 'short_answer',
        text: 'What is the topic of Sophie\'s thesis?',
        maxWords: 5,
      },
      {
        id: 'l10-q2',
        type: 'short_answer',
        text: 'How many survey responses did Sophie receive?',
        maxWords: 1,
      },
      {
        id: 'l10-q3',
        type: 'short_answer',
        text: 'What was the survey response rate?',
        maxWords: 2,
      },
      {
        id: 'l10-q4',
        type: 'multiple_choice',
        text: 'According to Sophie\'s findings, what is the main barrier to solar panel adoption?',
        options: ['A) Cost', 'B) Lack of information', 'C) Technical difficulties', 'D) Aesthetic concerns'],
      },
      {
        id: 'l10-q5',
        type: 'short_answer',
        text: 'Which age group was more likely to have installed solar panels?',
        maxWords: 2,
      },
      {
        id: 'l10-q6',
        type: 'short_answer',
        text: 'By what percentage were adoption rates higher in areas with local tradespeople?',
        maxWords: 2,
      },
      {
        id: 'l10-q7',
        type: 'short_answer',
        text: 'When does Sophie aim to complete her first draft?',
        maxWords: 3,
      },
      {
        id: 'l10-q8',
        type: 'short_answer',
        text: 'When is the final submission deadline?',
        maxWords: 2,
      },
    ],
    answers: {
      'l10-q1': 'renewable energy adoption',
      'l10-q2': '247',
      'l10-q3': '62 percent',
      'l10-q4': 'B',
      'l10-q5': 'over 65',
      'l10-q6': '35 percent',
      'l10-q7': '20th April',
      'l10-q8': 'June 15th',
    },
    difficultyBand: 7.0,
    section: 3,
  },
];
