// IELTS Task 1 General Training Prompts
// These prompts require letter writing (formal, semi-formal, informal)

export interface Task1GTPrompt {
  id: string;
  title: string;
  prompt: string;
  topic: string;
  letterType: 'formal' | 'semi-formal' | 'informal';
  difficultyBand: number;
}

export const task1GTPrompts: Task1GTPrompt[] = [
  // FORMAL LETTERS (10)
  {
    id: 'task1g-001',
    title: 'Complaint: Faulty Product',
    prompt: `You recently purchased a laptop online, but when it arrived, you discovered it was damaged and not working properly.

Write a letter to the company. In your letter:
- describe the product you bought and when you bought it
- explain what the problem is
- say what action you would like the company to take

Write at least 150 words.

You do NOT need to write any addresses.

Begin your letter as follows:
Dear Sir or Madam,`,
    topic: 'consumer',
    letterType: 'formal',
    difficultyBand: 6.0,
  },
  {
    id: 'task1g-002',
    title: 'Job Application',
    prompt: `You have seen an advertisement for a part-time job at a local museum which interests you.

Write a letter applying for the job. In your letter:
- explain why you are interested in this job
- describe any relevant experience or skills you have
- say when you would be available for an interview

Write at least 150 words.

You do NOT need to write any addresses.

Begin your letter as follows:
Dear Sir or Madam,`,
    topic: 'work',
    letterType: 'formal',
    difficultyBand: 6.0,
  },
  {
    id: 'task1g-003',
    title: 'Request for Information',
    prompt: `You are planning to study at a university in an English-speaking country and need more information about their accommodation options.

Write a letter to the university. In your letter:
- introduce yourself and explain your situation
- ask about the types of accommodation available
- inquire about costs and application deadlines

Write at least 150 words.

You do NOT need to write any addresses.

Begin your letter as follows:
Dear Sir or Madam,`,
    topic: 'education',
    letterType: 'formal',
    difficultyBand: 6.0,
  },
  {
    id: 'task1g-004',
    title: 'Complaint: Poor Service',
    prompt: `You recently stayed at a hotel and were very disappointed with the quality of service you received.

Write a letter to the hotel manager. In your letter:
- give details about your stay (dates, room type)
- describe the problems you experienced
- explain what you expect the hotel to do

Write at least 150 words.

You do NOT need to write any addresses.

Begin your letter as follows:
Dear Sir or Madam,`,
    topic: 'travel',
    letterType: 'formal',
    difficultyBand: 6.5,
  },
  {
    id: 'task1g-005',
    title: 'Request for Refund',
    prompt: `You booked a tour through a travel agency, but the tour was cancelled at the last minute and you have not received a refund.

Write a letter to the travel agency. In your letter:
- give details of the tour you booked
- explain what happened and how it affected you
- request a full refund and compensation

Write at least 150 words.

You do NOT need to write any addresses.

Begin your letter as follows:
Dear Sir or Madam,`,
    topic: 'travel',
    letterType: 'formal',
    difficultyBand: 6.5,
  },
  {
    id: 'task1g-006',
    title: 'Complaint: Noise Pollution',
    prompt: `A factory has recently opened near your home and is causing noise pollution that is affecting your daily life.

Write a letter to the local council. In your letter:
- describe where you live and the nature of the problem
- explain how the noise is affecting you and your family
- suggest what action the council should take

Write at least 150 words.

You do NOT need to write any addresses.

Begin your letter as follows:
Dear Sir or Madam,`,
    topic: 'environment',
    letterType: 'formal',
    difficultyBand: 6.5,
  },
  {
    id: 'task1g-007',
    title: 'Application for Course',
    prompt: `You want to enroll in a professional development course offered by a training institute.

Write a letter to the institute. In your letter:
- explain which course you are interested in
- describe your current job and why you need this training
- ask about course schedules and fees

Write at least 150 words.

You do NOT need to write any addresses.

Begin your letter as follows:
Dear Sir or Madam,`,
    topic: 'education',
    letterType: 'formal',
    difficultyBand: 6.0,
  },
  {
    id: 'task1g-008',
    title: 'Request for Meeting',
    prompt: `You are a customer who has been having ongoing problems with a product or service. You have already contacted customer service several times without resolution.

Write a letter to the company's head office. In your letter:
- summarize your previous attempts to resolve the issue
- explain why you are now writing to the head office
- request a meeting with a senior manager

Write at least 150 words.

You do NOT need to write any addresses.

Begin your letter as follows:
Dear Sir or Madam,`,
    topic: 'consumer',
    letterType: 'formal',
    difficultyBand: 7.0,
  },
  {
    id: 'task1g-009',
    title: 'Suggestion to Local Authority',
    prompt: `You believe that your local area would benefit from having a new public park.

Write a letter to the local council. In your letter:
- describe the area and why it needs a park
- explain the benefits a park would bring
- suggest how the council could fund and develop this project

Write at least 150 words.

You do NOT need to write any addresses.

Begin your letter as follows:
Dear Sir or Madam,`,
    topic: 'community',
    letterType: 'formal',
    difficultyBand: 6.5,
  },
  {
    id: 'task1g-010',
    title: 'Insurance Claim',
    prompt: `Your car was damaged while parked in a public car park. You need to file a claim with your insurance company.

Write a letter to your insurance company. In your letter:
- provide details of when and where the incident occurred
- describe the damage to your vehicle
- explain what documentation you are including with the claim

Write at least 150 words.

You do NOT need to write any addresses.

Begin your letter as follows:
Dear Sir or Madam,`,
    topic: 'finance',
    letterType: 'formal',
    difficultyBand: 6.5,
  },

  // SEMI-FORMAL LETTERS (10)
  {
    id: 'task1g-011',
    title: 'Letter to Landlord: Maintenance Request',
    prompt: `There are some problems with the apartment you are renting that need to be fixed.

Write a letter to your landlord. In your letter:
- describe the problems with the apartment
- explain how these problems are affecting your daily life
- request that repairs be carried out soon

Write at least 150 words.

You do NOT need to write any addresses.

Begin your letter as follows:
Dear Mr. Thompson,`,
    topic: 'housing',
    letterType: 'semi-formal',
    difficultyBand: 6.0,
  },
  {
    id: 'task1g-012',
    title: 'Letter to Manager: Time Off Request',
    prompt: `You need to take some time off work for personal reasons.

Write a letter to your manager. In your letter:
- explain why you need time off
- say how long you will need to be away
- suggest how your work could be covered while you are absent

Write at least 150 words.

You do NOT need to write any addresses.

Begin your letter as follows:
Dear Mrs. Johnson,`,
    topic: 'work',
    letterType: 'semi-formal',
    difficultyBand: 6.0,
  },
  {
    id: 'task1g-013',
    title: 'Letter to Teacher: Child Absence',
    prompt: `Your child has been absent from school for the past week due to illness and will need more time to recover.

Write a letter to your child's teacher. In your letter:
- explain why your child has been absent
- describe how your child is progressing
- ask about any work your child needs to catch up on

Write at least 150 words.

You do NOT need to write any addresses.

Begin your letter as follows:
Dear Mr. Roberts,`,
    topic: 'education',
    letterType: 'semi-formal',
    difficultyBand: 6.0,
  },
  {
    id: 'task1g-014',
    title: 'Letter to Colleague: Project Handover',
    prompt: `You are leaving your current job and need to hand over your project responsibilities to a colleague.

Write a letter to your colleague. In your letter:
- explain which projects you are handing over
- provide key information about current progress
- offer to help with the transition if needed

Write at least 150 words.

You do NOT need to write any addresses.

Begin your letter as follows:
Dear Sarah,`,
    topic: 'work',
    letterType: 'semi-formal',
    difficultyBand: 6.5,
  },
  {
    id: 'task1g-015',
    title: 'Letter to Neighbor: Upcoming Event',
    prompt: `You are planning to hold a party at your home and want to inform your neighbors in advance.

Write a letter to your neighbor. In your letter:
- explain when and why you are having the party
- describe what they might expect (noise, parking, etc.)
- apologize for any inconvenience and provide your contact details

Write at least 150 words.

You do NOT need to write any addresses.

Begin your letter as follows:
Dear Mrs. Wilson,`,
    topic: 'community',
    letterType: 'semi-formal',
    difficultyBand: 6.0,
  },
  {
    id: 'task1g-016',
    title: 'Letter to Manager: Workplace Improvement',
    prompt: `You have an idea that could improve efficiency or working conditions in your workplace.

Write a letter to your manager. In your letter:
- describe your idea
- explain how it would benefit the company
- suggest how it could be implemented

Write at least 150 words.

You do NOT need to write any addresses.

Begin your letter as follows:
Dear Mr. Chen,`,
    topic: 'work',
    letterType: 'semi-formal',
    difficultyBand: 6.5,
  },
  {
    id: 'task1g-017',
    title: 'Letter to Landlord: Early Lease Termination',
    prompt: `Due to a job relocation, you need to end your rental agreement earlier than planned.

Write a letter to your landlord. In your letter:
- explain your situation and why you need to leave early
- propose a date when you would like to move out
- discuss how you would like to handle the deposit and remaining rent

Write at least 150 words.

You do NOT need to write any addresses.

Begin your letter as follows:
Dear Ms. Patel,`,
    topic: 'housing',
    letterType: 'semi-formal',
    difficultyBand: 6.5,
  },
  {
    id: 'task1g-018',
    title: 'Letter to Sports Club Coach',
    prompt: `You are a member of a local sports club and would like to suggest some changes to the training schedule.

Write a letter to the coach. In your letter:
- explain why you think changes are needed
- describe what changes you would like to suggest
- offer to help organize any new arrangements

Write at least 150 words.

You do NOT need to write any addresses.

Begin your letter as follows:
Dear Coach Martinez,`,
    topic: 'sports',
    letterType: 'semi-formal',
    difficultyBand: 6.0,
  },
  {
    id: 'task1g-019',
    title: 'Letter to Manager: Resignation',
    prompt: `You have decided to resign from your current position to pursue further studies.

Write a letter to your manager. In your letter:
- explain that you are resigning and why
- express gratitude for the opportunities you have had
- offer to help with the transition period

Write at least 150 words.

You do NOT need to write any addresses.

Begin your letter as follows:
Dear Mr. Williams,`,
    topic: 'work',
    letterType: 'semi-formal',
    difficultyBand: 6.5,
  },
  {
    id: 'task1g-020',
    title: 'Letter to Course Tutor',
    prompt: `You are taking an evening course but have been having difficulty attending recently due to work commitments.

Write a letter to your course tutor. In your letter:
- explain why you have been missing classes
- describe how you have been keeping up with the work
- ask about options for completing the course

Write at least 150 words.

You do NOT need to write any addresses.

Begin your letter as follows:
Dear Dr. Adams,`,
    topic: 'education',
    letterType: 'semi-formal',
    difficultyBand: 6.5,
  },

  // INFORMAL LETTERS (12)
  {
    id: 'task1g-021',
    title: 'Invitation to Visit',
    prompt: `You have recently moved to a new city and want to invite an old friend to come and visit you.

Write a letter to your friend. In your letter:
- describe your new home and the city
- suggest some activities you could do together
- propose some dates for the visit

Write at least 150 words.

You do NOT need to write any addresses.

Begin your letter as follows:
Hi James,`,
    topic: 'friendship',
    letterType: 'informal',
    difficultyBand: 5.5,
  },
  {
    id: 'task1g-022',
    title: 'Thank You Letter',
    prompt: `A friend recently helped you during a difficult time in your life.

Write a letter to your friend. In your letter:
- thank them for their help
- explain how their support made a difference
- suggest meeting up soon to catch up

Write at least 150 words.

You do NOT need to write any addresses.

Begin your letter as follows:
Dear Emma,`,
    topic: 'friendship',
    letterType: 'informal',
    difficultyBand: 5.5,
  },
  {
    id: 'task1g-023',
    title: 'Sharing News',
    prompt: `You have recently started a new job that you are very excited about.

Write a letter to a friend who lives abroad. In your letter:
- describe your new job and workplace
- explain what you like about it
- ask about what is happening in their life

Write at least 150 words.

You do NOT need to write any addresses.

Begin your letter as follows:
Hi Sophie,`,
    topic: 'work',
    letterType: 'informal',
    difficultyBand: 5.5,
  },
  {
    id: 'task1g-024',
    title: 'Recommending a Place',
    prompt: `Your friend is planning to visit your country and has asked for recommendations about places to visit.

Write a letter to your friend. In your letter:
- suggest some places they should visit
- describe what makes these places special
- give some practical travel tips

Write at least 150 words.

You do NOT need to write any addresses.

Begin your letter as follows:
Dear Tom,`,
    topic: 'travel',
    letterType: 'informal',
    difficultyBand: 6.0,
  },
  {
    id: 'task1g-025',
    title: 'Congratulations Letter',
    prompt: `Your friend has recently graduated from university and got their first job.

Write a letter to your friend. In your letter:
- congratulate them on their achievements
- ask about their new job
- suggest celebrating together

Write at least 150 words.

You do NOT need to write any addresses.

Begin your letter as follows:
Hi Lisa,`,
    topic: 'friendship',
    letterType: 'informal',
    difficultyBand: 5.5,
  },
  {
    id: 'task1g-026',
    title: 'Advice Letter',
    prompt: `A friend is thinking about moving to the city where you live and has asked for your advice.

Write a letter to your friend. In your letter:
- describe the advantages and disadvantages of living in your city
- give some advice about finding accommodation
- offer to help them when they arrive

Write at least 150 words.

You do NOT need to write any addresses.

Begin your letter as follows:
Dear Michael,`,
    topic: 'lifestyle',
    letterType: 'informal',
    difficultyBand: 6.0,
  },
  {
    id: 'task1g-027',
    title: 'Apology Letter',
    prompt: `You borrowed something from a friend and accidentally damaged it.

Write a letter to your friend. In your letter:
- apologize for what happened
- explain how the damage occurred
- offer to replace or repair the item

Write at least 150 words.

You do NOT need to write any addresses.

Begin your letter as follows:
Hi Rachel,`,
    topic: 'friendship',
    letterType: 'informal',
    difficultyBand: 6.0,
  },
  {
    id: 'task1g-028',
    title: 'Cancelling Plans',
    prompt: `You arranged to meet a friend next weekend but now you need to cancel because of an unexpected situation.

Write a letter to your friend. In your letter:
- apologize for having to cancel
- explain why you can no longer meet
- suggest another time to meet

Write at least 150 words.

You do NOT need to write any addresses.

Begin your letter as follows:
Dear Alex,`,
    topic: 'friendship',
    letterType: 'informal',
    difficultyBand: 5.5,
  },
  {
    id: 'task1g-029',
    title: 'Sharing Holiday Experience',
    prompt: `You recently went on an amazing holiday and want to tell your friend about it.

Write a letter to your friend. In your letter:
- describe where you went and what you did
- share some highlights of the trip
- recommend the destination to your friend

Write at least 150 words.

You do NOT need to write any addresses.

Begin your letter as follows:
Hi David,`,
    topic: 'travel',
    letterType: 'informal',
    difficultyBand: 5.5,
  },
  {
    id: 'task1g-030',
    title: 'Invitation to Wedding',
    prompt: `You are getting married and want to personally invite your close friend who lives in another country.

Write a letter to your friend. In your letter:
- share your exciting news
- give details about the wedding (date, location)
- offer help with travel and accommodation arrangements

Write at least 150 words.

You do NOT need to write any addresses.

Begin your letter as follows:
Dear Jessica,`,
    topic: 'celebration',
    letterType: 'informal',
    difficultyBand: 6.0,
  },
  {
    id: 'task1g-031',
    title: 'Asking for Advice',
    prompt: `You are thinking about learning a new skill or hobby and want your friend's advice.

Write a letter to your friend. In your letter:
- explain what skill or hobby you are interested in
- say why you want to learn it
- ask for their advice and recommendations

Write at least 150 words.

You do NOT need to write any addresses.

Begin your letter as follows:
Hi Kate,`,
    topic: 'hobbies',
    letterType: 'informal',
    difficultyBand: 5.5,
  },
  {
    id: 'task1g-032',
    title: 'Returning a Favor',
    prompt: `A friend helped you significantly in the past, and now you have an opportunity to help them.

Write a letter to your friend. In your letter:
- remind them of how they helped you before
- explain how you can now help them
- express how happy you are to return the favor

Write at least 150 words.

You do NOT need to write any addresses.

Begin your letter as follows:
Dear Chris,`,
    topic: 'friendship',
    letterType: 'informal',
    difficultyBand: 6.0,
  },
];
