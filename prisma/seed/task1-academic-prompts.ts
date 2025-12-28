// IELTS Task 1 Academic Prompts
// These prompts require visual data interpretation (charts, graphs, maps, processes)

export interface Task1AcademicPrompt {
  id: string;
  title: string;
  prompt: string;
  topic: string;
  visualType: 'line_graph' | 'bar_chart' | 'pie_chart' | 'table' | 'map' | 'process' | 'mixed';
  imageUrl: string;
  imageDescription: string; // Alt text and context for accessibility
  difficultyBand: number;
  isFree?: boolean; // Whether this prompt is available to free tier users
}

export const task1AcademicPrompts: Task1AcademicPrompt[] = [
  // LINE GRAPHS (10)
  {
    id: 'task1a-001',
    title: 'Internet Usage Trends',
    prompt: `The graph below shows the percentage of households with internet access in three different countries between 2000 and 2020.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    topic: 'technology',
    visualType: 'line_graph',
    imageUrl: '/images/task1/line-graphs/internet-usage.svg',
    imageDescription:
      'Line graph showing internet access percentages for USA (starting at 40% in 2000, rising to 92% in 2020), UK (starting at 25% in 2000, rising to 95% in 2020), and Brazil (starting at 5% in 2000, rising to 75% in 2020)',
    difficultyBand: 6.0,
    isFree: true, // Free tier access
  },
  {
    id: 'task1a-002',
    title: 'Population Growth',
    prompt: `The line graph below shows population growth in four Asian countries from 1950 to 2050 (with projections after 2020).

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    topic: 'demographics',
    visualType: 'line_graph',
    imageUrl: '/images/task1/line-graphs/population-growth.svg',
    imageDescription:
      'Line graph showing population in millions for China (steady rise then decline after 2020), India (continuous rise overtaking China by 2030), Japan (decline from 2010), and Indonesia (steady growth)',
    difficultyBand: 6.5,
    isFree: true, // Free tier access
  },
  {
    id: 'task1a-003',
    title: 'Electricity Generation Sources',
    prompt: `The graph below shows the sources of electricity generation in Country X from 1980 to 2020.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    topic: 'energy',
    visualType: 'line_graph',
    imageUrl: '/images/task1/line-graphs/electricity-sources.svg',
    imageDescription:
      'Line graph showing electricity generation by source: coal (declining from 60% to 20%), natural gas (rising from 15% to 35%), nuclear (stable around 20%), and renewables (rising from 5% to 25%)',
    difficultyBand: 6.5,
    isFree: true, // Free tier access
  },
  {
    id: 'task1a-004',
    title: 'University Enrollment',
    prompt: `The graph below shows the number of students enrolled in higher education in three countries from 1990 to 2020.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    topic: 'education',
    visualType: 'line_graph',
    imageUrl: '/images/task1/line-graphs/university-enrollment.svg',
    imageDescription:
      'Line graph showing student enrollment in millions: USA (gradual increase from 13M to 20M), China (dramatic rise from 3M to 45M), and Germany (stable around 2-3M)',
    difficultyBand: 6.0,
  },
  {
    id: 'task1a-005',
    title: 'Tourism Revenue',
    prompt: `The line graph below shows tourism revenue in billions of dollars for four European countries from 2010 to 2022.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    topic: 'tourism',
    visualType: 'line_graph',
    imageUrl: '/images/task1/line-graphs/tourism-revenue.svg',
    imageDescription:
      'Line graph showing tourism revenue: France (highest, rising from $55B to $75B with sharp drop in 2020), Spain (second highest, similar pattern), Italy (third), Greece (lowest but steady growth). All show sharp decline in 2020 and recovery after.',
    difficultyBand: 6.5,
  },
  {
    id: 'task1a-006',
    title: 'Smartphone Sales',
    prompt: `The graph below shows global smartphone sales by manufacturer from 2015 to 2023.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    topic: 'technology',
    visualType: 'line_graph',
    imageUrl: '/images/task1/line-graphs/smartphone-sales.svg',
    imageDescription:
      'Line graph showing smartphone sales in millions: Samsung (fluctuating leader 280-320M), Apple (steady growth 200-230M), Huawei (rise then sharp fall after 2019), Xiaomi (rapid growth from 60M to 190M)',
    difficultyBand: 6.5,
  },
  {
    id: 'task1a-007',
    title: 'Average Temperature Changes',
    prompt: `The graph below shows average annual temperature changes from the 1900-1950 baseline in the Northern and Southern hemispheres from 1950 to 2020.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    topic: 'environment',
    visualType: 'line_graph',
    imageUrl: '/images/task1/line-graphs/temperature-changes.svg',
    imageDescription:
      'Line graph showing temperature deviation in Celsius: Northern hemisphere (rising from 0 to +1.5C with steeper increase after 1980), Southern hemisphere (rising from 0 to +0.9C with more gradual increase)',
    difficultyBand: 7.0,
  },
  {
    id: 'task1a-008',
    title: 'Coffee Consumption',
    prompt: `The line graph below shows coffee consumption per capita in kilograms for five countries from 2000 to 2020.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    topic: 'lifestyle',
    visualType: 'line_graph',
    imageUrl: '/images/task1/line-graphs/coffee-consumption.svg',
    imageDescription:
      'Line graph showing coffee consumption: Finland (highest at 12kg, stable), Norway (10kg, slight increase), USA (4kg rising to 5kg), UK (3kg rising to 4kg), China (0.1kg rising to 0.5kg)',
    difficultyBand: 6.0,
  },
  {
    id: 'task1a-009',
    title: 'Life Expectancy',
    prompt: `The graph below shows life expectancy at birth for males and females in developed and developing countries from 1960 to 2020.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    topic: 'health',
    visualType: 'line_graph',
    imageUrl: '/images/task1/line-graphs/life-expectancy.svg',
    imageDescription:
      'Line graph with four lines: Developed countries females (72 to 84 years), Developed countries males (66 to 79 years), Developing countries females (48 to 74 years), Developing countries males (45 to 70 years). All show upward trends with gap narrowing.',
    difficultyBand: 6.5,
  },
  {
    id: 'task1a-010',
    title: 'Car Production',
    prompt: `The line graph below shows car production in millions of units for four countries from 2005 to 2022.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    topic: 'industry',
    visualType: 'line_graph',
    imageUrl: '/images/task1/line-graphs/car-production.svg',
    imageDescription:
      'Line graph showing car production: China (dramatic rise from 5M to 26M), Japan (stable 8-10M with decline), USA (decline from 12M to 9M with 2020 dip), Germany (stable around 5-6M)',
    difficultyBand: 6.5,
  },

  // BAR CHARTS (8)
  {
    id: 'task1a-011',
    title: 'Water Usage by Sector',
    prompt: `The bar chart below shows water usage by sector in six different regions of the world.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    topic: 'environment',
    visualType: 'bar_chart',
    imageUrl: '/images/task1/bar-charts/water-usage.svg',
    imageDescription:
      'Grouped bar chart showing water usage percentages for Agriculture, Industry, and Domestic use across Africa (85%, 5%, 10%), Asia (80%, 10%, 10%), Europe (30%, 50%, 20%), North America (40%, 45%, 15%), South America (70%, 15%, 15%), and Oceania (65%, 15%, 20%)',
    difficultyBand: 6.5,
  },
  {
    id: 'task1a-012',
    title: 'Languages Spoken',
    prompt: `The bar chart below shows the number of native speakers for the top eight languages in the world.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    topic: 'culture',
    visualType: 'bar_chart',
    imageUrl: '/images/task1/bar-charts/languages-spoken.svg',
    imageDescription:
      'Horizontal bar chart showing native speakers in millions: Mandarin (920M), Spanish (475M), English (375M), Hindi (345M), Arabic (315M), Bengali (230M), Portuguese (220M), Russian (155M)',
    difficultyBand: 6.0,
  },
  {
    id: 'task1a-013',
    title: 'Renewable Energy Investment',
    prompt: `The bar chart below compares investment in renewable energy sources in billions of dollars across five countries in 2015 and 2022.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    topic: 'energy',
    visualType: 'bar_chart',
    imageUrl: '/images/task1/bar-charts/renewable-investment.svg',
    imageDescription:
      'Grouped bar chart comparing 2015 and 2022 investments: China ($100B to $260B), USA ($45B to $85B), Germany ($20B to $35B), Japan ($25B to $30B), India ($10B to $45B)',
    difficultyBand: 6.5,
  },
  {
    id: 'task1a-014',
    title: 'Museum Visitors',
    prompt: `The bar chart below shows the number of visitors in millions to the five most popular museums in the world in 2019.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    topic: 'culture',
    visualType: 'bar_chart',
    imageUrl: '/images/task1/bar-charts/museum-visitors.svg',
    imageDescription:
      'Bar chart showing visitor numbers: Louvre Paris (9.6M), National Museum of China (7.4M), Vatican Museums (6.9M), Metropolitan Museum NYC (6.5M), British Museum (6.2M)',
    difficultyBand: 6.0,
  },
  {
    id: 'task1a-015',
    title: 'Household Spending',
    prompt: `The bar chart below shows the percentage of household income spent on different categories in the UK in 1980 and 2020.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    topic: 'lifestyle',
    visualType: 'bar_chart',
    imageUrl: '/images/task1/bar-charts/household-spending.svg',
    imageDescription:
      'Grouped bar chart comparing 1980 and 2020 spending: Housing (15% to 30%), Food (25% to 12%), Transport (12% to 15%), Leisure (8% to 18%), Clothing (10% to 5%), Other (30% to 20%)',
    difficultyBand: 6.5,
  },
  {
    id: 'task1a-016',
    title: 'Olympic Medal Counts',
    prompt: `The bar chart below shows the total Olympic medal counts for the top six countries from 2000 to 2020.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    topic: 'sports',
    visualType: 'bar_chart',
    imageUrl: '/images/task1/bar-charts/olympic-medals.svg',
    imageDescription:
      'Bar chart showing total medals: USA (550), China (420), Russia (380), Great Britain (340), Germany (310), Australia (290)',
    difficultyBand: 6.0,
  },
  {
    id: 'task1a-017',
    title: 'Working Hours by Country',
    prompt: `The bar chart below shows the average weekly working hours in eight different countries.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    topic: 'work',
    visualType: 'bar_chart',
    imageUrl: '/images/task1/bar-charts/working-hours.svg',
    imageDescription:
      'Horizontal bar chart showing weekly hours: Mexico (48h), South Korea (45h), Japan (42h), USA (40h), UK (38h), Australia (36h), Germany (35h), Netherlands (30h)',
    difficultyBand: 6.0,
  },
  {
    id: 'task1a-018',
    title: 'Causes of Deforestation',
    prompt: `The bar chart below shows the main causes of deforestation and their contribution to total forest loss globally.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    topic: 'environment',
    visualType: 'bar_chart',
    imageUrl: '/images/task1/bar-charts/deforestation-causes.svg',
    imageDescription:
      'Bar chart showing causes: Cattle ranching (40%), Soy cultivation (20%), Palm oil (15%), Logging (10%), Subsistence farming (10%), Other (5%)',
    difficultyBand: 6.5,
  },

  // PIE CHARTS (5)
  {
    id: 'task1a-019',
    title: 'Energy Consumption',
    prompt: `The two pie charts below show the sources of energy consumption in Country Y in 1990 and 2020.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    topic: 'energy',
    visualType: 'pie_chart',
    imageUrl: '/images/task1/pie-charts/energy-consumption.svg',
    imageDescription:
      'Two pie charts - 1990: Oil (45%), Coal (30%), Gas (15%), Nuclear (8%), Renewables (2%). 2020: Oil (35%), Gas (28%), Coal (18%), Nuclear (10%), Renewables (9%)',
    difficultyBand: 6.5,
  },
  {
    id: 'task1a-020',
    title: 'Transport Mode Preferences',
    prompt: `The pie charts below show the main modes of transport used by commuters in a large city in 2000 and 2020.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    topic: 'transport',
    visualType: 'pie_chart',
    imageUrl: '/images/task1/pie-charts/transport-modes.svg',
    imageDescription:
      'Two pie charts - 2000: Car (65%), Bus (18%), Train (10%), Cycling (4%), Walking (3%). 2020: Car (45%), Public transport (25%), Cycling (15%), Walking (10%), Other (5%)',
    difficultyBand: 6.0,
  },
  {
    id: 'task1a-021',
    title: 'Land Use Distribution',
    prompt: `The pie chart below shows how land is used in a typical developed country.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    topic: 'environment',
    visualType: 'pie_chart',
    imageUrl: '/images/task1/pie-charts/land-use.svg',
    imageDescription:
      'Pie chart showing: Agricultural land (45%), Forests and woodland (30%), Urban areas (12%), Protected areas (8%), Other (5%)',
    difficultyBand: 6.0,
  },
  {
    id: 'task1a-022',
    title: 'Waste Composition',
    prompt: `The pie charts below show the composition of household waste in a city in 2000 and 2020.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    topic: 'environment',
    visualType: 'pie_chart',
    imageUrl: '/images/task1/pie-charts/waste-composition.svg',
    imageDescription:
      'Two pie charts - 2000: Organic (40%), Paper (25%), Plastic (18%), Glass (10%), Metal (5%), Other (2%). 2020: Organic (30%), Plastic (28%), Paper (20%), Glass (8%), Metal (6%), Electronic waste (8%)',
    difficultyBand: 6.5,
  },
  {
    id: 'task1a-023',
    title: 'Government Budget Allocation',
    prompt: `The pie chart below shows the allocation of a national government's annual budget.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    topic: 'government',
    visualType: 'pie_chart',
    imageUrl: '/images/task1/pie-charts/budget-allocation.svg',
    imageDescription:
      'Pie chart showing: Healthcare (25%), Education (20%), Defense (15%), Social welfare (18%), Infrastructure (12%), Other (10%)',
    difficultyBand: 6.0,
  },

  // TABLES (4)
  {
    id: 'task1a-024',
    title: 'Student Performance Comparison',
    prompt: `The table below shows the average test scores in Mathematics and Science for 15-year-old students in six countries.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    topic: 'education',
    visualType: 'table',
    imageUrl: '/images/task1/tables/student-performance.svg',
    imageDescription:
      'Table showing Math and Science scores: Singapore (569, 551), Japan (527, 529), South Korea (524, 519), Germany (500, 503), USA (478, 496), Brazil (384, 401)',
    difficultyBand: 6.0,
  },
  {
    id: 'task1a-025',
    title: 'Cost of Living Index',
    prompt: `The table below shows the cost of living index for various categories in five major cities (New York = 100).

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    topic: 'lifestyle',
    visualType: 'table',
    imageUrl: '/images/task1/tables/cost-of-living.svg',
    imageDescription:
      'Table with categories (Rent, Food, Transport, Healthcare) for cities: New York (100 all), London (120, 95, 110, 80), Tokyo (95, 105, 90, 85), Sydney (85, 90, 95, 70), Mumbai (25, 40, 30, 35)',
    difficultyBand: 6.5,
  },
  {
    id: 'task1a-026',
    title: 'Airport Statistics',
    prompt: `The table below shows passenger numbers and number of destinations for the world's busiest airports in 2019.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    topic: 'transport',
    visualType: 'table',
    imageUrl: '/images/task1/tables/airport-statistics.svg',
    imageDescription:
      'Table showing passengers (millions) and destinations: Atlanta (110.5, 150), Dubai (89.1, 270), London Heathrow (80.9, 180), Tokyo Haneda (87.1, 90), Los Angeles (88.1, 160)',
    difficultyBand: 6.0,
  },
  {
    id: 'task1a-027',
    title: 'Nutritional Comparison',
    prompt: `The table below compares the nutritional content per 100g of four different types of milk.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    topic: 'health',
    visualType: 'table',
    imageUrl: '/images/task1/tables/nutritional-comparison.svg',
    imageDescription:
      'Table comparing Calories, Protein (g), Fat (g), Calcium (mg) for: Whole milk (61, 3.2, 3.3, 120), Skimmed milk (35, 3.4, 0.1, 125), Soy milk (54, 3.3, 1.8, 25), Oat milk (45, 1.0, 1.5, 120)',
    difficultyBand: 6.0,
  },

  // MAPS (3)
  {
    id: 'task1a-028',
    title: 'Town Center Development',
    prompt: `The two maps below show a town center in 1980 and the same area today.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    topic: 'urban',
    visualType: 'map',
    imageUrl: '/images/task1/maps/town-center.svg',
    imageDescription:
      'Two maps - 1980: Town center with traditional market, small shops, residential areas, single main road, park, church. Present: Pedestrianized shopping area, large supermarket replacing market, multi-story car park, new ring road, expanded bus station, offices replacing some residential areas',
    difficultyBand: 6.5,
  },
  {
    id: 'task1a-029',
    title: 'Island Resort Development',
    prompt: `The maps below show an island before and after the construction of tourist facilities.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    topic: 'tourism',
    visualType: 'map',
    imageUrl: '/images/task1/maps/island-resort.svg',
    imageDescription:
      'Two maps - Before: Undeveloped island with beach, palm trees, small fishing village, natural vegetation. After: Resort hotel, swimming pool, restaurant, reception building, pier for boats, footpaths connecting facilities, beach huts, vehicle track, some vegetation cleared',
    difficultyBand: 6.5,
  },
  {
    id: 'task1a-030',
    title: 'University Campus Changes',
    prompt: `The two maps below show a university campus in 1995 and the planned development for 2025.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    topic: 'education',
    visualType: 'map',
    imageUrl: '/images/task1/maps/university-campus.svg',
    imageDescription:
      'Two maps - 1995: Main building, library, sports field, car park, cafeteria, lake. 2025: Additional science building, expanded library with new wing, sports complex replacing field, underground parking, new student accommodation, lake partially filled for technology center',
    difficultyBand: 6.5,
  },

  // PROCESS DIAGRAMS (4)
  {
    id: 'task1a-031',
    title: 'Water Treatment Process',
    prompt: `The diagram below shows the process of treating water to make it suitable for drinking.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    topic: 'environment',
    visualType: 'process',
    imageUrl: '/images/task1/processes/water-treatment.svg',
    imageDescription:
      'Flow diagram showing: Water source (river/reservoir) -> Screening (removes large debris) -> Coagulation (chemicals added) -> Sedimentation (particles settle) -> Filtration (sand/carbon filters) -> Disinfection (chlorine/UV) -> Storage tanks -> Distribution to homes',
    difficultyBand: 6.5,
  },
  {
    id: 'task1a-032',
    title: 'Recycling Process',
    prompt: `The diagram below shows how plastic bottles are recycled into new products.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    topic: 'environment',
    visualType: 'process',
    imageUrl: '/images/task1/processes/plastic-recycling.svg',
    imageDescription:
      'Flow diagram showing: Collection from households -> Sorting by plastic type -> Cleaning and washing -> Shredding into flakes -> Melting -> Pellet formation -> Manufacturing new products (bottles, clothing, containers)',
    difficultyBand: 6.0,
  },
  {
    id: 'task1a-033',
    title: 'Chocolate Production',
    prompt: `The diagram below shows the process of producing chocolate from cocoa beans.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    topic: 'food',
    visualType: 'process',
    imageUrl: '/images/task1/processes/chocolate-production.svg',
    imageDescription:
      'Flow diagram showing: Harvesting cocoa pods -> Fermenting beans (5-7 days) -> Drying in sun -> Roasting (120-150C) -> Crushing and separating shells -> Grinding into cocoa liquor -> Pressing (cocoa butter + powder separated) -> Conching with sugar/milk -> Tempering -> Molding -> Packaging',
    difficultyBand: 7.0,
  },
  {
    id: 'task1a-034',
    title: 'Cement Manufacturing',
    prompt: `The diagram below illustrates the process of manufacturing cement.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    topic: 'industry',
    visualType: 'process',
    imageUrl: '/images/task1/processes/cement-manufacturing.svg',
    imageDescription:
      'Flow diagram showing: Quarrying limestone and clay -> Crushing -> Mixing in correct proportions -> Grinding to powder -> Heating in rotary kiln (1450C) -> Clinker formation -> Cooling -> Grinding with gite gypsum -> Cement storage in silos -> Packaging/transport',
    difficultyBand: 7.0,
  },

  // MIXED/COMBINATION CHARTS (2)
  {
    id: 'task1a-035',
    title: 'Oil Production and Consumption',
    prompt: `The charts below show oil production and consumption in million barrels per day for five regions, along with a line graph showing changes in oil prices from 2000 to 2022.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    topic: 'energy',
    visualType: 'mixed',
    imageUrl: '/images/task1/mixed/oil-production-consumption.svg',
    imageDescription:
      'Two grouped bar charts showing production and consumption for Middle East, North America, Europe, Asia Pacific, and Africa. Line graph below showing oil price fluctuations from $25 in 2000 to peak of $110 in 2012, down to $45 in 2016, up to $80 in 2022',
    difficultyBand: 7.0,
  },
  {
    id: 'task1a-036',
    title: 'Employment and Unemployment',
    prompt: `The bar chart and line graph below show employment by sector and the unemployment rate in Country Z from 2000 to 2020.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    topic: 'work',
    visualType: 'mixed',
    imageUrl: '/images/task1/mixed/employment-unemployment.svg',
    imageDescription:
      'Stacked bar chart showing employment distribution across Agriculture (declining), Industry (stable), and Services (growing) sectors. Overlaid line showing unemployment rate fluctuating between 4-9%, with peak during 2008-2010',
    difficultyBand: 7.0,
  },
];
