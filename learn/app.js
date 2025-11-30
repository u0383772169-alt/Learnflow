// LearnFlow - AI-Powered Learning Platform

// ==================== CONFIGURATION ====================
const STORAGE_KEYS = {
    DECKS: 'learnflow_decks',
    USER: 'learnflow_user',
    USAGE: 'learnflow_usage',
    ACCOUNTS: 'learnflow_accounts'  // Store all registered accounts
};

// Plan Limits
const PLAN_LIMITS = {
    guest: {
        name: 'Guest',
        aiRequestsPerDay: 3,
        maxDecks: 5,
        maxCardsPerDeck: 50,
        features: ['basic_quiz', 'flashcards']
    },
    free: {
        name: 'Free',
        aiRequestsPerDay: 5,
        maxDecks: 10,
        maxCardsPerDeck: 100,
        features: ['basic_quiz', 'flashcards', 'limited_tutor']
    },
    pro: {
        name: 'Pro',
        price: 3,
        aiRequestsPerDay: 50,
        maxDecks: -1, // unlimited
        maxCardsPerDeck: 500,
        features: ['advanced_quiz', 'flashcards', 'full_tutor', 'all_question_types', 'export_pdf']
    },
    ultimate: {
        name: 'Ultimate',
        price: 10,
        aiRequestsPerDay: -1, // unlimited
        maxDecks: -1,
        maxCardsPerDeck: -1,
        features: ['flow_ai_pro', 'flashcards', 'advanced_tutor', 'all_features', 'priority_support', 'analytics', 'collaboration']
    }
};

// ==================== STATE ====================
let currentUser = null;
let decks = [];
let currentDeck = null;
let editingDeckId = null;
let previewCards = [];
let previewDeckName = '';

// Quiz State
let quizState = {
    questions: [],
    currentIndex: 0,
    answers: [],
    startTime: null,
    topic: ''
};

// Study State
let studySession = {
    deck: null,
    cards: [],
    currentIndex: 0,
    correct: [],
    wrong: [],
    isFlipped: false
};

// AI Knowledge Base for Quiz Generation - Comprehensive Database
const AI_KNOWLEDGE_BASE = {
    // HISTORY TOPICS
    'world war 2': {
        basic: [
            { q: 'When did World War II begin?', a: '1939', options: ['1939', '1941', '1938', '1940'], type: 'multiple' },
            { q: 'When did World War II end?', a: '1945', options: ['1944', '1945', '1946', '1943'], type: 'multiple' },
            { q: 'Pearl Harbor was attacked by Japan.', a: 'True', type: 'truefalse' },
            { q: 'Which country was NOT part of the Allied Powers?', a: 'Germany', options: ['USA', 'UK', 'Germany', 'Soviet Union'], type: 'multiple' },
            { q: 'Adolf Hitler was the leader of Nazi Germany.', a: 'True', type: 'truefalse' },
        ],
        intermediate: [
            { q: 'What was the code name for the Allied invasion of Normandy?', a: 'Operation Overlord', options: ['Operation Overlord', 'Operation Barbarossa', 'Operation Sea Lion', 'Operation Torch'], type: 'multiple' },
            { q: 'Which battle is considered the turning point on the Eastern Front?', a: 'Battle of Stalingrad', options: ['Battle of Stalingrad', 'Battle of Kursk', 'Battle of Moscow', 'Battle of Berlin'], type: 'multiple' },
            { q: 'The D-Day invasion occurred on June 6, 1944.', a: 'True', type: 'truefalse' },
            { q: 'What was the Manhattan Project?', a: 'Development of atomic bomb', options: ['Development of atomic bomb', 'Allied invasion plan', 'German submarine program', 'British spy network'], type: 'multiple' },
            { q: 'Which two cities were atomic bombs dropped on?', a: 'Hiroshima and Nagasaki', options: ['Hiroshima and Nagasaki', 'Tokyo and Osaka', 'Kyoto and Kobe', 'Yokohama and Nagoya'], type: 'multiple' },
        ],
        advanced: [
            { q: 'Operation Barbarossa was the German invasion of which country?', a: 'Soviet Union', options: ['Soviet Union', 'France', 'Poland', 'Britain'], type: 'multiple' },
            { q: 'The Enigma machine was used by Germany for what purpose?', a: 'Encrypting military communications', options: ['Encrypting military communications', 'Calculating artillery trajectories', 'Controlling submarines', 'Broadcasting propaganda'], type: 'multiple' },
            { q: 'Who was the Supreme Commander of Allied Forces in Europe?', a: 'Dwight D. Eisenhower', options: ['Dwight D. Eisenhower', 'George Patton', 'Bernard Montgomery', 'Douglas MacArthur'], type: 'multiple' },
            { q: 'The Yalta Conference in 1945 was attended by Roosevelt, Churchill, and _____.', a: 'Stalin', type: 'fillblank' },
            { q: 'What was the Luftwaffe?', a: 'German Air Force', options: ['German Air Force', 'German Navy', 'German Secret Police', 'German Tank Division'], type: 'multiple' },
            { q: 'The Battle of Midway was a turning point in which theater of war?', a: 'Pacific Theater', options: ['Pacific Theater', 'European Theater', 'African Theater', 'Mediterranean Theater'], type: 'multiple' },
            { q: 'What was the "Final Solution"?', a: 'Nazi plan to exterminate Jews', options: ['Nazi plan to exterminate Jews', 'German war strategy', 'Allied peace treaty', 'Soviet counteroffensive'], type: 'multiple' },
        ]
    },
    'world war 1': {
        basic: [
            { q: 'World War I began in what year?', a: '1914', options: ['1914', '1912', '1916', '1918'], type: 'multiple' },
            { q: 'World War I ended in 1918.', a: 'True', type: 'truefalse' },
            { q: 'What event triggered the start of WWI?', a: 'Assassination of Archduke Franz Ferdinand', options: ['Assassination of Archduke Franz Ferdinand', 'Sinking of the Lusitania', 'German invasion of Poland', 'Russian Revolution'], type: 'multiple' },
        ],
        intermediate: [
            { q: 'Which alliance included Germany, Austria-Hungary, and the Ottoman Empire?', a: 'Central Powers', options: ['Central Powers', 'Allied Powers', 'Axis Powers', 'Triple Entente'], type: 'multiple' },
            { q: 'Trench warfare was a major characteristic of WWI.', a: 'True', type: 'truefalse' },
            { q: 'The Treaty of _____ officially ended World War I.', a: 'Versailles', type: 'fillblank' },
        ],
        advanced: [
            { q: 'The Schlieffen Plan was Germany\'s strategy to avoid fighting on how many fronts?', a: 'Two', options: ['Two', 'Three', 'One', 'Four'], type: 'multiple' },
            { q: 'What new weapon was first used extensively in WWI?', a: 'Poison gas', options: ['Poison gas', 'Nuclear weapons', 'Guided missiles', 'Stealth aircraft'], type: 'multiple' },
        ]
    },
    'american revolution': {
        basic: [
            { q: 'The American Revolution began in what year?', a: '1775', options: ['1775', '1776', '1774', '1780'], type: 'multiple' },
            { q: 'The Declaration of Independence was signed in 1776.', a: 'True', type: 'truefalse' },
            { q: 'Who was the commanding general of the Continental Army?', a: 'George Washington', options: ['George Washington', 'Benjamin Franklin', 'Thomas Jefferson', 'John Adams'], type: 'multiple' },
        ],
        intermediate: [
            { q: 'What was the rallying cry "No taxation without _____"?', a: 'representation', type: 'fillblank' },
            { q: 'The Boston Tea Party was a protest against what?', a: 'British tea taxes', options: ['British tea taxes', 'Lack of food', 'Slave trade', 'Land seizures'], type: 'multiple' },
        ],
        advanced: [
            { q: 'Which battle is considered the turning point of the Revolutionary War?', a: 'Battle of Saratoga', options: ['Battle of Saratoga', 'Battle of Yorktown', 'Battle of Bunker Hill', 'Battle of Trenton'], type: 'multiple' },
            { q: 'Which country provided crucial military support to the American colonies?', a: 'France', options: ['France', 'Spain', 'Netherlands', 'Prussia'], type: 'multiple' },
        ]
    },

    // SCIENCE TOPICS
    'biology': {
        basic: [
            { q: 'What is the basic unit of life?', a: 'Cell', options: ['Cell', 'Atom', 'Molecule', 'Organ'], type: 'multiple' },
            { q: 'DNA stands for Deoxyribonucleic Acid.', a: 'True', type: 'truefalse' },
            { q: 'Plants produce oxygen during photosynthesis.', a: 'True', type: 'truefalse' },
            { q: 'What organelle is known as the "powerhouse of the cell"?', a: 'Mitochondria', options: ['Mitochondria', 'Nucleus', 'Ribosome', 'Chloroplast'], type: 'multiple' },
        ],
        intermediate: [
            { q: 'What type of cell division produces gametes?', a: 'Meiosis', options: ['Meiosis', 'Mitosis', 'Binary fission', 'Budding'], type: 'multiple' },
            { q: 'The human body has 206 bones.', a: 'True', type: 'truefalse' },
            { q: 'What is the function of red blood cells?', a: 'Carry oxygen', options: ['Carry oxygen', 'Fight infection', 'Clot blood', 'Digest food'], type: 'multiple' },
        ],
        advanced: [
            { q: 'What is the process by which mRNA is synthesized from DNA?', a: 'Transcription', options: ['Transcription', 'Translation', 'Replication', 'Mutation'], type: 'multiple' },
            { q: 'Codons consist of how many nucleotides?', a: '3', options: ['3', '2', '4', '5'], type: 'multiple' },
            { q: 'The process of protein synthesis from mRNA is called _____.', a: 'translation', type: 'fillblank' },
        ]
    },
    'chemistry': {
        basic: [
            { q: 'What is the chemical symbol for water?', a: 'H2O', options: ['H2O', 'CO2', 'NaCl', 'O2'], type: 'multiple' },
            { q: 'Atoms are made up of protons, neutrons, and electrons.', a: 'True', type: 'truefalse' },
            { q: 'What is the atomic number of Carbon?', a: '6', options: ['6', '12', '8', '14'], type: 'multiple' },
        ],
        intermediate: [
            { q: 'What type of bond involves the sharing of electrons?', a: 'Covalent bond', options: ['Covalent bond', 'Ionic bond', 'Hydrogen bond', 'Metallic bond'], type: 'multiple' },
            { q: 'The pH of a neutral solution is _____.', a: '7', type: 'fillblank' },
            { q: 'Acids have a pH lower than 7.', a: 'True', type: 'truefalse' },
        ],
        advanced: [
            { q: 'What is Avogadro\'s number approximately equal to?', a: '6.022 × 10²³', options: ['6.022 × 10²³', '3.14 × 10⁸', '9.8 × 10¹⁰', '1.66 × 10⁻²⁷'], type: 'multiple' },
            { q: 'In an exothermic reaction, energy is released to the surroundings.', a: 'True', type: 'truefalse' },
        ]
    },
    'physics': {
        basic: [
            { q: 'What is the SI unit of force?', a: 'Newton', options: ['Newton', 'Joule', 'Watt', 'Pascal'], type: 'multiple' },
            { q: 'Speed of light is approximately 300,000 km/s.', a: 'True', type: 'truefalse' },
            { q: 'What is the formula for force?', a: 'F = ma', options: ['F = ma', 'E = mc²', 'V = IR', 'P = IV'], type: 'multiple' },
        ],
        intermediate: [
            { q: 'Newton\'s Third Law states that every action has an equal and opposite _____.', a: 'reaction', type: 'fillblank' },
            { q: 'What type of energy is stored in a stretched spring?', a: 'Potential energy', options: ['Potential energy', 'Kinetic energy', 'Thermal energy', 'Nuclear energy'], type: 'multiple' },
        ],
        advanced: [
            { q: 'What is the equation relating energy and mass according to Einstein?', a: 'E = mc²', options: ['E = mc²', 'F = ma', 'PV = nRT', 'V = IR'], type: 'multiple' },
            { q: 'In quantum mechanics, the Heisenberg Uncertainty Principle states you cannot simultaneously know both position and _____ precisely.', a: 'momentum', type: 'fillblank' },
        ]
    },
    'photosynthesis': {
        basic: [
            { q: 'Photosynthesis occurs in which organelle?', a: 'Chloroplast', options: ['Chloroplast', 'Mitochondria', 'Nucleus', 'Vacuole'], type: 'multiple' },
            { q: 'Plants release oxygen during photosynthesis.', a: 'True', type: 'truefalse' },
            { q: 'What gas do plants absorb for photosynthesis?', a: 'Carbon dioxide', options: ['Carbon dioxide', 'Oxygen', 'Nitrogen', 'Hydrogen'], type: 'multiple' },
        ],
        intermediate: [
            { q: 'What is the primary pigment involved in photosynthesis?', a: 'Chlorophyll', options: ['Chlorophyll', 'Carotene', 'Hemoglobin', 'Melanin'], type: 'multiple' },
            { q: 'The light-independent reactions are also called the _____ Cycle.', a: 'Calvin', type: 'fillblank' },
            { q: 'Photosynthesis converts light energy into chemical energy.', a: 'True', type: 'truefalse' },
        ],
        advanced: [
            { q: 'Where do the light-dependent reactions take place?', a: 'Thylakoid membrane', options: ['Thylakoid membrane', 'Stroma', 'Cytoplasm', 'Cell membrane'], type: 'multiple' },
            { q: 'What molecule is the primary product of the Calvin Cycle?', a: 'G3P (Glyceraldehyde-3-phosphate)', options: ['G3P (Glyceraldehyde-3-phosphate)', 'Glucose', 'ATP', 'NADPH'], type: 'multiple' },
            { q: 'How many ATP molecules are used to fix one molecule of CO2 in the Calvin Cycle?', a: '3', options: ['3', '2', '1', '4'], type: 'multiple' },
        ]
    },

    // PROGRAMMING & TECH TOPICS
    'javascript': {
        basic: [
            { q: 'JavaScript is primarily used for web development.', a: 'True', type: 'truefalse' },
            { q: 'What keyword declares a variable that cannot be reassigned?', a: 'const', options: ['const', 'let', 'var', 'static'], type: 'multiple' },
            { q: 'JavaScript is case-sensitive.', a: 'True', type: 'truefalse' },
            { q: 'Which symbol is used for single-line comments in JavaScript?', a: '//', options: ['//', '/*', '#', '--'], type: 'multiple' },
        ],
        intermediate: [
            { q: 'What does DOM stand for?', a: 'Document Object Model', options: ['Document Object Model', 'Data Object Model', 'Digital Output Mode', 'Direct Object Manipulation'], type: 'multiple' },
            { q: 'The === operator compares both value and type.', a: 'True', type: 'truefalse' },
            { q: 'What method adds an element to the end of an array?', a: 'push()', options: ['push()', 'pop()', 'shift()', 'unshift()'], type: 'multiple' },
            { q: 'A Promise can be in states: pending, fulfilled, or _____.', a: 'rejected', type: 'fillblank' },
        ],
        advanced: [
            { q: 'What is the output of: typeof null?', a: 'object', options: ['object', 'null', 'undefined', 'error'], type: 'multiple' },
            { q: 'Arrow functions have their own "this" binding.', a: 'False', type: 'truefalse' },
            { q: 'What is a closure in JavaScript?', a: 'A function with access to its outer scope', options: ['A function with access to its outer scope', 'A way to close browser windows', 'A type of loop', 'An error handling mechanism'], type: 'multiple' },
            { q: 'The event loop allows JavaScript to perform non-blocking operations.', a: 'True', type: 'truefalse' },
            { q: 'What does the spread operator (...) do?', a: 'Expands elements of an iterable', options: ['Expands elements of an iterable', 'Compresses data', 'Creates comments', 'Defines rest parameters only'], type: 'multiple' },
        ]
    },
    'python': {
        basic: [
            { q: 'Python uses indentation to define code blocks.', a: 'True', type: 'truefalse' },
            { q: 'What function prints output to the console in Python?', a: 'print()', options: ['print()', 'console.log()', 'echo()', 'write()'], type: 'multiple' },
            { q: 'Python is a compiled language.', a: 'False', type: 'truefalse' },
        ],
        intermediate: [
            { q: 'What keyword is used to define a function in Python?', a: 'def', options: ['def', 'function', 'func', 'define'], type: 'multiple' },
            { q: 'Lists in Python are mutable.', a: 'True', type: 'truefalse' },
            { q: 'What does len() function return?', a: 'Length of an object', options: ['Length of an object', 'Last element', 'Data type', 'Memory address'], type: 'multiple' },
        ],
        advanced: [
            { q: 'What is a decorator in Python?', a: 'A function that modifies another function', options: ['A function that modifies another function', 'A type of variable', 'A comment style', 'A loop structure'], type: 'multiple' },
            { q: 'Python supports multiple inheritance.', a: 'True', type: 'truefalse' },
            { q: 'What is a generator in Python?', a: 'A function that yields values one at a time', options: ['A function that yields values one at a time', 'A random number creator', 'A file writer', 'A class template'], type: 'multiple' },
        ]
    },

    // MATH TOPICS
    'algebra': {
        basic: [
            { q: 'What is the value of x in: 2x = 10?', a: '5', options: ['5', '10', '20', '2'], type: 'multiple' },
            { q: 'In the equation y = mx + b, m represents the slope.', a: 'True', type: 'truefalse' },
            { q: 'What is 3² equal to?', a: '9', options: ['9', '6', '8', '27'], type: 'multiple' },
        ],
        intermediate: [
            { q: 'What is the quadratic formula used to solve?', a: 'ax² + bx + c = 0', options: ['ax² + bx + c = 0', 'y = mx + b', 'a² + b² = c²', 'x + y = z'], type: 'multiple' },
            { q: 'The square root of 144 is _____.', a: '12', type: 'fillblank' },
            { q: 'What is the factored form of x² - 9?', a: '(x+3)(x-3)', options: ['(x+3)(x-3)', '(x-3)²', '(x+9)(x-1)', '(x-9)(x+1)'], type: 'multiple' },
        ],
        advanced: [
            { q: 'What is i² equal to (where i is the imaginary unit)?', a: '-1', options: ['-1', '1', 'i', '-i'], type: 'multiple' },
            { q: 'A polynomial of degree 3 is called a _____ polynomial.', a: 'cubic', type: 'fillblank' },
        ]
    },
    'calculus': {
        basic: [
            { q: 'What is the derivative of x²?', a: '2x', options: ['2x', 'x', '2x²', 'x²'], type: 'multiple' },
            { q: 'The integral is the reverse operation of differentiation.', a: 'True', type: 'truefalse' },
        ],
        intermediate: [
            { q: 'What is the derivative of sin(x)?', a: 'cos(x)', options: ['cos(x)', '-sin(x)', '-cos(x)', 'tan(x)'], type: 'multiple' },
            { q: 'The integral of 1/x is _____ + C.', a: 'ln|x|', type: 'fillblank' },
            { q: 'What does the derivative represent geometrically?', a: 'Slope of tangent line', options: ['Slope of tangent line', 'Area under curve', 'Y-intercept', 'Maximum value'], type: 'multiple' },
        ],
        advanced: [
            { q: 'What is L\'Hôpital\'s Rule used for?', a: 'Evaluating indeterminate forms', options: ['Evaluating indeterminate forms', 'Finding derivatives', 'Calculating integrals', 'Solving differential equations'], type: 'multiple' },
            { q: 'The Taylor series is used to represent functions as infinite _____.', a: 'polynomials', type: 'fillblank' },
        ]
    },
    'geometry': {
        basic: [
            { q: 'How many degrees are in a triangle?', a: '180', options: ['180', '360', '90', '270'], type: 'multiple' },
            { q: 'A square has 4 equal sides.', a: 'True', type: 'truefalse' },
            { q: 'What is the area formula for a rectangle?', a: 'length × width', options: ['length × width', '2(l + w)', 'l + w', 'l² + w²'], type: 'multiple' },
        ],
        intermediate: [
            { q: 'What is the Pythagorean theorem?', a: 'a² + b² = c²', options: ['a² + b² = c²', 'a + b = c', '2a + 2b = c', 'ab = c'], type: 'multiple' },
            { q: 'The circumference of a circle is 2πr.', a: 'True', type: 'truefalse' },
            { q: 'What is the area of a circle with radius r?', a: 'πr²', options: ['πr²', '2πr', 'πd', 'r²'], type: 'multiple' },
        ],
        advanced: [
            { q: 'What is the volume of a sphere?', a: '(4/3)πr³', options: ['(4/3)πr³', '4πr²', 'πr³', '(2/3)πr³'], type: 'multiple' },
            { q: 'In a right triangle, the side opposite the right angle is called the _____.', a: 'hypotenuse', type: 'fillblank' },
        ]
    },

    // LANGUAGE & LITERATURE
    'grammar': {
        basic: [
            { q: 'A noun is a person, place, thing, or idea.', a: 'True', type: 'truefalse' },
            { q: 'Which word is a verb?', a: 'Run', options: ['Run', 'Beautiful', 'Quickly', 'House'], type: 'multiple' },
            { q: 'An adjective describes a noun.', a: 'True', type: 'truefalse' },
        ],
        intermediate: [
            { q: 'What is a conjunction?', a: 'A word that connects clauses', options: ['A word that connects clauses', 'A describing word', 'An action word', 'A naming word'], type: 'multiple' },
            { q: 'The words "and," "but," and "or" are conjunctions.', a: 'True', type: 'truefalse' },
        ],
        advanced: [
            { q: 'What is a gerund?', a: 'A verb form ending in -ing used as a noun', options: ['A verb form ending in -ing used as a noun', 'A type of adjective', 'A past tense verb', 'A proper noun'], type: 'multiple' },
            { q: 'A dangling modifier is a grammatical error.', a: 'True', type: 'truefalse' },
        ]
    },

    // GEOGRAPHY
    'geography': {
        basic: [
            { q: 'What is the largest continent?', a: 'Asia', options: ['Asia', 'Africa', 'North America', 'Europe'], type: 'multiple' },
            { q: 'There are 7 continents on Earth.', a: 'True', type: 'truefalse' },
            { q: 'What is the largest ocean?', a: 'Pacific Ocean', options: ['Pacific Ocean', 'Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean'], type: 'multiple' },
        ],
        intermediate: [
            { q: 'What is the capital of Australia?', a: 'Canberra', options: ['Canberra', 'Sydney', 'Melbourne', 'Perth'], type: 'multiple' },
            { q: 'The Amazon River is located in South America.', a: 'True', type: 'truefalse' },
            { q: 'Mount Everest is located in the _____ mountain range.', a: 'Himalayas', type: 'fillblank' },
        ],
        advanced: [
            { q: 'What is the smallest country in the world by area?', a: 'Vatican City', options: ['Vatican City', 'Monaco', 'San Marino', 'Liechtenstein'], type: 'multiple' },
            { q: 'The Mariana Trench is the deepest point in the ocean.', a: 'True', type: 'truefalse' },
        ]
    }
};

// Topic aliases for better matching
const TOPIC_ALIASES = {
    'ww2': 'world war 2', 'wwii': 'world war 2', 'world war ii': 'world war 2', 'second world war': 'world war 2',
    'ww1': 'world war 1', 'wwi': 'world war 1', 'world war i': 'world war 1', 'first world war': 'world war 1',
    'us revolution': 'american revolution', 'revolutionary war': 'american revolution',
    'js': 'javascript', 'node': 'javascript', 'nodejs': 'javascript',
    'py': 'python', 'python3': 'python',
    'bio': 'biology', 'chem': 'chemistry', 'phys': 'physics',
    'math': 'algebra', 'maths': 'algebra',
    'calc': 'calculus', 'geo': 'geometry',
    'english': 'grammar', 'writing': 'grammar'
};

// AI Tutor Responses
const TUTOR_RESPONSES = {
    'quantum physics': `Great question! Let me explain quantum physics in simple terms:

**Quantum physics** is the study of matter and energy at the smallest scales. Here are the key concepts:

1. **Wave-Particle Duality**: Particles like electrons can behave as both waves and particles
2. **Uncertainty Principle**: You can't know both position and momentum precisely at the same time
3. **Superposition**: Particles can exist in multiple states simultaneously until observed
4. **Entanglement**: Two particles can be connected so that what happens to one instantly affects the other

Think of it like this: Imagine a coin spinning in the air - it's both heads AND tails until it lands. That's similar to superposition!

Would you like me to explain any of these concepts in more detail?`,

    'machine learning': `Excellent topic! Here's a simple explanation of **Machine Learning**:

Machine Learning is a type of AI where computers learn from data instead of being explicitly programmed.

**Three Main Types:**

1. **Supervised Learning**: Learning with labeled examples
   - Example: Showing a computer 1000 pictures of cats and dogs with labels

2. **Unsupervised Learning**: Finding patterns in unlabeled data
   - Example: Grouping customers by shopping behavior

3. **Reinforcement Learning**: Learning by trial and error with rewards
   - Example: Teaching an AI to play games

**Real-World Applications:**
- Netflix recommendations
- Email spam filters
- Self-driving cars
- Voice assistants

Would you like me to dive deeper into any of these types?`,

    'calculus': `I'd be happy to help with calculus! Let me break it down:

**Calculus** is the mathematics of change and motion. It has two main branches:

**1. Differential Calculus (Derivatives)**
- Measures rate of change
- Finding slopes of curves
- Example: If position = t², velocity = 2t

**2. Integral Calculus (Integrals)**
- Measures accumulation
- Finding areas under curves
- Opposite of derivatives

**Key Concepts:**
- **Limit**: What value a function approaches
- **Derivative**: Rate of change (slope)
- **Integral**: Sum/accumulation (area)

**Simple Example:**
If you're driving and your distance = time², then your speed (derivative) = 2×time

What specific topic in calculus would you like help with?`
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    loadUser();
    loadDecks();
    checkAuthState();
    setupEventListeners();
});

// Landing Page Navigation
function showLoginSection() {
    document.getElementById('landing-page').classList.add('hidden');
    document.getElementById('login-section').classList.remove('hidden');
}

function showLandingPage() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('landing-page').classList.remove('hidden');
}

function scrollToFeatures() {
    document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
}

function setupEventListeners() {
    // Navigation
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            switchView(view);
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // File Uploads
    setupFileUploads();

    // Chat input
    const tutorInput = document.getElementById('tutor-input');
    if (tutorInput) {
        tutorInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendTutorMessage();
            }
        });
    }

    // Login form Enter key support
    const loginEmail = document.getElementById('login-email');
    const loginPassword = document.getElementById('login-password');
    if (loginEmail) {
        loginEmail.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                loginPassword.focus();
            }
        });
    }
    if (loginPassword) {
        loginPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleLogin();
            }
        });
    }

    // Signup form Enter key support
    const signupName = document.getElementById('signup-name');
    const signupEmail = document.getElementById('signup-email');
    const signupPassword = document.getElementById('signup-password');
    if (signupName) {
        signupName.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                signupEmail.focus();
            }
        });
    }
    if (signupEmail) {
        signupEmail.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                signupPassword.focus();
            }
        });
    }
    if (signupPassword) {
        signupPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSignup();
            }
        });
    }

    // Setup payment form input formatting
    setupPaymentFormListeners();
}

// ==================== AUTHENTICATION ====================

// Simple hash function for passwords (for demo - in production use bcrypt on server)
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(16);
}

// Get all registered accounts
function getAccounts() {
    const stored = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    return stored ? JSON.parse(stored) : {};
}

// Save accounts to localStorage
function saveAccounts(accounts) {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate password strength
function isValidPassword(password) {
    return password.length >= 6;
}

function loadUser() {
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    if (stored) {
        currentUser = JSON.parse(stored);
    }

    // Security: Clear any developer bypass keys that may have been set
    localStorage.removeItem('learnflow_premium_override');
    localStorage.removeItem('learnflow_unlimited');
}

function saveUser() {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
}

function checkAuthState() {
    if (currentUser) {
        showApp();
    } else {
        showAuth();
    }
}

function showAuth() {
    document.getElementById('landing-page').classList.remove('hidden');
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('app-container').classList.add('hidden');
}

function showApp() {
    document.getElementById('landing-page').classList.add('hidden');
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    updateUserUI();
    updateUsageUI();
    renderDecks();
}

function showMainAuth() {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('email-login-form').classList.add('hidden');
    document.getElementById('signup-form').classList.add('hidden');
}

function showEmailLogin() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('email-login-form').classList.remove('hidden');
    document.getElementById('signup-form').classList.add('hidden');
    // Clear any previous input
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
}

function showEmailSignup() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('email-login-form').classList.add('hidden');
    document.getElementById('signup-form').classList.remove('hidden');
    // Clear any previous input
    document.getElementById('signup-name').value = '';
    document.getElementById('signup-email').value = '';
    document.getElementById('signup-password').value = '';
}

function showLogin() {
    showEmailLogin();
}

function showSignup() {
    showEmailSignup();
}

function handleLogin() {
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;

    // Validation
    if (!email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }

    // Check if account exists
    const accounts = getAccounts();
    const account = accounts[email];

    if (!account) {
        showToast('Account not found. Please sign up first.', 'error');
        return;
    }

    // Verify password
    const hashedPassword = simpleHash(password);
    if (account.password !== hashedPassword) {
        showToast('Incorrect password. Please try again.', 'error');
        return;
    }

    // Login successful
    currentUser = {
        id: account.id,
        email: account.email,
        name: account.name,
        plan: account.plan || 'free',
        createdAt: account.createdAt
    };

    saveUser();
    resetDailyUsage();
    showApp();
    showToast(`Welcome back, ${currentUser.name}!`);
}

function handleSignup() {
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim().toLowerCase();
    const password = document.getElementById('signup-password').value;

    // Validation
    if (!name || !email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    if (name.length < 2) {
        showToast('Name must be at least 2 characters', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }

    if (!isValidPassword(password)) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }

    // Check if email already exists
    const accounts = getAccounts();
    if (accounts[email]) {
        showToast('An account with this email already exists. Please sign in.', 'error');
        return;
    }

    // Create new account
    const newAccount = {
        id: generateId(),
        email: email,
        name: name,
        password: simpleHash(password),
        plan: 'free',
        createdAt: new Date().toISOString()
    };

    // Save to accounts
    accounts[email] = newAccount;
    saveAccounts(accounts);

    // Set as current user (without password)
    currentUser = {
        id: newAccount.id,
        email: newAccount.email,
        name: newAccount.name,
        plan: newAccount.plan,
        createdAt: newAccount.createdAt
    };

    saveUser();
    resetDailyUsage();
    showApp();
    showToast(`Welcome to LearnFlow, ${name}! Your account has been created.`);
}

function handleGoogleLogin() {
    // Redirect to Google sign-in page
    window.location.href = 'https://accounts.google.com/v3/signin/identifier?continue=https%3A%2F%2Faccounts.google.com%2F&followup=https%3A%2F%2Faccounts.google.com%2F&passive=1209600&flowName=GlifWebSignIn&flowEntry=ServiceLogin';
}

function continueAsGuest() {
    currentUser = {
        id: 'guest_' + generateId(),
        name: 'Guest',
        plan: 'guest',
        isGuest: true,
        createdAt: new Date().toISOString()
    };

    saveUser();
    resetDailyUsage();
    showApp();
    showToast('Continuing as Guest - some features are limited', 'warning');
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.USAGE);
    // Don't remove decks - they should persist for logged in users
    showAuth();
    showToast('Signed out successfully');
}

function updateUserUI() {
    const plan = PLAN_LIMITS[currentUser.plan];

    document.getElementById('user-name').textContent = currentUser.name;
    document.getElementById('user-plan').textContent = plan.name + ' Plan';
    document.getElementById('user-avatar').textContent = currentUser.name.charAt(0).toUpperCase();

    // Add special styling for Ultimate
    if (currentUser.plan === 'ultimate') {
        const planEl = document.getElementById('user-plan');
        if (planEl) {
            planEl.style.background = 'linear-gradient(135deg, #f39c12, #e74c3c)';
            planEl.style.webkitBackgroundClip = 'text';
            planEl.style.webkitTextFillColor = 'transparent';
            planEl.style.fontWeight = 'bold';
        }
    }

    // Show/hide upgrade button
    const upgradeBtn = document.getElementById('upgrade-btn');
    if (hasUltimate || effectivePlan === 'ultimate') {
        upgradeBtn.style.display = 'none';
    } else {
        upgradeBtn.style.display = 'block';
    }
}

// ==================== USAGE TRACKING ====================
function getUsage() {
    const stored = localStorage.getItem(STORAGE_KEYS.USAGE);
    if (stored) {
        const usage = JSON.parse(stored);
        // Reset if new day
        const today = new Date().toDateString();
        if (usage.date !== today) {
            return resetDailyUsage();
        }
        return usage;
    }
    return resetDailyUsage();
}

function resetDailyUsage() {
    const usage = {
        date: new Date().toDateString(),
        aiRequests: 0
    };
    localStorage.setItem(STORAGE_KEYS.USAGE, JSON.stringify(usage));
    return usage;
}

function incrementUsage() {
    const usage = getUsage();
    usage.aiRequests++;
    localStorage.setItem(STORAGE_KEYS.USAGE, JSON.stringify(usage));
    updateUsageUI();
    return usage;
}

function canUseAI() {
    const plan = PLAN_LIMITS[currentUser.plan];
    if (plan.aiRequestsPerDay === -1) return true;

    const usage = getUsage();
    return usage.aiRequests < plan.aiRequestsPerDay;
}

function updateUsageUI() {
    const plan = PLAN_LIMITS[currentUser.plan];
    const usage = getUsage();

    // Ultimate users get unlimited
    if (plan.aiRequestsPerDay === -1) {
        document.getElementById('usage-text').textContent = '∞ Unlimited AI requests';
        document.getElementById('usage-fill').style.width = '100%';
        document.getElementById('usage-fill').style.background = 'linear-gradient(135deg, #f39c12, #e74c3c)';
        return;
    }

    const limit = plan.aiRequestsPerDay;
    const current = usage.aiRequests;
    const percentage = (current / plan.aiRequestsPerDay) * 100;

    document.getElementById('usage-text').textContent = `${current} / ${limit} AI requests today`;
    document.getElementById('usage-fill').style.width = `${Math.min(percentage, 100)}%`;

    // Change color when close to limit
    if (percentage >= 80) {
        document.getElementById('usage-fill').style.background = 'linear-gradient(135deg, #f59e0b, #ef4444)';
    } else {
        document.getElementById('usage-fill').style.background = 'var(--gradient-primary)';
    }
}

function showLimitReached(message) {
    document.getElementById('limit-message').textContent = message || "You've reached your daily AI request limit.";
    document.getElementById('limit-modal').classList.add('active');
}

function closeLimitModal() {
    document.getElementById('limit-modal').classList.remove('active');
}

// ==================== PRICING & PAYMENT ====================
let selectedPlan = null;

const PLAN_DETAILS = {
    pro: {
        name: 'Pro Plan',
        price: 3,
        description: '50 AI requests/day, unlimited decks, full AI Tutor access'
    },
    ultimate: {
        name: 'Ultimate Plan',
        price: 10,
        description: 'Unlimited AI requests, Flow-AI Pro, priority support, analytics'
    }
};

function showPricing() {
    document.getElementById('pricing-modal').classList.add('active');
    updatePricingButtons();
}

function closePricingModal() {
    document.getElementById('pricing-modal').classList.remove('active');
}

// Billing Period Toggle for Landing Page Pricing
function toggleBillingPeriod(period) {
    const pricingSection = document.getElementById('pricing');
    const buttons = document.querySelectorAll('.billing-option');
    const priceAmounts = document.querySelectorAll('.price-amount');
    const periodLabels = document.querySelectorAll('.price-period');

    // Update button states
    buttons.forEach(btn => {
        const isActive = btn.dataset.period === period;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', isActive);
    });

    // Toggle yearly class on pricing section
    if (pricingSection) {
        pricingSection.classList.toggle('billing-yearly', period === 'yearly');
    }

    // Update prices
    priceAmounts.forEach(el => {
        const monthlyPrice = parseInt(el.dataset.monthly);
        const yearlyPrice = parseInt(el.dataset.yearly);

        if (period === 'yearly' && yearlyPrice > 0) {
            // Show yearly price per month equivalent
            const monthlyEquivalent = Math.round(yearlyPrice / 12);
            el.textContent = `$${monthlyEquivalent}`;
        } else {
            el.textContent = monthlyPrice === 0 ? '$0' : `$${monthlyPrice}`;
        }
    });

    // Update period labels
    periodLabels.forEach(el => {
        el.textContent = period === 'yearly' ? '/month (billed yearly)' : '/month';
    });
}

function updatePricingButtons() {
    const planBtns = document.querySelectorAll('.plan-btn');
    planBtns.forEach(btn => {
        if (btn.classList.contains('current')) {
            btn.disabled = currentUser.plan === 'free' || currentUser.plan === 'guest';
        }
    });
}

function selectPlan(planName) {
    // Check if user is a guest
    if (currentUser.isGuest) {
        showToast('Please create an account to upgrade your plan', 'error');
        closePricingModal();
        handleLogout();
        return;
    }

    selectedPlan = planName;
    showPaymentModal(planName);
}

function showPaymentModal(planName) {
    const plan = PLAN_DETAILS[planName];
    if (!plan) return;

    // Update payment modal with plan details
    document.getElementById('payment-plan-name').textContent = plan.name;
    document.getElementById('payment-plan-description').textContent = plan.description;
    document.getElementById('payment-amount').textContent = `$${plan.price}`;
    document.getElementById('pay-button-text').textContent = `Pay $${plan.price}.00`;

    // Pre-fill email if available
    if (currentUser.email) {
        document.getElementById('billing-email').value = currentUser.email;
    }

    // Reset form state
    document.getElementById('payment-form').classList.remove('hidden');
    document.getElementById('payment-success').classList.add('hidden');
    document.getElementById('pay-button').disabled = false;
    document.getElementById('payment-spinner').classList.add('hidden');
    document.getElementById('pay-button-text').classList.remove('hidden');

    // Clear previous card inputs
    document.getElementById('card-name').value = '';
    document.getElementById('card-number').value = '';
    document.getElementById('card-expiry').value = '';
    document.getElementById('card-cvv').value = '';

    // Close pricing modal and show payment modal
    closePricingModal();
    document.getElementById('payment-modal').classList.add('active');
}

function closePaymentModal() {
    document.getElementById('payment-modal').classList.remove('active');
    selectedPlan = null;
}

// Format card number with spaces
function formatCardNumber(input) {
    let value = input.value.replace(/\s/g, '').replace(/\D/g, '');
    let formatted = '';
    for (let i = 0; i < value.length && i < 16; i++) {
        if (i > 0 && i % 4 === 0) {
            formatted += ' ';
        }
        formatted += value[i];
    }
    input.value = formatted;
}

// Format expiry date
function formatExpiry(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    input.value = value;
}

// Validate card number using Luhn algorithm
function isValidCardNumber(number) {
    const digits = number.replace(/\s/g, '');
    if (digits.length < 13 || digits.length > 19) return false;

    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = parseInt(digits[i], 10);

        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }

        sum += digit;
        isEven = !isEven;
    }

    return sum % 10 === 0;
}

// Validate expiry date
function isValidExpiry(expiry) {
    const parts = expiry.split('/');
    if (parts.length !== 2) return false;

    const month = parseInt(parts[0], 10);
    const year = parseInt('20' + parts[1], 10);

    if (month < 1 || month > 12) return false;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;

    return true;
}

// Validate CVV
function isValidCVV(cvv) {
    return /^\d{3,4}$/.test(cvv);
}

// Process payment - DEMO MODE
// NOTE: Payment processing is not yet implemented.
// In production, integrate Stripe, PayPal, or another payment provider.
function processPayment(event) {
    event.preventDefault();

    // Payment integration not yet available
    showToast('Payment processing coming soon! Currently all features are free during beta.', 'info');

    // For beta, grant the plan for free
    const billingEmail = document.getElementById('billing-email').value.trim() || (currentUser ? currentUser.email : '');

    if (selectedPlan) {
        completePayment(selectedPlan, billingEmail);
    }
}

// Complete the payment and upgrade user
function completePayment(planName, email) {
    const plan = PLAN_DETAILS[planName];

    // Update current user's plan
    currentUser.plan = planName;
    currentUser.planUpdatedAt = new Date().toISOString();
    saveUser();

    // Update the account in the accounts storage
    const accounts = getAccounts();
    if (currentUser.email && accounts[currentUser.email]) {
        accounts[currentUser.email].plan = planName;
        accounts[currentUser.email].planUpdatedAt = currentUser.planUpdatedAt;
        saveAccounts(accounts);
    }

    // Save payment record
    savePaymentRecord({
        planName: planName,
        amount: plan.price,
        email: email,
        date: new Date().toISOString(),
        userId: currentUser.id
    });

    // Update UI
    updateUserUI();
    updateUsageUI();

    // Show success state
    document.getElementById('payment-form').classList.add('hidden');
    document.getElementById('payment-success').classList.remove('hidden');
    document.getElementById('success-plan-name').textContent = plan.name.replace(' Plan', '');

    showToast(`Successfully upgraded to ${plan.name}!`);
}

// Save payment record to localStorage
function savePaymentRecord(payment) {
    const paymentsKey = 'learnflow_payments';
    const stored = localStorage.getItem(paymentsKey);
    const payments = stored ? JSON.parse(stored) : [];

    payments.push(payment);
    localStorage.setItem(paymentsKey, JSON.stringify(payments));
}

// Setup payment form input formatting
function setupPaymentFormListeners() {
    const cardNumberInput = document.getElementById('card-number');
    const cardExpiryInput = document.getElementById('card-expiry');
    const cardCVVInput = document.getElementById('card-cvv');

    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function() {
            formatCardNumber(this);
        });
    }

    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', function() {
            formatExpiry(this);
        });
    }

    if (cardCVVInput) {
        cardCVVInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').substring(0, 4);
        });
    }
}

// ==================== NAVIGATION ====================
function switchView(viewName) {
    const views = document.querySelectorAll('.view');
    views.forEach(v => v.classList.remove('active'));

    const targetView = document.getElementById(`${viewName}-view`);
    if (targetView) {
        targetView.classList.add('active');
    }

    // Special handling
    if (viewName === 'my-decks') {
        renderDecks();
    } else if (viewName === 'study') {
        renderStudySelect();
    }
}

// ==================== AI QUIZ GENERATOR ====================
async function generateQuiz() {
    if (!canUseAI()) {
        showLimitReached();
        return;
    }

    const topic = document.getElementById('quiz-topic').value.trim();
    const difficulty = document.getElementById('quiz-difficulty').value;
    const count = parseInt(document.getElementById('quiz-count').value);

    if (!topic) {
        showToast('Please enter a topic', 'error');
        return;
    }

    // Check premium features
    const plan = PLAN_LIMITS[currentUser.plan];
    if (count > 20 && !plan.features.includes('advanced_quiz') && !plan.features.includes('flow_ai_pro')) {
        showLimitReached('30+ questions require Pro or Ultimate plan');
        return;
    }

    incrementUsage();

    // Get selected question types
    const selectedTypes = [];
    document.querySelectorAll('input[name="quiz-type"]:checked').forEach(cb => {
        selectedTypes.push(cb.value);
    });

    if (selectedTypes.length === 0) {
        selectedTypes.push('multiple', 'truefalse');
    }

    // Show loading state
    const inputSection = document.querySelector('#quiz-view .input-section');
    const quizContainer = document.getElementById('quiz-container');
    const generateBtn = document.querySelector('#quiz-view .ai-btn');
    const originalBtnText = generateBtn.innerHTML;

    generateBtn.innerHTML = '<span class="spinner"></span> Generating Quiz with AI...';
    generateBtn.disabled = true;
    showToast('AI is generating your quiz... Please wait', 'info');

    try {
        // Generate questions with REAL AI
        const questions = await generateQuestionsWithRealAI(topic, difficulty, count, selectedTypes);

        if (!questions || questions.length === 0) {
            throw new Error('No questions generated');
        }

        quizState = {
            questions: questions,
            currentIndex: 0,
            answers: new Array(questions.length).fill(null),
            startTime: Date.now(),
            topic: topic
        };

        // Show quiz
        inputSection.classList.add('hidden');
        quizContainer.classList.remove('hidden');
        document.getElementById('quiz-results').classList.add('hidden');
        document.getElementById('quiz-title').textContent = `Quiz: ${topic}`;

        renderQuestion();
        showToast('Quiz generated successfully!', 'success');

    } catch (error) {
        console.error('Quiz generation error:', error);
        showToast('Failed to generate quiz. Trying fallback...', 'error');

        // Fallback to knowledge base questions
        const fallbackQuestions = generateQuestionsForTopic(topic, difficulty, count, selectedTypes);

        quizState = {
            questions: fallbackQuestions,
            currentIndex: 0,
            answers: new Array(fallbackQuestions.length).fill(null),
            startTime: Date.now(),
            topic: topic
        };

        inputSection.classList.add('hidden');
        quizContainer.classList.remove('hidden');
        document.getElementById('quiz-results').classList.add('hidden');
        document.getElementById('quiz-title').textContent = `Quiz: ${topic}`;

        renderQuestion();
    } finally {
        generateBtn.innerHTML = originalBtnText;
        generateBtn.disabled = false;
    }
}

// Generate quiz questions using REAL AI
async function generateQuestionsWithRealAI(topic, difficulty, count, types) {
    const typeInstructions = types.map(t => {
        if (t === 'multiple') return 'multiple choice with 4 options';
        if (t === 'truefalse') return 'true/false';
        if (t === 'fillblank') return 'fill in the blank';
        return t;
    }).join(', ');

    const prompt = `Generate exactly ${count} quiz questions about "${topic}" at ${difficulty} difficulty level.

Question types to include: ${typeInstructions}

IMPORTANT: Return ONLY a valid JSON array with this EXACT format (no other text, no markdown):
[
  {
    "q": "The actual question text?",
    "a": "The correct answer",
    "options": ["correct answer", "wrong option 1", "wrong option 2", "wrong option 3"],
    "type": "multiple"
  },
  {
    "q": "Statement that is true or false",
    "a": "True",
    "type": "truefalse"
  }
]

Rules:
- For multiple choice: include 4 options, first one should be correct answer
- For true/false: answer must be exactly "True" or "False"
- For fill in blank: use _____ in question, answer is the word that fills it
- Questions must be educational and test real knowledge about ${topic}
- For math topics, include actual problems to solve (e.g., "What is 3/4 ÷ 1/2?")
- Make questions specific and meaningful, not generic
- ${difficulty} difficulty means: ${difficulty === 'beginner' ? 'basic concepts, simple questions' : difficulty === 'advanced' ? 'complex concepts, challenging questions' : difficulty === 'expert' ? 'expert-level, very challenging' : 'moderate difficulty'}

Return ONLY the JSON array, nothing else.`;

    const messages = [
        {
            role: 'system',
            content: 'You are a quiz generator AI. You ONLY output valid JSON arrays. No explanations, no markdown code blocks, just the raw JSON array.'
        },
        {
            role: 'user',
            content: prompt
        }
    ];

    // Try AI APIs
    let response = null;

    try {
        response = await tryBlackboxAI(messages);
    } catch (e) {
        console.log('Blackbox failed, trying DeepInfra...');
        try {
            response = await tryDeepInfra(messages);
        } catch (e2) {
            console.log('DeepInfra failed, trying Pollinations...');
            response = await tryPollinationsChat(messages);
        }
    }

    if (!response) {
        throw new Error('All AI APIs failed');
    }

    // Clean and parse the response
    let cleaned = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

    // Find the JSON array in the response
    const startIdx = cleaned.indexOf('[');
    const endIdx = cleaned.lastIndexOf(']');

    if (startIdx === -1 || endIdx === -1) {
        throw new Error('No JSON array found in response');
    }

    cleaned = cleaned.substring(startIdx, endIdx + 1);

    // Parse JSON
    const questions = JSON.parse(cleaned);

    // Validate and transform questions
    return questions.map(q => {
        const question = {
            q: q.q || q.question,
            a: q.a || q.answer || q.correct,
            type: q.type || 'multiple'
        };

        if (question.type === 'multiple' && q.options) {
            // Shuffle options so correct answer isn't always first
            question.options = shuffleArray([...q.options]);
        }

        return question;
    });
}

// Helper to shuffle array
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function generateQuestionsForTopic(topic, difficulty, count, types) {
    const userPlan = currentUser?.plan || 'guest';
    const topicKey = normalizeTopicName(topic.toLowerCase());

    // Get questions from knowledge base or generate AI questions
    let allQuestions = [];

    if (AI_KNOWLEDGE_BASE[topicKey]) {
        // We have curated questions for this topic
        allQuestions = getQuestionsForPlan(topicKey, userPlan, difficulty);
    } else {
        // Generate AI questions for unknown topics
        allQuestions = generateAIQuestions(topic, count, userPlan);
    }

    // Filter by selected question types
    let filtered = allQuestions.filter(q => types.includes(q.type));
    if (filtered.length === 0) filtered = allQuestions;

    // Shuffle questions
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);

    // Return requested number of questions
    const questions = shuffled.slice(0, count);

    // If we need more questions, duplicate with variations
    while (questions.length < count && shuffled.length > 0) {
        const idx = questions.length % shuffled.length;
        questions.push({ ...shuffled[idx] });
    }

    return questions;
}

// Normalize topic name using aliases
function normalizeTopicName(topic) {
    // Check direct match
    if (AI_KNOWLEDGE_BASE[topic]) return topic;

    // Check aliases
    if (TOPIC_ALIASES[topic]) return TOPIC_ALIASES[topic];

    // Check partial matches
    for (const [alias, normalized] of Object.entries(TOPIC_ALIASES)) {
        if (topic.includes(alias) || alias.includes(topic)) {
            return normalized;
        }
    }

    // Check if topic contains a known topic
    for (const knownTopic of Object.keys(AI_KNOWLEDGE_BASE)) {
        if (topic.includes(knownTopic) || knownTopic.includes(topic)) {
            return knownTopic;
        }
    }

    return topic;
}

// Get questions based on user's plan tier
function getQuestionsForPlan(topicKey, plan, difficulty) {
    const topicData = AI_KNOWLEDGE_BASE[topicKey];
    if (!topicData) return [];

    let questions = [];

    switch (plan) {
        case 'ultimate':
            // Ultimate: Access to ALL questions - basic, intermediate, AND advanced
            questions = [
                ...(topicData.basic || []),
                ...(topicData.intermediate || []),
                ...(topicData.advanced || [])
            ];
            break;

        case 'pro':
            // Pro: Access to basic and intermediate questions
            questions = [
                ...(topicData.basic || []),
                ...(topicData.intermediate || [])
            ];
            break;

        case 'free':
            // Free: Access to basic and some intermediate
            questions = [
                ...(topicData.basic || []),
                ...(topicData.intermediate || []).slice(0, 2)
            ];
            break;

        case 'guest':
        default:
            // Guest: Only basic questions
            questions = [...(topicData.basic || [])];
            break;
    }

    // Adjust based on difficulty selection
    if (difficulty === 'beginner' && topicData.basic) {
        questions = [...(topicData.basic || [])];
    } else if (difficulty === 'expert' && plan === 'ultimate' && topicData.advanced) {
        questions = [...(topicData.advanced || []), ...(topicData.intermediate || [])];
    }

    return questions;
}

// Generate AI questions for topics not in the knowledge base
function generateAIQuestions(topic, count, plan) {
    const questions = [];
    const capTopic = topic.charAt(0).toUpperCase() + topic.slice(1);

    // Different quality based on plan
    if (plan === 'ultimate') {
        // Ultimate: High-quality, diverse, intelligent questions
        questions.push(
            { q: `What is the primary purpose or function of ${capTopic}?`, a: 'To serve its intended function effectively', options: ['To serve its intended function effectively', 'To replace older methods', 'To increase complexity', 'To reduce efficiency'], type: 'multiple' },
            { q: `${capTopic} has evolved significantly over time.`, a: 'True', type: 'truefalse' },
            { q: `What are the key components or elements of ${capTopic}?`, a: 'Multiple interconnected elements', options: ['Multiple interconnected elements', 'A single element', 'No specific components', 'Random assortment'], type: 'multiple' },
            { q: `Understanding ${capTopic} requires knowledge of related concepts.`, a: 'True', type: 'truefalse' },
            { q: `Which field of study is ${capTopic} most closely associated with?`, a: 'Its primary discipline', options: ['Its primary discipline', 'Unrelated fields', 'No specific field', 'All fields equally'], type: 'multiple' },
            { q: `The fundamental principle underlying ${capTopic} is _____.`, a: 'its core concept', type: 'fillblank' },
            { q: `${capTopic} can be applied in practical real-world situations.`, a: 'True', type: 'truefalse' },
            { q: `What distinguishes ${capTopic} from similar concepts?`, a: 'Its unique characteristics', options: ['Its unique characteristics', 'Nothing specific', 'Its age', 'Its popularity'], type: 'multiple' },
            { q: `Experts in ${capTopic} typically specialize in specific areas.`, a: 'True', type: 'truefalse' },
            { q: `The study of ${capTopic} contributes to advancement in its field.`, a: 'True', type: 'truefalse' },
            { q: `${capTopic} intersects with multiple other disciplines.`, a: 'True', type: 'truefalse' },
            { q: `What is a common misconception about ${capTopic}?`, a: 'That it is simpler than it actually is', options: ['That it is simpler than it actually is', 'That it is very new', 'That it has no applications', 'That everyone understands it'], type: 'multiple' }
        );
    } else if (plan === 'pro') {
        // Pro: Good quality questions
        questions.push(
            { q: `${capTopic} is an important subject to understand.`, a: 'True', type: 'truefalse' },
            { q: `What best describes ${capTopic}?`, a: 'A concept with practical applications', options: ['A concept with practical applications', 'An outdated idea', 'A simple topic', 'An irrelevant subject'], type: 'multiple' },
            { q: `${capTopic} has multiple aspects to consider.`, a: 'True', type: 'truefalse' },
            { q: `Learning about ${capTopic} provides valuable knowledge.`, a: 'True', type: 'truefalse' },
            { q: `${capTopic} is studied by professionals in related fields.`, a: 'True', type: 'truefalse' },
            { q: `The basics of ${capTopic} can be learned through study and practice.`, a: 'True', type: 'truefalse' },
            { q: `${capTopic} has real-world applications.`, a: 'True', type: 'truefalse' },
            { q: `Understanding ${capTopic} helps in related areas.`, a: 'True', type: 'truefalse' }
        );
    } else if (plan === 'free') {
        // Free: Basic questions
        questions.push(
            { q: `${capTopic} is a topic worth studying.`, a: 'True', type: 'truefalse' },
            { q: `What is ${capTopic} about?`, a: 'Its main subject matter', options: ['Its main subject matter', 'Unrelated topics', 'Nothing specific', 'Random information'], type: 'multiple' },
            { q: `${capTopic} can be learned with effort.`, a: 'True', type: 'truefalse' },
            { q: `People study ${capTopic} for various reasons.`, a: 'True', type: 'truefalse' },
            { q: `${capTopic} has been studied by many people.`, a: 'True', type: 'truefalse' }
        );
    } else {
        // Guest: Very basic, limited questions
        questions.push(
            { q: `${capTopic} is a real topic of study.`, a: 'True', type: 'truefalse' },
            { q: `Is ${capTopic} important?`, a: 'Yes, it has value', options: ['Yes, it has value', 'No, not at all', 'Maybe', 'Unknown'], type: 'multiple' },
            { q: `${capTopic} exists as a concept.`, a: 'True', type: 'truefalse' }
        );
    }

    return questions.slice(0, Math.max(count, questions.length));
}

function renderQuestion() {
    const question = quizState.questions[quizState.currentIndex];
    const area = document.getElementById('quiz-question-area');

    let optionsHtml = '';

    if (question.type === 'multiple') {
        optionsHtml = question.options.map((opt, i) => {
            const letter = String.fromCharCode(65 + i);
            const selected = quizState.answers[quizState.currentIndex] === opt ? 'selected' : '';
            return `
                <button class="option-btn ${selected}" onclick="selectAnswer('${escapeHtml(opt)}')">
                    <span class="option-letter">${letter}</span>
                    <span>${escapeHtml(opt)}</span>
                </button>
            `;
        }).join('');
    } else if (question.type === 'truefalse') {
        const selectedTrue = quizState.answers[quizState.currentIndex] === 'True' ? 'selected' : '';
        const selectedFalse = quizState.answers[quizState.currentIndex] === 'False' ? 'selected' : '';
        optionsHtml = `
            <button class="option-btn ${selectedTrue}" onclick="selectAnswer('True')">
                <span class="option-letter">T</span>
                <span>True</span>
            </button>
            <button class="option-btn ${selectedFalse}" onclick="selectAnswer('False')">
                <span class="option-letter">F</span>
                <span>False</span>
            </button>
        `;
    } else if (question.type === 'fillblank') {
        const currentAnswer = quizState.answers[quizState.currentIndex] || '';
        optionsHtml = `
            <div class="input-group">
                <input type="text" id="fill-blank-answer" value="${escapeHtml(currentAnswer)}"
                    placeholder="Type your answer..."
                    onchange="selectAnswer(this.value)"
                    onkeyup="selectAnswer(this.value)">
            </div>
        `;
    }

    area.innerHTML = `
        <div class="question-card">
            <div class="question-number">Question ${quizState.currentIndex + 1} of ${quizState.questions.length}</div>
            <div class="question-text">${escapeHtml(question.q)}</div>
            <div class="question-options">
                ${optionsHtml}
            </div>
        </div>
    `;

    // Update progress
    const progress = ((quizState.currentIndex + 1) / quizState.questions.length) * 100;
    document.getElementById('quiz-progress-fill').style.width = `${progress}%`;
    document.getElementById('quiz-progress-text').textContent =
        `Question ${quizState.currentIndex + 1} of ${quizState.questions.length}`;

    // Update buttons
    document.getElementById('prev-btn').disabled = quizState.currentIndex === 0;

    if (quizState.currentIndex === quizState.questions.length - 1) {
        document.getElementById('next-btn').classList.add('hidden');
        document.getElementById('submit-btn').classList.remove('hidden');
    } else {
        document.getElementById('next-btn').classList.remove('hidden');
        document.getElementById('submit-btn').classList.add('hidden');
    }
}

function selectAnswer(answer) {
    quizState.answers[quizState.currentIndex] = answer;

    // Update UI for selection
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.textContent.includes(answer) || btn.querySelector('span:last-child')?.textContent === answer) {
            btn.classList.add('selected');
        }
    });
}

function prevQuestion() {
    if (quizState.currentIndex > 0) {
        quizState.currentIndex--;
        renderQuestion();
    }
}

function nextQuestion() {
    if (quizState.currentIndex < quizState.questions.length - 1) {
        quizState.currentIndex++;
        renderQuestion();
    }
}

function submitQuiz() {
    const endTime = Date.now();
    const timeTaken = Math.floor((endTime - quizState.startTime) / 1000);

    let correct = 0;
    const reviewItems = [];

    quizState.questions.forEach((q, i) => {
        const userAnswer = quizState.answers[i];
        const isCorrect = userAnswer?.toLowerCase() === q.a.toLowerCase();
        if (isCorrect) correct++;

        reviewItems.push({
            question: q.q,
            userAnswer: userAnswer || 'Not answered',
            correctAnswer: q.a,
            isCorrect: isCorrect
        });
    });

    const percentage = Math.round((correct / quizState.questions.length) * 100);

    // Show results
    document.getElementById('quiz-container').classList.add('hidden');
    document.getElementById('quiz-results').classList.remove('hidden');

    document.getElementById('score-value').textContent = `${percentage}%`;
    document.getElementById('correct-answers').textContent = correct;
    document.getElementById('wrong-answers').textContent = quizState.questions.length - correct;
    document.getElementById('quiz-time').textContent = formatTime(timeTaken);

    // Store wrong answers for AI help
    quizState.wrongAnswers = reviewItems.filter(item => !item.isCorrect);

    // Render review
    const reviewHtml = reviewItems.map((item, idx) => `
        <div class="review-item ${item.isCorrect ? '' : 'incorrect'}">
            <div class="review-question">${escapeHtml(item.question)}</div>
            <div class="review-answer ${item.isCorrect ? '' : 'wrong'}">
                Your answer: <span>${escapeHtml(item.userAnswer)}</span>
                ${!item.isCorrect ? `<br>Correct answer: <span style="color: var(--secondary)">${escapeHtml(item.correctAnswer)}</span>` : ''}
            </div>
            ${!item.isCorrect ? `
                <div class="ai-help-buttons">
                    <button class="ai-help-btn" onclick="explainAnswer(${idx}, 'normal')">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        Explain this
                    </button>
                    <button class="ai-help-btn toddler" onclick="explainAnswer(${idx}, 'toddler')">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                        Explain like I'm 5
                    </button>
                </div>
                <div class="ai-explanation" id="explanation-${idx}"></div>
            ` : ''}
        </div>
    `).join('');

    document.getElementById('results-review').innerHTML = reviewHtml;

    // Show AI help section if there are wrong answers
    if (quizState.wrongAnswers.length > 0) {
        showAIHelpPrompt();
    }
}

function showAIHelpPrompt() {
    const wrongCount = quizState.wrongAnswers.length;
    const totalQuestions = quizState.questions.length;
    const percentage = Math.round((1 - wrongCount / totalQuestions) * 100);

    // Analyze the wrong answers
    const analysis = analyzeWrongAnswers();

    const helpHtml = `
        <div class="ai-analysis-card">
            <div class="ai-analysis-header">
                <div class="ai-avatar">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                </div>
                <div class="ai-analysis-title">
                    <span class="ai-label">AI Analysis</span>
                    <span class="ai-status">Analyzing your results...</span>
                </div>
            </div>
            <div class="ai-analysis-body" id="ai-analysis-body">
                <div class="analysis-loading">
                    <div class="typing-indicator">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Insert after the score section
    const resultsReview = document.getElementById('results-review');
    resultsReview.insertAdjacentHTML('beforebegin', helpHtml);

    // Simulate AI "thinking" and then show analysis
    setTimeout(() => {
        document.querySelector('.ai-status').textContent = 'Analysis complete';
        showAnalysisResults(analysis, wrongCount, percentage);
    }, 1500);
}

function analyzeWrongAnswers() {
    const dominated = [];
    const struggling = [];
    const patterns = [];

    // Analyze each wrong answer
    quizState.wrongAnswers.forEach(item => {
        const q = item.question.toLowerCase();

        // Detect question types/categories
        if (q.includes('when') || q.includes('year') || q.includes('date')) {
            if (!patterns.includes('dates and timelines')) patterns.push('dates and timelines');
        }
        if (q.includes('who') || q.includes('name') || q.includes('person')) {
            if (!patterns.includes('names and people')) patterns.push('names and people');
        }
        if (q.includes('what is') || q.includes('define') || q.includes('meaning')) {
            if (!patterns.includes('definitions and concepts')) patterns.push('definitions and concepts');
        }
        if (q.includes('which') || q.includes('type') || q.includes('kind')) {
            if (!patterns.includes('classification questions')) patterns.push('classification questions');
        }
        if (q.includes('how') || q.includes('process') || q.includes('method')) {
            if (!patterns.includes('processes and methods')) patterns.push('processes and methods');
        }
        if (q.includes('why') || q.includes('cause') || q.includes('reason')) {
            if (!patterns.includes('cause and effect')) patterns.push('cause and effect');
        }
    });

    // Analyze correct answers
    quizState.questions.forEach((q, i) => {
        const userAnswer = quizState.answers[i];
        const isCorrect = userAnswer?.toLowerCase() === q.a.toLowerCase();
        if (isCorrect) {
            const qText = q.q.toLowerCase();
            if (qText.includes('true') || qText.includes('false') || q.type === 'truefalse') {
                if (!dominated.includes('True/False questions')) dominated.push('True/False questions');
            }
            if (q.type === 'multiple') {
                if (!dominated.includes('Multiple choice')) dominated.push('Multiple choice');
            }
        }
    });

    // If no patterns detected, add generic one
    if (patterns.length === 0) {
        patterns.push('specific factual recall');
    }

    return { dominated, struggling: patterns, wrongCount: quizState.wrongAnswers.length };
}

function showAnalysisResults(analysis, wrongCount, percentage) {
    const topic = quizState.topic || 'this topic';
    const analysisBody = document.getElementById('ai-analysis-body');

    let performanceLevel, performanceClass, emoji;
    if (percentage >= 80) {
        performanceLevel = 'Great job!';
        performanceClass = 'good';
        emoji = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
    } else if (percentage >= 60) {
        performanceLevel = 'Good effort!';
        performanceClass = 'okay';
        emoji = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>';
    } else if (percentage >= 40) {
        performanceLevel = 'Room for improvement';
        performanceClass = 'needs-work';
        emoji = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>';
    } else {
        performanceLevel = 'Let\'s review this together';
        performanceClass = 'struggling';
        emoji = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>';
    }

    const strugglingHtml = analysis.struggling.length > 0
        ? `<div class="analysis-section">
            <h5>Areas to focus on:</h5>
            <ul class="struggle-list">
                ${analysis.struggling.map(s => `<li><span class="struggle-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg></span> ${s}</li>`).join('')}
            </ul>
           </div>`
        : '';

    const html = `
        <div class="analysis-message ${performanceClass}">
            <p class="analysis-greeting">${emoji} <strong>${performanceLevel}</strong></p>
            <p>I've analyzed your quiz on <strong>"${topic}"</strong> and here's what I found:</p>
        </div>

        <div class="analysis-stats">
            <div class="stat-item wrong">
                <span class="stat-number">${wrongCount}</span>
                <span class="stat-label">questions missed</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${quizState.questions.length - wrongCount}</span>
                <span class="stat-label">correct answers</span>
            </div>
        </div>

        ${strugglingHtml}

        <div class="analysis-question">
            <p><strong>Would you like me to explain the questions you got wrong?</strong></p>
            <p class="analysis-subtext">I can break them down in a way that's easy to understand.</p>
        </div>

        <div class="analysis-options">
            <button class="analysis-btn primary" onclick="acceptAIHelp('normal')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                Yes, explain them
            </button>
            <button class="analysis-btn secondary" onclick="acceptAIHelp('toddler')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                    <line x1="9" y1="9" x2="9.01" y2="9"/>
                    <line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
                Explain simply (ELI5)
            </button>
            <button class="analysis-btn tertiary" onclick="dismissAIHelp()">
                No thanks, I'll review on my own
            </button>
        </div>
    `;

    analysisBody.innerHTML = html;
}

function acceptAIHelp(mode) {
    // Hide the analysis options
    const analysisBody = document.getElementById('ai-analysis-body');
    analysisBody.innerHTML = `
        <div class="analysis-accepted">
            <p><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" style="vertical-align: middle; margin-right: 6px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg><strong>Great!</strong> I'll explain each question below. Scroll down to see the explanations.</p>
        </div>
    `;

    // Explain all wrong answers
    explainAllWrong(mode);
}

function dismissAIHelp() {
    const analysisBody = document.getElementById('ai-analysis-body');
    analysisBody.innerHTML = `
        <div class="analysis-dismissed">
            <p>No problem! Click "Explain this" on any question below if you change your mind.</p>
        </div>
    `;
}

async function explainAnswer(index, mode) {
    const reviewItems = [];
    quizState.questions.forEach((q, i) => {
        const userAnswer = quizState.answers[i];
        const isCorrect = userAnswer?.toLowerCase() === q.a.toLowerCase();
        reviewItems.push({
            question: q.q,
            userAnswer: userAnswer || 'Not answered',
            correctAnswer: q.a,
            isCorrect: isCorrect
        });
    });

    const item = reviewItems[index];
    if (!item || item.isCorrect) return;

    const explanationDiv = document.getElementById(`explanation-${index}`);
    explanationDiv.innerHTML = '<div class="loading-explanation">🤔 AI is generating a detailed explanation...</div>';

    // Use REAL AI to generate explanation
    try {
        const explanation = await generateAIExplanation(item.question, item.correctAnswer, item.userAnswer, mode);
        explanationDiv.innerHTML = `<div class="explanation-content">${explanation}</div>`;
    } catch (error) {
        console.error('AI explanation failed:', error);
        // Fallback to template explanation
        const fallback = generateFallbackExplanation(item.question, item.correctAnswer, item.userAnswer, mode);
        explanationDiv.innerHTML = `<div class="explanation-content">${fallback}</div>`;
    }
}

async function explainAllWrong(mode) {
    const reviewItems = [];
    quizState.questions.forEach((q, i) => {
        const userAnswer = quizState.answers[i];
        const isCorrect = userAnswer?.toLowerCase() === q.a.toLowerCase();
        if (!isCorrect) {
            reviewItems.push({ index: i, question: q.q, correctAnswer: q.a, userAnswer: userAnswer || 'Not answered' });
        }
    });

    // Show loading for all items
    reviewItems.forEach((item) => {
        const explanationDiv = document.getElementById(`explanation-${item.index}`);
        if (explanationDiv) {
            explanationDiv.innerHTML = '<div class="loading-explanation">🤔 AI is generating a detailed explanation...</div>';
        }
    });

    // Generate explanations with AI (one at a time to avoid rate limits)
    for (const item of reviewItems) {
        const explanationDiv = document.getElementById(`explanation-${item.index}`);
        if (explanationDiv) {
            try {
                const explanation = await generateAIExplanation(item.question, item.correctAnswer, item.userAnswer, mode);
                explanationDiv.innerHTML = `<div class="explanation-content">${explanation}</div>`;
            } catch (error) {
                console.error('AI explanation failed:', error);
                const fallback = generateFallbackExplanation(item.question, item.correctAnswer, item.userAnswer, mode);
                explanationDiv.innerHTML = `<div class="explanation-content">${fallback}</div>`;
            }
        }
    }
}

// Generate explanation using REAL AI
async function generateAIExplanation(question, correctAnswer, userAnswer, mode) {
    const topic = quizState.topic || 'this topic';

    const simpleMode = mode === 'toddler';
    const prompt = simpleMode
        ? `Explain this quiz question to a 5-year-old child:

Question: "${question}"
Correct answer: "${correctAnswer}"
Student's wrong answer: "${userAnswer}"

Give a very simple, fun explanation using everyday examples like toys, animals, or food. Use simple words a child would understand. Keep it short and friendly. Format with HTML tags like <strong> for emphasis.`
        : `You are a helpful tutor. A student got this quiz question wrong. Explain the answer with a detailed step-by-step solution.

Topic: ${topic}
Question: "${question}"
Correct answer: "${correctAnswer}"
Student's answer: "${userAnswer}"

Provide a DETAILED explanation that includes:
1. **Understanding the Question**: What is being asked
2. **Step-by-Step Solution**: Show HOW to arrive at the correct answer (especially important for math - show the actual calculation steps)
3. **Why the Student's Answer Was Wrong**: Explain the specific mistake
4. **Key Concept to Remember**: A tip or rule to remember for next time

For MATH questions, you MUST show the actual calculation:
- If it's division of fractions: show "Keep, Change, Flip" method with actual numbers
- If it's algebra: show each step of solving
- If it's percentages: show the calculation formula

Format your response with HTML: use <strong> for headers, <br> for line breaks. Make it educational and helpful!`;

    const messages = [
        {
            role: 'system',
            content: simpleMode
                ? 'You are a friendly teacher explaining things to a 5-year-old. Use simple words, fun examples, and be encouraging!'
                : 'You are an expert tutor. Give detailed, step-by-step explanations. For math, ALWAYS show the actual calculation steps. Format with HTML tags.'
        },
        {
            role: 'user',
            content: prompt
        }
    ];

    // Try AI APIs
    let response = null;

    try {
        response = await tryBlackboxAI(messages);
    } catch (e) {
        console.log('Blackbox failed for explanation, trying DeepInfra...');
        try {
            response = await tryDeepInfra(messages);
        } catch (e2) {
            console.log('DeepInfra failed, trying Pollinations...');
            response = await tryPollinationsChat(messages);
        }
    }

    if (!response || response.length < 50) {
        throw new Error('AI response too short');
    }

    // Clean up the response
    let cleaned = response
        .replace(/```html\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

    return cleaned;
}

// Fallback explanation when AI fails
function generateFallbackExplanation(question, correctAnswer, userAnswer, mode) {
    const topic = quizState.topic || 'this topic';

    if (mode === 'toddler') {
        return `<strong>Let me explain this simply!</strong><br><br>
        The right answer is "<strong>${correctAnswer}</strong>".<br><br>
        You said "${userAnswer}" - that's a good try! But the correct answer is "${correctAnswer}".<br><br>
        Keep practicing and you'll get it next time! <svg width="18" height="18" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" stroke-width="1" style="vertical-align: middle;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    }

    // Check if it's a math question
    const isMath = question.match(/[\d\+\-\×\÷\/\=\²]/) ||
                   topic.toLowerCase().includes('math') ||
                   topic.toLowerCase().includes('fraction') ||
                   topic.toLowerCase().includes('algebra');

    if (isMath) {
        return `<strong>📐 Math Problem Explanation:</strong><br><br>
        <strong>Question:</strong> ${question}<br><br>
        <strong>Correct Answer:</strong> ${correctAnswer}<br>
        <strong>Your Answer:</strong> ${userAnswer}<br><br>
        <strong>How to solve:</strong><br>
        This is a ${topic} problem. The correct answer is <strong>${correctAnswer}</strong>.<br><br>
        <strong>Common mistake:</strong> You answered "${userAnswer}". Double-check your calculation steps.<br><br>
        <strong>Tip:</strong> For fraction division, remember "Keep, Change, Flip" - keep the first fraction, change ÷ to ×, and flip the second fraction!`;
    }

    return `<strong>Understanding this question:</strong><br><br>
    <strong>Question:</strong> ${question}<br><br>
    <strong>Correct Answer:</strong> ${correctAnswer}<br>
    <strong>Your Answer:</strong> ${userAnswer}<br><br>
    The correct answer is "<strong>${correctAnswer}</strong>".<br><br>
    <strong>Why:</strong> This is a key concept in ${topic}. Your answer "${userAnswer}" was incorrect.<br><br>
    <strong>Remember:</strong> Review this topic to better understand the underlying concept.`;
}

function retakeQuiz() {
    quizState.currentIndex = 0;
    quizState.answers = new Array(quizState.questions.length).fill(null);
    quizState.startTime = Date.now();

    document.getElementById('quiz-results').classList.add('hidden');
    document.getElementById('quiz-container').classList.remove('hidden');
    renderQuestion();
}

function newQuiz() {
    document.getElementById('quiz-results').classList.add('hidden');
    document.getElementById('quiz-container').classList.add('hidden');
    document.querySelector('#quiz-view .input-section').classList.remove('hidden');
    document.getElementById('quiz-topic').value = '';
}

function saveQuizAsFlashcards() {
    const cards = quizState.questions.map(q => ({
        front: q.q,
        back: q.a
    }));

    const deck = {
        id: generateId(),
        name: `Quiz: ${quizState.topic}`,
        cards: cards,
        createdAt: new Date().toISOString(),
        language: document.getElementById('language').value
    };

    decks.push(deck);
    saveDecks();
    showToast(`Saved ${cards.length} cards to flashcard deck!`);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ==================== AI TUTOR ====================
// Using FREE Hugging Face API for real AI responses

// Voice feature state
let voiceOutputEnabled = false;
let isListening = false;
let recognition = null;
let synthesis = window.speechSynthesis;
let selectedVoice = null;

// Chat history for context
let chatHistory = [];
let savedChats = [];
let currentChatId = null;

// Load saved chats from localStorage
function loadSavedChats() {
    const saved = localStorage.getItem('learnflow_saved_chats');
    if (saved) {
        savedChats = JSON.parse(saved);
    }
    renderSavedChatsList();
}

// Save chats to localStorage
function saveChatsToDB() {
    localStorage.setItem('learnflow_saved_chats', JSON.stringify(savedChats));
}

// Start a new chat
function startNewChat() {
    // Save current chat if it has messages
    if (chatHistory.length > 0 && currentChatId) {
        saveCurrentChat();
    }

    // Clear chat
    chatHistory = [];
    currentChatId = Date.now().toString();

    // Clear chat display
    const container = document.getElementById('chat-messages');
    container.innerHTML = `
        <div class="chat-message ai">
            <div class="message-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
                    <circle cx="7.5" cy="14.5" r="1.5"/>
                    <circle cx="16.5" cy="14.5" r="1.5"/>
                </svg>
            </div>
            <div class="message-content">
                <p>Hey! I'm LearnFlow AI. Ask me anything - I remember our whole conversation so feel free to ask follow-up questions!</p>
            </div>
        </div>
    `;

    // Update UI
    renderSavedChatsList();
    closeSavedChatsMenu();
}

// Save current chat
function saveCurrentChat() {
    if (chatHistory.length === 0) return;

    // Get chat title from first user message
    const firstUserMsg = chatHistory.find(m => m.role === 'user');
    const title = firstUserMsg ? firstUserMsg.content.substring(0, 40) + (firstUserMsg.content.length > 40 ? '...' : '') : 'New Chat';

    // Check if chat already exists
    const existingIndex = savedChats.findIndex(c => c.id === currentChatId);

    const chatData = {
        id: currentChatId,
        title: title,
        messages: chatHistory,
        timestamp: Date.now()
    };

    if (existingIndex >= 0) {
        savedChats[existingIndex] = chatData;
    } else {
        savedChats.unshift(chatData);
    }

    // Keep only last 50 chats
    if (savedChats.length > 50) {
        savedChats = savedChats.slice(0, 50);
    }

    saveChatsToDB();
    renderSavedChatsList();
}

// Load a saved chat
function loadChat(chatId) {
    const chat = savedChats.find(c => c.id === chatId);
    if (!chat) return;

    // Save current chat first
    if (chatHistory.length > 0 && currentChatId && currentChatId !== chatId) {
        saveCurrentChat();
    }

    currentChatId = chatId;
    chatHistory = [...chat.messages];

    // Render chat messages
    const container = document.getElementById('chat-messages');
    container.innerHTML = '';

    for (const msg of chatHistory) {
        const avatar = msg.role === 'assistant' ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
            <circle cx="7.5" cy="14.5" r="1.5"/>
            <circle cx="16.5" cy="14.5" r="1.5"/>
        </svg>` : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';

        const messageHtml = `
            <div class="chat-message ${msg.role === 'assistant' ? 'ai' : 'user'}">
                <div class="message-avatar">${avatar}</div>
                <div class="message-content">${formatTutorResponse(msg.content)}</div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', messageHtml);
    }

    container.scrollTop = container.scrollHeight;
    closeSavedChatsMenu();
}

// Delete a saved chat
function deleteChat(chatId, event) {
    event.stopPropagation();
    savedChats = savedChats.filter(c => c.id !== chatId);
    saveChatsToDB();
    renderSavedChatsList();

    if (currentChatId === chatId) {
        startNewChat();
    }
}

// Render saved chats list
function renderSavedChatsList() {
    const list = document.getElementById('saved-chats-list');
    if (!list) return;

    if (savedChats.length === 0) {
        list.innerHTML = `
            <div class="empty-chats">
                <div class="empty-chats-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
                <p>No saved chats yet</p>
            </div>
        `;
        return;
    }

    list.innerHTML = savedChats.map(chat => {
        const date = new Date(chat.timestamp);
        const timeStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const isActive = chat.id === currentChatId;

        return `
            <div class="saved-chat-item ${isActive ? 'active' : ''}" onclick="loadChat('${chat.id}')">
                <div class="chat-item-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                </div>
                <div class="chat-item-content">
                    <div class="chat-item-title">${escapeHtml(chat.title)}</div>
                    <div class="chat-item-date">${timeStr}</div>
                </div>
                <button class="chat-item-delete" onclick="deleteChat('${chat.id}', event)" title="Delete chat">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                </button>
            </div>
        `;
    }).join('');
}

// Toggle saved chats menu
function toggleSavedChatsMenu() {
    const sidebar = document.getElementById('saved-chats-sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
        renderSavedChatsList();
    }
}

function closeSavedChatsMenu() {
    const sidebar = document.getElementById('saved-chats-sidebar');
    if (sidebar) {
        sidebar.classList.remove('open');
    }
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize chats on load
document.addEventListener('DOMContentLoaded', () => {
    loadSavedChats();
    currentChatId = Date.now().toString();
});

// Initialize voice features
function initVoiceFeatures() {
    // Check if user has paid plan
    const isPaidUser = currentUser && (currentUser.plan === 'pro' || currentUser.plan === 'ultimate');

    // Update UI based on plan
    updateVoiceUI(isPaidUser);

    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');

            document.getElementById('tutor-input').value = transcript;

            // If final result, send the message
            if (event.results[0].isFinal) {
                stopListening();
                sendTutorMessage();
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            stopListening();
            showToast('Could not understand. Please try again.', 'error');
        };

        recognition.onend = () => {
            stopListening();
        };
    }

    // Load best available voice for TTS
    loadVoices();
    if (synthesis.onvoiceschanged !== undefined) {
        synthesis.onvoiceschanged = loadVoices;
    }
}

// Load available voices and pick the best one
function loadVoices() {
    const voices = synthesis.getVoices();

    // Prefer high-quality voices
    const preferredVoices = [
        'Google UK English Female',
        'Google US English',
        'Microsoft Zira',
        'Microsoft David',
        'Samantha',
        'Karen',
        'Daniel'
    ];

    for (const preferred of preferredVoices) {
        const voice = voices.find(v => v.name.includes(preferred));
        if (voice) {
            selectedVoice = voice;
            break;
        }
    }

    // Fallback to first English voice
    if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
    }
}

// Update voice UI based on user plan
function updateVoiceUI(isPaidUser) {
    const voiceToggle = document.getElementById('voice-output-toggle');
    const voiceLocked = document.getElementById('voice-locked');
    const micBtn = document.getElementById('mic-btn');

    if (isPaidUser) {
        if (voiceToggle) voiceToggle.style.display = 'flex';
        if (voiceLocked) voiceLocked.style.display = 'none';
        if (micBtn) micBtn.classList.remove('locked');
    } else {
        if (voiceToggle) voiceToggle.style.display = 'none';
        if (voiceLocked) voiceLocked.style.display = 'flex';
        if (micBtn) micBtn.classList.add('locked');
    }
}

// Toggle voice output on/off
function toggleVoiceOutput() {
    const isPaidUser = currentUser && (currentUser.plan === 'pro' || currentUser.plan === 'ultimate');

    if (!isPaidUser) {
        showToast('Voice features require Pro or Ultimate plan!', 'error');
        showPaymentModal('pro');
        return;
    }

    voiceOutputEnabled = !voiceOutputEnabled;

    const voiceLabel = document.getElementById('voice-label');
    const voiceBtn = document.getElementById('voice-output-toggle');
    const speedControl = document.getElementById('voice-speed-control');

    if (voiceOutputEnabled) {
        voiceLabel.textContent = 'Voice On';
        voiceBtn.classList.add('active');
        if (speedControl) speedControl.classList.add('visible');
        showToast('AI will now speak responses - adjust speed with slider', 'success');
        // Load saved speed
        loadVoiceSpeed();
    } else {
        voiceLabel.textContent = 'Voice Off';
        voiceBtn.classList.remove('active');
        if (speedControl) speedControl.classList.remove('visible');
        synthesis.cancel(); // Stop any ongoing speech
        showToast('Voice output disabled', 'success');
    }
}

// Toggle microphone for speech input
function toggleMicrophone() {
    const isPaidUser = currentUser && (currentUser.plan === 'pro' || currentUser.plan === 'ultimate');

    if (!isPaidUser) {
        showToast('Voice input requires Pro or Ultimate plan!', 'error');
        showPaymentModal('pro');
        return;
    }

    if (!recognition) {
        showToast('Speech recognition not supported in your browser', 'error');
        return;
    }

    if (isListening) {
        stopListening();
    } else {
        startListening();
    }
}

// Start listening to microphone
function startListening() {
    if (!recognition) return;

    isListening = true;
    const micBtn = document.getElementById('mic-btn');
    micBtn.classList.add('listening');

    // Show listening indicator
    document.getElementById('tutor-input').placeholder = '🎤 Listening... Speak now';

    try {
        recognition.start();
    } catch (e) {
        console.error('Recognition start error:', e);
        stopListening();
    }
}

// Stop listening
function stopListening() {
    isListening = false;
    const micBtn = document.getElementById('mic-btn');
    if (micBtn) micBtn.classList.remove('listening');

    document.getElementById('tutor-input').placeholder = 'Ask me anything... I\'ll think deeply before answering';

    try {
        if (recognition) recognition.stop();
    } catch (e) {
        // Ignore errors when stopping
    }
}

// Voice speed setting (0.5 to 2.0)
let voiceSpeed = 1.0;

// Change voice speed
function setVoiceSpeed(speed) {
    voiceSpeed = parseFloat(speed);
    const speedLabel = document.getElementById('speed-value');
    if (speedLabel) {
        speedLabel.textContent = speed + 'x';
    }
    // Save preference
    localStorage.setItem('learnflow_voice_speed', speed);
}

// Load saved voice speed
function loadVoiceSpeed() {
    const saved = localStorage.getItem('learnflow_voice_speed');
    if (saved) {
        voiceSpeed = parseFloat(saved);
        const slider = document.getElementById('voice-speed-slider');
        const label = document.getElementById('speed-value');
        if (slider) slider.value = voiceSpeed;
        if (label) label.textContent = voiceSpeed + 'x';
    }
}

// Initialize voice when page loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initVoiceFeatures, 500);
});

async function sendTutorMessage() {
    const input = document.getElementById('tutor-input');
    const message = input.value.trim();

    if (!message && !uploadedFile) return;

    if (!canUseAI()) {
        showLimitReached();
        return;
    }

    incrementUsage();

    // Build message with file info
    let displayMessage = message;
    let contextMessage = message;

    if (uploadedFile) {
        if (uploadedFile.type.startsWith('image/')) {
            displayMessage = message || 'Analyze this image';
            contextMessage = `[Image uploaded: ${uploadedFile.name}] ${message || 'Please analyze this image'}`;
        } else if (uploadedFileData && uploadedFileData.content) {
            displayMessage = message || `Analyze ${uploadedFile.name}`;
            contextMessage = `[File: ${uploadedFile.name}]\n\nContent:\n${uploadedFileData.content.substring(0, 2000)}\n\n${message || 'Please analyze this file'}`;
        } else {
            displayMessage = message || `Analyze ${uploadedFile.name}`;
            contextMessage = `[File uploaded: ${uploadedFile.name}] ${message || 'Please analyze this file'}`;
        }
    }

    // Add user message to display
    if (uploadedFile && uploadedFile.type.startsWith('image/') && uploadedFileData) {
        addChatMessageWithImage(displayMessage, 'user', uploadedFileData);
    } else {
        addChatMessage(displayMessage, 'user');
    }

    // Add to chat history
    chatHistory.push({ role: 'user', content: contextMessage });

    input.value = '';
    const fileContext = {
        hasFile: !!uploadedFile,
        fileType: uploadedFile ? (uploadedFile.type.startsWith('image/') ? 'image' : uploadedFileData?.type || 'file') : null,
        fileName: uploadedFile?.name,
        fileContent: uploadedFileData?.content
    };
    removeUploadedFile();

    // Show thinking indicator
    showThinkingIndicator();
    updateThinkingStatus('Thinking...');

    // Try multiple AI sources
    let response = null;

    // Method 1: Try Groq API (fast and free)
    try {
        updateThinkingStatus('Connecting to AI...');
        response = await callGroqAPI(contextMessage);
    } catch (e) {
        console.log('Groq failed, trying backup...');
    }

    // Method 2: Try Wikipedia + smart response as backup
    if (!response) {
        try {
            updateThinkingStatus('Searching knowledge base...');
            response = await searchAndRespond(contextMessage);
        } catch (e) {
            console.log('Wiki failed too');
        }
    }

    // Method 3: Final fallback
    if (!response) {
        response = generateSmartFallback(contextMessage);
    }

    // Add AI response to chat history
    chatHistory.push({ role: 'assistant', content: response });

    // Auto-save chat
    saveCurrentChat();

    hideThinkingIndicator();
    // Type out the response letter by letter
    await typeMessage(response, 'ai');
}

// Typewriter effect - types message letter by letter with smooth voice
async function typeMessage(message, sender) {
    const container = document.getElementById('chat-messages');
    const avatar = sender === 'ai' ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
        <circle cx="7.5" cy="14.5" r="1.5"/>
        <circle cx="16.5" cy="14.5" r="1.5"/>
    </svg>` : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';

    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    messageDiv.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">
            <span class="typing-text"></span><span class="typing-cursor">|</span>
        </div>
    `;
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;

    const textSpan = messageDiv.querySelector('.typing-text');
    const cursor = messageDiv.querySelector('.typing-cursor');

    // Start voice reading the full message smoothly (if enabled)
    if (voiceOutputEnabled) {
        speakFullMessage(message);
    }

    // Type out character by character
    let i = 0;
    const baseSpeed = 12;
    const typingSpeed = Math.max(3, baseSpeed / voiceSpeed);

    return new Promise((resolve) => {
        function typeChar() {
            if (i < message.length) {
                const char = message[i];
                i++;

                // Update displayed text
                textSpan.innerHTML = formatTutorResponse(message.substring(0, i));

                // Scroll to bottom
                container.scrollTop = container.scrollHeight;

                // Variable speed for natural feel
                let delay = typingSpeed;
                if (char === ' ') delay = typingSpeed * 0.5;
                if (char === '\n') delay = typingSpeed * 1.5;
                if (char === '.' || char === '!' || char === '?') delay = typingSpeed * 3;
                if (char === ',') delay = typingSpeed * 1.5;
                if (char === ':') delay = typingSpeed * 2;

                setTimeout(typeChar, delay);
            } else {
                // Done typing - remove cursor
                cursor.remove();
                resolve();
            }
        }
        typeChar();
    });
}

// Speak the full message naturally like a human - ENHANCED
function speakFullMessage(text) {
    if (!synthesis) return;

    // Cancel any ongoing speech
    synthesis.cancel();

    // Clean text for speech (remove markdown formatting)
    let cleanText = text
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/`{3}[\s\S]*?`{3}/g, '') // Remove code blocks entirely
        .replace(/`([^`]+)`/g, '$1') // Keep inline code text
        .replace(/#{1,6}\s/g, '')
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
        .replace(/^[-*]\s/gm, '') // Remove bullet points
        .replace(/^\d+\.\s/gm, '') // Remove numbered lists
        .replace(/---/g, '')
        .replace(/\n{2,}/g, '. ')
        .replace(/\n/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();

    if (!cleanText) return;

    // Find the best human-sounding voice
    const voices = synthesis.getVoices();
    let bestVoice = selectedVoice;

    // Prefer these natural-sounding voices (in order of preference)
    const preferredVoices = [
        'Google UK English Female',
        'Google UK English Male',
        'Google US English',
        'Microsoft Zira',
        'Microsoft David',
        'Samantha',
        'Karen',
        'Daniel',
        'Alex',
        'en-US',
        'en-GB'
    ];

    for (const preferred of preferredVoices) {
        const found = voices.find(v =>
            v.name.includes(preferred) ||
            v.lang.includes(preferred)
        );
        if (found) {
            bestVoice = found;
            break;
        }
    }

    // If no preferred voice, use English voice
    if (!bestVoice) {
        bestVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
    }

    // Create utterance with natural human-like settings
    const utterance = new SpeechSynthesisUtterance();

    if (bestVoice) {
        utterance.voice = bestVoice;
    }

    // Natural human-like settings - slightly slower for clarity
    utterance.rate = Math.max(0.85, voiceSpeed * 0.95); // Slightly slower than set for naturalness
    utterance.pitch = 1.05; // Slightly higher pitch sounds more natural/friendly
    utterance.volume = 1.0;

    // Add natural pauses and emphasis for human-like speech
    cleanText = cleanText
        // Add pauses after sentences
        .replace(/\. /g, '. <break time="400ms"/> ')
        .replace(/\? /g, '? <break time="500ms"/> ')
        .replace(/! /g, '! <break time="400ms"/> ')
        // Add pauses after colons and semicolons
        .replace(/: /g, ': <break time="300ms"/> ')
        .replace(/; /g, '; <break time="250ms"/> ')
        // Add slight pause after commas
        .replace(/, /g, ', <break time="150ms"/> ')
        // Add emphasis on important words (simple heuristic)
        .replace(/\b(important|key|main|critical|essential|note|remember)\b/gi, '<emphasis>$1</emphasis>');

    // Since SSML isn't always supported, use simple version with pauses
    utterance.text = cleanText
        .replace(/<break time="\d+ms"\/>/g, '...')
        .replace(/<\/?emphasis>/g, '');

    // Add event handlers for more natural flow
    utterance.onstart = () => {
        console.log('Voice started speaking');
    };

    utterance.onend = () => {
        console.log('Voice finished speaking');
    };

    utterance.onerror = (e) => {
        console.log('Voice error:', e);
    };

    synthesis.speak(utterance);
}

// Get the best available voice on page load
function selectBestVoice() {
    const voices = synthesis.getVoices();

    // Preferred natural-sounding voices
    const preferredVoices = [
        'Google UK English Female',
        'Google UK English Male',
        'Google US English',
        'Microsoft Zira Desktop',
        'Microsoft David Desktop',
        'Samantha',
        'Karen',
        'Daniel'
    ];

    for (const preferred of preferredVoices) {
        const found = voices.find(v => v.name.includes(preferred));
        if (found) {
            selectedVoice = found;
            console.log('Selected voice:', found.name);
            return;
        }
    }

    // Fallback to any English voice
    selectedVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
    if (selectedVoice) {
        console.log('Fallback voice:', selectedVoice.name);
    }
}

// Initialize voices when available
if (synthesis) {
    synthesis.onvoiceschanged = selectBestVoice;
    // Also try immediately in case voices are already loaded
    setTimeout(selectBestVoice, 100);
}

// Detect if question is about quantum physics
function isQuantumPhysicsQuestion(message) {
    const quantumKeywords = [
        'quantum', 'quant', 'superposition', 'entanglement', 'wave function',
        'schrodinger', 'schrödinger', 'heisenberg', 'uncertainty principle',
        'particle wave', 'wave particle', 'double slit', 'electron orbit',
        'quantum mechanics', 'quantum physics', 'quantum theory',
        'planck', 'photon', 'qubit', 'quantum computer', 'quantum state',
        'collapse', 'observer effect', 'measurement problem', 'decoherence',
        'tunneling', 'quantum tunnel', 'spin', 'quantum spin', 'bohr model'
    ];
    const lowerMessage = message.toLowerCase();
    return quantumKeywords.some(keyword => lowerMessage.includes(keyword));
}

// Get special quantum physics system prompt with analogies and stories
function getQuantumPhysicsPrompt() {
    return `You are a fun and engaging quantum physics tutor! When explaining quantum concepts, ALWAYS include:

1. **A VISUAL ANALOGY** - Use one of these creative analogies:
   - "Imagine a coin spinning in the air - it's both heads AND tails at the same time until you catch it. That's superposition!"
   - "Picture waves in a bathtub that suddenly become rubber ducks when you look at them - that's wave-particle duality!"
   - "Imagine a ghost that can walk through walls - electrons do this through quantum tunneling!"
   - "God plays dice with the universe - Einstein hated this, but quantum randomness is real!"
   - "Two magic crystals that always show opposite colors, no matter how far apart - that's entanglement!"

2. **A FUN ADVENTURE STORY** - Include a mini-story like:
   - "Imagine electrons are tiny adventurers exploring a castle. But here's the twist - they don't check one door at a time. They split into ghost-copies and explore EVERY door simultaneously! Only when you shine a flashlight on them do they pick just one door. That's quantum superposition!"
   - "Meet Schrödinger's cat - a cat in a box that's both alive AND dead until you peek inside. It sounds crazy, but atoms actually exist in multiple states at once!"
   - "Two quantum particles are best friends connected by an invisible string. When one spins left, the other INSTANTLY spins right - even if they're on opposite sides of the universe! Einstein called this 'spooky action at a distance.'"

3. **Clear scientific explanation** with the fun elements woven in.

Use emojis, make it exciting, and help students visualize the weird and wonderful world of quantum physics! Format nicely with **bold** for key terms.`;
}

// AI System - Uses multiple FREE AI APIs for ChatGPT-quality responses
async function callGroqAPI(message) {
    // Build conversation history for context
    const messages = [];

    // Check if this is a quantum physics question
    const isQuantum = isQuantumPhysicsQuestion(message);

    // System message - use special quantum prompt if applicable
    messages.push({
        role: 'system',
        content: isQuantum
            ? getQuantumPhysicsPrompt()
            : `You are a helpful AI assistant. Give detailed, accurate answers to any question. Use **bold** for emphasis and bullet points for lists. Be conversational and thorough.`
    });

    // Add chat history for context
    const recentHistory = chatHistory.slice(-8);
    for (const msg of recentHistory) {
        messages.push({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
        });
    }

    // Add current message
    messages.push({ role: 'user', content: message });

    // Try multiple AI APIs in order until one works
    const apis = [
        () => tryBlackboxAI(messages),
        () => tryDeepInfra(messages),
        () => tryPollinationsChat(messages),
        () => tryFreeGPT(message)
    ];

    for (const apiCall of apis) {
        try {
            updateThinkingStatus('Connecting to AI...');
            const result = await apiCall();
            if (result && result.length > 30) {
                return result;
            }
        } catch (e) {
            console.log('API attempt failed:', e.message);
            continue;
        }
    }

    throw new Error('All AI APIs failed');
}

// Blackbox AI - Free, no API key, very reliable
async function tryBlackboxAI(messages) {
    updateThinkingStatus('Thinking...');

    const response = await fetch('https://www.blackbox.ai/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            messages: messages,
            previewToken: null,
            codeModelMode: true,
            agentMode: {},
            trendingAgentMode: {},
            isMicMode: false,
            isChromeExt: false,
            githubToken: null
        })
    });

    if (!response.ok) throw new Error('Blackbox failed');

    const text = await response.text();
    // Clean up the response
    let cleaned = text.replace(/\$@\$.*?\$@\$/g, '').trim();
    if (cleaned.length > 30) return cleaned;
    throw new Error('Empty response');
}

// DeepInfra - Free tier, good models
async function tryDeepInfra(messages) {
    updateThinkingStatus('Processing...');

    const response = await fetch('https://api.deepinfra.com/v1/openai/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
            messages: messages,
            max_tokens: 2000,
            temperature: 0.7
        })
    });

    if (!response.ok) throw new Error('DeepInfra failed');

    const data = await response.json();
    if (data.choices?.[0]?.message?.content) {
        return data.choices[0].message.content;
    }
    throw new Error('No content');
}

// Pollinations Chat - Free, no key
async function tryPollinationsChat(messages) {
    updateThinkingStatus('Generating...');

    // Convert messages to single prompt
    let prompt = '';
    for (const msg of messages) {
        if (msg.role === 'system') {
            prompt += `Instructions: ${msg.content}\n\n`;
        } else if (msg.role === 'user') {
            prompt += `User: ${msg.content}\n`;
        } else {
            prompt += `Assistant: ${msg.content}\n`;
        }
    }
    prompt += 'Assistant:';

    const response = await fetch('https://text.pollinations.ai/' + encodeURIComponent(prompt));

    if (!response.ok) throw new Error('Pollinations failed');

    const text = await response.text();
    if (text && text.length > 30) return text.trim();
    throw new Error('Empty response');
}

// Free GPT alternative
async function tryFreeGPT(message) {
    updateThinkingStatus('Almost there...');

    const response = await fetch('https://chatgpt.apinepdev.workers.dev/?question=' + encodeURIComponent(message));

    if (!response.ok) throw new Error('FreeGPT failed');

    const data = await response.json();
    if (data.answer) return data.answer;
    if (data.response) return data.response;
    throw new Error('No answer');
}

// Search Wikipedia and generate smart response
async function searchAndRespond(message) {
    // Extract search query
    const searchQuery = message
        .replace(/what is|what are|who is|who are|where is|tell me about|explain|how does|why is|why do|how to|can you/gi, '')
        .replace(/\?/g, '')
        .trim();

    if (searchQuery.length < 2) {
        throw new Error('Query too short');
    }

    // Try Wikipedia
    const wikiResponse = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchQuery)}`,
        { headers: { 'Accept': 'application/json' } }
    );

    if (wikiResponse.ok) {
        const data = await wikiResponse.json();
        if (data.extract && data.extract.length > 50) {
            let response = data.extract;

            // Add title if available
            if (data.title && data.title.toLowerCase() !== searchQuery.toLowerCase()) {
                response = `**${data.title}**\n\n${response}`;
            }

            return response;
        }
    }

    // Try Wikipedia search API
    const searchResponse = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&format=json&origin=*`
    );

    if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        if (searchData.query?.search?.length > 0) {
            const firstResult = searchData.query.search[0];
            // Get the actual page
            const pageResponse = await fetch(
                `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(firstResult.title)}`,
                { headers: { 'Accept': 'application/json' } }
            );

            if (pageResponse.ok) {
                const pageData = await pageResponse.json();
                if (pageData.extract) {
                    return `**${pageData.title}**\n\n${pageData.extract}`;
                }
            }
        }
    }

    throw new Error('No Wikipedia results');
}

// Smart fallback for when APIs fail - with context awareness
function generateSmartFallback(message) {
    const lower = message.toLowerCase();

    // Check conversation history for context
    const lastUserMessages = chatHistory.filter(m => m.role === 'user').slice(-3);
    const context = lastUserMessages.map(m => m.content.toLowerCase()).join(' ');

    // Arthur Morgan / RDR2 specific responses
    if (lower.includes('arthur morgan') || lower.includes('arthur') || context.includes('arthur morgan') || lower.includes('rdr2') || lower.includes('red dead')) {
        if (lower.includes('why') && (lower.includes('die') || lower.includes('death') || lower.includes('dead'))) {
            return `**Why Arthur Morgan Dies in Red Dead Redemption 2:**

Arthur Morgan dies because he contracts **tuberculosis (TB)** after beating a man named Thomas Downes during a debt collection mission early in the game. Downes was sick with TB and coughed blood on Arthur during the confrontation.

**The Story Context:**
- Arthur spends most of the game unknowingly sick
- A doctor in Saint Denis confirms his diagnosis in Chapter 5
- His health visibly deteriorates - coughing, weight loss, pallor
- The TB is incurable in 1899 (no antibiotics existed yet)

**His Final Moments:**
- In the final mission, Arthur helps John Marston escape
- If you have high honor: Arthur dies peacefully watching the sunrise after fighting Micah
- If you have low honor: Micah executes Arthur

**Why it matters narratively:**
Arthur's death completes his redemption arc. He starts as Dutch's loyal enforcer but dies protecting John's family and giving John a chance at a better life. His illness forces him to confront his mortality and choose what kind of man he wants to be remembered as.

It's considered one of the most emotional deaths in gaming history.`;
        }
        if (lower.includes('who') || lower.includes('what')) {
            return `**Arthur Morgan** is the main protagonist of **Red Dead Redemption 2** (2018) by Rockstar Games.

**Who is he:**
- A senior member of the Van der Linde gang
- Dutch van der Linde's right-hand man
- An outlaw in the American Old West (1899)
- Voice acted by Roger Clark

**Character:**
- Tough but secretly has a good heart
- Keeps a journal with drawings and thoughts
- Can be played as honorable or dishonorable
- Has a complex relationship with the gang

**His Story (SPOILERS):**
Arthur contracts tuberculosis and slowly dies throughout the game. His illness forces him to question his loyalty to Dutch and ultimately choose redemption by helping John Marston escape.

Want to know more about his death or the game's story?`;
        }
    }

    // Quantum Physics questions - with fun analogies and stories!
    if (isQuantumPhysicsQuestion(message)) {
        if (lower.includes('superposition')) {
            return `**Quantum Superposition Explained!**

**The Coin Analogy:**
Imagine flipping a coin and catching it in your palm. While it's spinning in the air, is it heads or tails? The answer is: **it's BOTH at the same time!** Only when you catch it (observe it) does it "choose" to be one or the other.

**The Electron Adventure Story:**
Imagine tiny electrons are brave adventurers exploring a magical castle. But here's the mind-bending twist - they don't walk through one door at a time like us. Instead, they split into **ghost-copies** and explore EVERY single door in the castle **simultaneously**!

Only when you shine a flashlight on them (measure them) do they suddenly pick just ONE door and become "real" there. The other ghost-copies vanish instantly!

**The Science:**
- Particles exist in **multiple states at once** until measured
- This is described by the **wave function** (Schrödinger's equation)
- Measurement causes "wave function collapse" - picking one state
- This isn't just theory - quantum computers USE this for computing!

**Why it's mind-blowing:** An electron can be spinning UP and DOWN at the SAME TIME. It's not that we don't know which - it literally IS both until we look!`;
        }
        if (lower.includes('entanglement') || lower.includes('entangle')) {
            return `**Quantum Entanglement Explained!**

**The Magic Crystal Analogy:**
Imagine two magic crystals. When you look at one and it glows RED, the other one INSTANTLY glows BLUE - no matter if it's across the room or across the **entire universe**! No signal is sent between them. They just... know.

**The Best Friends Story:**
Two particles are born as "quantum best friends." They make a pact: "Whatever you do, I'll do the opposite!" Then they're separated - one goes to Earth, one to a distant galaxy.

Years later, a scientist measures the Earth particle - it's spinning LEFT. **INSTANTLY**, the galaxy particle becomes spinning RIGHT. Not a moment later - INSTANTLY. Faster than light could ever travel!

Einstein called this "spooky action at a distance" and refused to believe it. But experiments have proven it's REAL!

**The Science:**
- Entangled particles share a **quantum state**
- Measuring one **instantly** affects the other
- This doesn't send information faster than light (sadly, no FTL internet!)
- Used in: quantum cryptography, quantum teleportation, quantum computers

**Fun Fact:** Chinese scientists entangled particles between Earth and a satellite 1,200 km away!`;
        }
        if (lower.includes('wave') && lower.includes('particle') || lower.includes('double slit') || lower.includes('duality')) {
            return `**Wave-Particle Duality Explained!**

**The Bathtub Analogy:**
Imagine waves rippling in a bathtub. Now imagine those waves suddenly transform into tiny rubber ducks the moment you look at them! That's basically what light and electrons do.

**The Double-Slit Experiment:**
Shoot electrons through two slits at a wall:
- **Don't observe:** They create a wave interference pattern (like ripples crossing!)
- **DO observe:** They act like bullets, making two lines

The electrons KNOW if you're watching!

**The Ghost Door Story:**
Picture an electron as a tiny ghost approaching a wall with two doors. Instead of picking a door, it transforms into a spooky mist and flows through BOTH doors simultaneously! The mist from each door meets on the other side and creates beautiful ripple patterns.

But if you put a camera by the doors? The ghost gets shy, becomes solid, and walks through just ONE door like a normal person!

**The Science:**
- **Light:** Sometimes wave (interference, diffraction), sometimes particle (photoelectric effect)
- **Electrons:** Same! They're not waves OR particles - they're something new
- Observation changes behavior (measurement problem)
- This led to quantum mechanics!

**Mind-blower:** YOU are also a wave! Your wavelength is just so tiny it doesn't matter at human scale!`;
        }
        if (lower.includes('schrodinger') || lower.includes('schrödinger') || lower.includes('cat')) {
            return `**Schrödinger's Cat Explained!**

**The Thought Experiment:**
Put a cat in a sealed box with:
- A radioactive atom (50% chance to decay in 1 hour)
- A Geiger counter
- A hammer triggered by radiation
- A vial of poison

If the atom decays → hammer breaks vial → cat dies.
If the atom doesn't decay → cat lives!

**The Mind-Bender:**
Until you open the box, the atom is in SUPERPOSITION - it has BOTH decayed AND not decayed. This means the cat is **BOTH alive AND dead** at the same time!

**The Story:**
Imagine a magical cat living in a castle. This cat can walk through walls (quantum tunneling!) and be in multiple rooms at once (superposition!).

One day, a wizard puts the cat in a mystery box. Inside the box, the cat becomes a ghost-cat that's simultaneously purring happily AND taking a forever nap. Only when the wizard opens the box does the cat "decide" to be one or the other!

**What Schrödinger Actually Meant:**
He created this thought experiment to show how ABSURD quantum mechanics seemed! He was saying "surely cats can't be alive AND dead!" But actually... at the quantum level, things really DO exist in multiple states!

**The Science:**
- Illustrates the "measurement problem" in quantum mechanics
- Shows how quantum effects scale up to larger objects
- Today's "Schrödinger cat states" are made with atoms in labs!`;
        }
        // General quantum physics
        return `**Welcome to Quantum Physics!**

**The Spinning Coin Analogy:**
Imagine a coin spinning in the air. Is it heads or tails? In the quantum world, it's BOTH until you catch it! That's **superposition**.

**The Electron Adventure Story:**
Picture electrons as tiny adventurers in a magical castle. Instead of checking one door at a time, they split into ghost-copies and explore EVERY door simultaneously! Only when you shine a light on them do they pick one door.

This is why quantum computers are so powerful - they can explore all solutions at once!

**Key Quantum Concepts:**

**Wave-Particle Duality**
Light and electrons are both waves AND particles - they "choose" based on how you observe them!

**Entanglement**
Two particles become "best friends" - measuring one instantly affects the other, even across the universe!

**Quantum Tunneling**
Particles can pass through solid walls like ghosts! (This is how the Sun works!)

**Schrödinger's Cat**
A cat in a box is both alive AND dead until you look!

**Why It Matters:**
- GPS systems use quantum corrections
- Computer chips rely on quantum tunneling
- Quantum computers will revolutionize computing
- MRI machines use quantum spin

What specific quantum topic would you like to explore?`;
    }

    // Gaming questions
    if (lower.includes('game') || lower.includes('gaming') || lower.includes('play')) {
        if (lower.includes('best') || lower.includes('recommend')) {
            return `**Great gaming recommendations!**

**Popular Games by Genre:**

**Action/Adventure:**
- The Legend of Zelda: Tears of the Kingdom
- God of War Ragnarök
- Elden Ring

**FPS/Shooter:**
- Call of Duty: Modern Warfare
- Valorant
- Counter-Strike 2

**RPG:**
- Baldur's Gate 3
- Final Fantasy XVI
- Starfield

**Multiplayer:**
- Fortnite
- Minecraft
- Roblox

**Story-Driven:**
- The Last of Us
- Red Dead Redemption 2
- Cyberpunk 2077

What type of games do you enjoy? I can give more specific recommendations!`;
        }
        if (lower.includes('minecraft')) {
            return `**Minecraft** is one of the best-selling video games ever!

**What is it?**
A sandbox game where you mine resources, craft items, and build anything you can imagine in a blocky 3D world.

**Game Modes:**
- **Survival:** Gather resources, fight mobs, survive
- **Creative:** Unlimited resources, fly, build freely
- **Adventure:** Play custom maps
- **Hardcore:** One life only!

**Why it's popular:**
- Infinite creativity
- Multiplayer with friends
- Mods and custom content
- Cross-platform play

**Tips for beginners:**
1. Punch trees for wood first
2. Build shelter before nightfall
3. Never dig straight down
4. Craft a bed to skip nights`;
        }
        if (lower.includes('fortnite')) {
            return `**Fortnite** is a free-to-play battle royale game by Epic Games!

**How it works:**
- 100 players drop onto an island
- Find weapons and resources
- Build structures for defense
- Last player/team standing wins!

**Game Modes:**
- Battle Royale (Solo, Duo, Squad)
- Zero Build (no building)
- Creative (make your own games)
- LEGO Fortnite (survival crafting)

**Why it's huge:**
- Free to play
- Regular updates and events
- Celebrity concerts and crossovers
- Available on all platforms

**Tips:**
- Land at less popular spots to gear up safely
- Learn basic building (walls, ramps)
- Use headphones for audio cues
- Practice in Creative mode`;
        }
    }

    // Movies/Entertainment
    if (lower.includes('movie') || lower.includes('film') || lower.includes('watch')) {
        return `**Movie Recommendations!**

**Action:**
- John Wick series
- Top Gun: Maverick
- Mission: Impossible

**Sci-Fi:**
- Dune (2021)
- Interstellar
- The Matrix

**Comedy:**
- Barbie (2023)
- The Grand Budapest Hotel
- Superbad

**Horror:**
- Get Out
- A Quiet Place
- Hereditary

**Animation:**
- Spider-Man: Across the Spider-Verse
- Spirited Away
- The Incredibles

**Drama:**
- Oppenheimer
- The Shawshank Redemption
- Parasite

What genre are you in the mood for?`;
    }

    // Music
    if (lower.includes('music') || lower.includes('song') || lower.includes('artist') || lower.includes('singer')) {
        return `**Music Recommendations!**

**Pop:**
- Taylor Swift, The Weeknd, Dua Lipa, Harry Styles

**Hip-Hop/Rap:**
- Drake, Kendrick Lamar, Travis Scott, 21 Savage

**R&B:**
- SZA, Frank Ocean, Daniel Caesar

**Rock:**
- Måneskin, The Killers, Foo Fighters

**Electronic:**
- Calvin Harris, Disclosure, ODESZA

**Latin:**
- Bad Bunny, Peso Pluma, Karol G

**K-Pop:**
- BTS, BLACKPINK, Stray Kids

What kind of music do you like?`;
    }

    // Relationship/Life advice
    if (lower.includes('relationship') || lower.includes('girlfriend') || lower.includes('boyfriend') || lower.includes('dating') || lower.includes('crush')) {
        return `**Relationship Advice**

**General Tips:**
- **Communication is key** - Be honest and open about your feelings
- **Be yourself** - Don't pretend to be someone you're not
- **Listen actively** - Show genuine interest in what they say
- **Respect boundaries** - Everyone needs personal space
- **Take it slow** - Good relationships develop over time

**If you have a crush:**
1. Start with friendly conversation
2. Find common interests
3. Be confident but not pushy
4. Ask them to hang out casually
5. Be prepared for any answer

**In a relationship:**
- Plan quality time together
- Support each other's goals
- Handle conflicts calmly
- Keep the romance alive
- Trust each other

What specific situation are you dealing with?`;
    }

    // School/Study help
    if (lower.includes('study') || lower.includes('homework') || lower.includes('exam') || lower.includes('test') || lower.includes('school')) {
        return `**Study Tips for Success!**

**Effective Study Methods:**
1. **Pomodoro Technique** - 25 min study, 5 min break
2. **Active Recall** - Test yourself, don't just re-read
3. **Spaced Repetition** - Review over days, not all at once
4. **Teach Others** - Explaining helps you understand

**Before Exams:**
- Start studying early (not the night before!)
- Make summary sheets
- Practice with past papers
- Get good sleep (8+ hours)
- Eat well and stay hydrated

**During Exams:**
- Read all questions first
- Start with easier questions
- Manage your time
- Double-check answers

**Staying Motivated:**
- Set specific goals
- Reward yourself
- Study with friends
- Take regular breaks

What subject do you need help with?`;
    }

    // Handle "why did he/she die" questions with context
    if ((lower.includes('why') || lower.includes('how')) && (lower.includes('die') || lower.includes('died') || lower.includes('death'))) {
        // Check context for who we're talking about
        if (context.includes('arthur') || context.includes('morgan') || context.includes('red dead')) {
            return generateSmartFallback('why did arthur morgan die');
        }
    }

    // Handle follow-up questions about previous topic
    if (lower.startsWith('why') || lower.startsWith('how') || lower.startsWith('what') || lower.includes('he ') || lower.includes('she ') || lower.includes('they ')) {
        // Try to figure out what they're asking about from context
        const lastAIResponse = chatHistory.filter(m => m.role === 'assistant').slice(-1)[0];
        if (lastAIResponse) {
            const aiContent = lastAIResponse.content.toLowerCase();
            if (aiContent.includes('arthur morgan') || aiContent.includes('red dead')) {
                return generateSmartFallback('tell me more about arthur morgan red dead redemption 2');
            }
        }
    }

    // Generic response - but try to be helpful
    const topic = message.replace(/what is|what are|who is|where is|how do|explain|tell me about|can you|why did|why does|how did|\?/gi, '').trim();

    // Give a direct attempt at answering
    return `Let me try to help with **"${topic}"**!

I don't have specific information on that topic in my local knowledge base, but here's what I can tell you:

**If you're asking about:**
- **A game character's death** - Try asking "why did [full name] die in [game name]"
- **How something works** - Be specific with the topic
- **A person** - Include their full name and context

**I work best with:**
- Specific questions with full context
- Follow-up questions that reference the topic
- Questions about popular topics I have info on

Try rephrasing with more detail and I'll give you a better answer!`;
}

function addChatMessageWithImage(content, sender, imageData) {
    const container = document.getElementById('chat-messages');
    const aiAvatar = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/><circle cx="7.5" cy="14.5" r="1.5"/><circle cx="16.5" cy="14.5" r="1.5"/></svg>';
    const userAvatar = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
    const avatar = sender === 'ai' ? aiAvatar : userAvatar;

    const messageHtml = `
        <div class="chat-message ${sender}">
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <div class="message-image">
                    <img src="${imageData}" alt="Uploaded image" style="max-width: 200px; border-radius: 8px; margin-bottom: 8px;">
                </div>
                ${formatTutorResponse(content)}
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', messageHtml);
    container.scrollTop = container.scrollHeight;
}

function showThinkingIndicator() {
    const container = document.getElementById('chat-messages');
    const html = `
        <div class="chat-message ai" id="thinking-indicator">
            <div class="message-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
                    <circle cx="7.5" cy="14.5" r="1.5"/>
                    <circle cx="16.5" cy="14.5" r="1.5"/>
                </svg>
            </div>
            <div class="message-content thinking-content">
                <div class="thinking-animation">
                    <div class="thinking-brain">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="brain-icon">
                            <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
                            <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
                            <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
                            <path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/>
                            <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/>
                            <path d="M3.477 10.896a4 4 0 0 1 .585-.396"/>
                            <path d="M19.938 10.5a4 4 0 0 1 .585.396"/>
                            <path d="M6 18a4 4 0 0 1-1.967-.516"/>
                            <path d="M19.967 17.484A4 4 0 0 1 18 18"/>
                        </svg>
                    </div>
                    <div class="thinking-text">
                        <span class="thinking-status" id="thinking-status">Thinking deeply about your question...</span>
                        <div class="thinking-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
    container.scrollTop = container.scrollHeight;
}

function updateThinkingStatus(status) {
    const statusEl = document.getElementById('thinking-status');
    if (statusEl) {
        statusEl.textContent = status;
    }
}

function hideThinkingIndicator() {
    const indicator = document.getElementById('thinking-indicator');
    if (indicator) indicator.remove();
}

function askSuggestion(suggestion) {
    document.getElementById('tutor-input').value = suggestion;
    sendTutorMessage();
}

function addChatMessage(content, sender) {
    const container = document.getElementById('chat-messages');
    const aiAvatar = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/><circle cx="7.5" cy="14.5" r="1.5"/><circle cx="16.5" cy="14.5" r="1.5"/></svg>';
    const userAvatar = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
    const avatar = sender === 'ai' ? aiAvatar : userAvatar;

    const messageHtml = `
        <div class="chat-message ${sender}">
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                ${formatTutorResponse(content)}
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', messageHtml);
    container.scrollTop = container.scrollHeight;
}

function showTypingIndicator() {
    const container = document.getElementById('chat-messages');
    const aiAvatar = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/><circle cx="7.5" cy="14.5" r="1.5"/><circle cx="16.5" cy="14.5" r="1.5"/></svg>';
    const html = `
        <div class="chat-message ai" id="typing-indicator">
            <div class="message-avatar">${aiAvatar}</div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
    container.scrollTop = container.scrollHeight;
}

function hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

function generateTutorResponse(message) {
    const lowerMessage = message.toLowerCase();

    // Check for known topics
    for (const [topic, response] of Object.entries(TUTOR_RESPONSES)) {
        if (lowerMessage.includes(topic)) {
            return response;
        }
    }

    // Generic helpful response
    return `That's a great question about "${message}"!

Here's what I can tell you:

**Key Points:**
1. This topic is important for building foundational knowledge
2. Understanding the basics helps with more advanced concepts
3. Practice and repetition are key to mastery

**Suggestions:**
- Try breaking down the concept into smaller parts
- Look for real-world examples
- Create flashcards to test your understanding

Would you like me to:
- Explain this in more detail?
- Create a quiz on this topic?
- Suggest related topics to explore?

Just ask and I'll help!`;
}

// Advanced AI Response Generator - Responds like ChatGPT
function generateSmartTutorResponse(message, fileContext) {
    const lowerMessage = message.toLowerCase();
    const userPlan = currentUser?.plan || 'guest';

    // Handle file/image analysis
    if (fileContext.hasFile) {
        return generateFileAnalysisResponse(fileContext, message, userPlan);
    }

    // Check for specific topic knowledge first
    const specificResponse = getSpecificTopicResponse(lowerMessage);
    if (specificResponse) {
        return specificResponse;
    }

    // Check for known deep topics
    for (const [topic, response] of Object.entries(TUTOR_RESPONSES)) {
        if (lowerMessage.includes(topic)) {
            return response;
        }
    }

    // Generate conversational response like ChatGPT
    return generateConversationalResponse(message, lowerMessage);
}

// Specific topic knowledge base - actual answers like ChatGPT
function getSpecificTopicResponse(message) {
    // Math questions
    if (message.includes('pythagorean') || message.includes('a² + b² = c²') || message.includes('a^2 + b^2')) {
        return `The **Pythagorean Theorem** states that in a right triangle, the square of the hypotenuse (the side opposite the right angle) equals the sum of the squares of the other two sides.

**Formula:** a² + b² = c²

Where:
- **a** and **b** are the lengths of the two shorter sides (legs)
- **c** is the length of the longest side (hypotenuse)

**Example:**
If a triangle has legs of 3 and 4 units:
- 3² + 4² = c²
- 9 + 16 = c²
- 25 = c²
- c = 5

This theorem is fundamental in geometry, construction, navigation, and countless real-world applications!`;
    }

    if (message.includes('derivative') && (message.includes('what is') || message.includes('explain'))) {
        return `A **derivative** measures how a function changes as its input changes - essentially, it tells you the **rate of change** or **slope** at any point.

**Simple Explanation:**
Think of driving a car. Your position changes over time. The derivative of your position is your **speed** - how fast your position is changing.

**Key Concepts:**
- The derivative of f(x) is written as f'(x) or df/dx
- It gives you the slope of the tangent line at any point
- If f(x) = x², then f'(x) = 2x

**Basic Rules:**
- Power Rule: d/dx(xⁿ) = nxⁿ⁻¹
- Constant Rule: d/dx(c) = 0
- Sum Rule: d/dx(f + g) = f' + g'

Would you like me to work through some examples?`;
    }

    if (message.includes('photosynthesis')) {
        return `**Photosynthesis** is the process by which plants, algae, and some bacteria convert light energy into chemical energy (glucose).

**The Basic Equation:**
6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ + 6O₂

**In Simple Terms:**
Plants take in carbon dioxide and water, use sunlight as energy, and produce glucose (food) and oxygen.

**Two Main Stages:**

1. **Light-Dependent Reactions** (in thylakoids)
   - Capture light energy
   - Split water molecules
   - Produce ATP and NADPH
   - Release oxygen as a byproduct

2. **Light-Independent Reactions / Calvin Cycle** (in stroma)
   - Use ATP and NADPH
   - Convert CO₂ into glucose
   - Don't directly need light

**Why It Matters:**
- Produces the oxygen we breathe
- Creates food for the plant (and indirectly for us)
- Removes CO₂ from the atmosphere`;
    }

    if (message.includes('mitochondria') || message.includes('powerhouse of the cell')) {
        return `**Mitochondria** are organelles found in eukaryotic cells, often called the "powerhouse of the cell" because they generate most of the cell's ATP (energy currency).

**Key Facts:**
- **Function:** Cellular respiration - converting nutrients into ATP
- **Structure:** Double membrane (outer and inner with folds called cristae)
- **Unique Feature:** Has its own DNA (mtDNA) - supports the endosymbiotic theory
- **Size:** About 1-10 micrometers

**The Process (Cellular Respiration):**
C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP

**Three Stages:**
1. Glycolysis (in cytoplasm)
2. Krebs Cycle (in mitochondrial matrix)
3. Electron Transport Chain (on inner membrane)

**Fun Fact:** You inherit mitochondrial DNA only from your mother!`;
    }

    if (message.includes('world war 2') || message.includes('world war ii') || message.includes('ww2') || message.includes('wwii')) {
        if (message.includes('cause') || message.includes('start') || message.includes('why')) {
            return `**Causes of World War II:**

**1. Treaty of Versailles (1919)**
- Harsh penalties on Germany after WWI
- War guilt, territory loss, massive reparations
- Created resentment and economic hardship

**2. Rise of Fascism**
- Nazi Party in Germany (Hitler)
- Fascist Italy (Mussolini)
- Militarism in Japan
- Promised to restore national pride

**3. Great Depression (1929)**
- Economic crisis made people desperate
- Extremist parties gained support
- Nations turned to nationalism

**4. Appeasement Policy**
- Britain and France tried to avoid war
- Let Hitler annex Austria and Czechoslovakia
- Emboldened Nazi aggression

**5. Immediate Trigger**
- Germany invaded Poland on September 1, 1939
- Britain and France declared war on Germany

**Key Players:**
- **Axis:** Germany, Italy, Japan
- **Allies:** Britain, France, USSR, USA (after 1941)`;
        }
        return `**World War II (1939-1945)** was the deadliest conflict in human history, involving over 30 countries and resulting in 70-85 million deaths.

**Key Events:**
- **1939:** Germany invades Poland; war begins
- **1940:** Fall of France; Battle of Britain
- **1941:** Germany invades USSR; Japan attacks Pearl Harbor; USA enters war
- **1942-43:** Turning points at Stalingrad and Midway
- **1944:** D-Day invasion of Normandy
- **1945:** Germany surrenders (May); Atomic bombs on Japan; Japan surrenders (August)

**Major Outcomes:**
- Creation of the United Nations
- Beginning of the Cold War
- Decolonization movements
- The Holocaust revealed (6 million Jews murdered)
- Nuclear age begins

What specific aspect would you like to learn more about?`;
    }

    if (message.includes('javascript') && (message.includes('what is') || message.includes('explain'))) {
        return `**JavaScript** is a high-level, interpreted programming language primarily used to make web pages interactive.

**Key Characteristics:**
- **Runs in browsers** - no compilation needed
- **Dynamic typing** - variables can hold any type
- **Event-driven** - responds to user actions
- **Object-oriented** - uses objects and prototypes

**What You Can Do:**
- Make interactive websites
- Build web applications (React, Vue, Angular)
- Create servers (Node.js)
- Build mobile apps (React Native)
- Make games

**Basic Example:**
\`\`\`javascript
// Variables
let name = "Alex";
const age = 25;

// Function
function greet(person) {
    return "Hello, " + person + "!";
}

// Using it
console.log(greet(name)); // "Hello, Alex!"
\`\`\`

**Why Learn JavaScript:**
- Most popular programming language
- Essential for web development
- Huge job market
- Versatile (frontend, backend, mobile)

Want me to explain any specific concept?`;
    }

    if (message.includes('python') && (message.includes('what is') || message.includes('explain') || message.includes('learn'))) {
        return `**Python** is a high-level, versatile programming language known for its simple, readable syntax.

**Why Python is Popular:**
- **Easy to learn** - reads almost like English
- **Versatile** - web, data science, AI, automation
- **Huge community** - tons of libraries and support
- **In-demand** - great job opportunities

**Basic Example:**
\`\`\`python
# Variables
name = "Alex"
age = 25

# Function
def greet(person):
    return f"Hello, {person}!"

# Using it
print(greet(name))  # "Hello, Alex!"

# List
numbers = [1, 2, 3, 4, 5]
for num in numbers:
    print(num * 2)
\`\`\`

**Common Uses:**
- **Data Science:** pandas, numpy, matplotlib
- **Machine Learning:** TensorFlow, PyTorch
- **Web Development:** Django, Flask
- **Automation:** scripts, web scraping
- **Scientific Computing**

**Getting Started:**
1. Install Python from python.org
2. Use IDLE or VS Code
3. Start with basic syntax
4. Build small projects

What would you like to learn first?`;
    }

    // Return null if no specific topic matched
    return null;
}

// Generate conversational response for unknown topics
function generateConversationalResponse(originalMessage, lowerMessage) {
    // Extract the core question/topic
    const topic = originalMessage
        .replace(/^(what is|what are|what's|how do i|how to|how does|can you explain|explain|tell me about|help me understand|why is|why are|why do|why does)\s*/i, '')
        .replace(/\?+$/, '')
        .trim();

    // Detect if it's a "why" question
    if (lowerMessage.startsWith('why')) {
        return `That's a great question about **"${topic}"**.

To understand "why," we need to look at the context and causes:

**Possible Reasons:**
This often comes down to a combination of historical, social, or practical factors. The "why" behind most things involves understanding:

1. **Historical context** - What events or circumstances led to this?
2. **Purpose** - What need or problem does it address?
3. **Human nature** - How do people's behaviors or beliefs factor in?

I'd be happy to give you a more specific answer if you could tell me a bit more about what aspect you're curious about. Are you asking about:
- The historical origins?
- The underlying reasons or motivations?
- How it affects things today?

Let me know and I'll dive deeper!`;
    }

    // Detect if it's a "how" question
    if (lowerMessage.startsWith('how')) {
        return `Here's how to approach **${topic}**:

**Step-by-Step Guide:**

1. **Understand the basics first** - Make sure you have the foundational knowledge
2. **Break it into smaller parts** - Complex things become easier when divided
3. **Practice with examples** - Theory alone isn't enough
4. **Apply it yourself** - Hands-on experience is the best teacher

**Key Tips:**
- Start simple before adding complexity
- Don't be afraid to make mistakes - that's how you learn
- Look for patterns and connections

Would you like me to explain any specific part in more detail? I can give you concrete examples or walk through the process step by step.`;
    }

    // Detect if it's a "what is" definition question
    if (lowerMessage.includes('what is') || lowerMessage.includes('what are') || lowerMessage.includes('define')) {
        return `**${topic.charAt(0).toUpperCase() + topic.slice(1)}** - Let me explain this clearly:

While I don't have specific information about "${topic}" in my knowledge base, I can help you understand it better if you give me more context.

**To give you the best answer, it would help to know:**
- What subject area is this related to? (science, history, tech, etc.)
- What level of detail do you need?
- Is there a specific aspect you're most curious about?

Alternatively, I can help you with many other topics! Try asking about:
- **Science:** photosynthesis, mitochondria, physics concepts
- **Math:** derivatives, Pythagorean theorem, algebra
- **History:** World War 2, revolutions, historical events
- **Programming:** JavaScript, Python, web development
- **And much more!**

What would you like to explore?`;
    }

    // General conversational response
    return `I'd love to help you with **"${originalMessage}"**!

To give you the most accurate and helpful answer, could you tell me a bit more about:

1. **What specifically would you like to know?**
2. **What's the context?** (school, work, personal curiosity)
3. **How detailed do you want the explanation?**

In the meantime, here are some things I can definitely help with:
- **Explain concepts** in simple terms
- **Break down complex topics** step by step
- **Give examples** to make things clearer
- **Answer specific questions** about subjects like math, science, history, and programming

Just ask me something more specific and I'll do my best to help!`;
}

function analyzeQuestion(message) {
    const analysis = {
        type: 'general',
        subject: null,
        difficulty: 'intermediate',
        isDefinition: false,
        isHowTo: false,
        isExplanation: false,
        isComparison: false,
        needsExample: false,
        needsSteps: false
    };

    // Detect question type
    if (message.includes('what is') || message.includes('what are') || message.includes('define')) {
        analysis.type = 'definition';
        analysis.isDefinition = true;
    } else if (message.includes('how do') || message.includes('how to') || message.includes('how can')) {
        analysis.type = 'howto';
        analysis.isHowTo = true;
        analysis.needsSteps = true;
    } else if (message.includes('why') || message.includes('explain')) {
        analysis.type = 'explanation';
        analysis.isExplanation = true;
    } else if (message.includes('difference between') || message.includes('vs') || message.includes('compare')) {
        analysis.type = 'comparison';
        analysis.isComparison = true;
    } else if (message.includes('example') || message.includes('show me')) {
        analysis.needsExample = true;
    }

    // Detect subject
    const subjects = {
        math: ['math', 'algebra', 'calculus', 'geometry', 'equation', 'derivative', 'integral', 'function', 'variable', 'polynomial'],
        science: ['physics', 'chemistry', 'biology', 'atom', 'molecule', 'cell', 'energy', 'force', 'evolution', 'photosynthesis'],
        programming: ['code', 'programming', 'javascript', 'python', 'function', 'loop', 'array', 'variable', 'class', 'api', 'html', 'css'],
        history: ['history', 'war', 'revolution', 'ancient', 'century', 'civilization', 'empire', 'president', 'battle'],
        language: ['grammar', 'verb', 'noun', 'sentence', 'writing', 'essay', 'literature', 'poetry'],
        science_general: ['quantum', 'relativity', 'dna', 'genetics', 'climate', 'ecosystem']
    };

    for (const [subject, keywords] of Object.entries(subjects)) {
        if (keywords.some(kw => message.includes(kw))) {
            analysis.subject = subject;
            break;
        }
    }

    // Detect difficulty hints
    if (message.includes('simple') || message.includes('basic') || message.includes('easy') || message.includes('beginner') || message.includes('like i\'m 5') || message.includes('like i\'m 10')) {
        analysis.difficulty = 'simple';
    } else if (message.includes('advanced') || message.includes('complex') || message.includes('deep dive') || message.includes('detail')) {
        analysis.difficulty = 'advanced';
    }

    return analysis;
}

function generateFileAnalysisResponse(fileContext, message, userPlan) {
    const { fileType, fileName, fileContent } = fileContext;

    if (fileType === 'image') {
        // Simulate image analysis
        const imageResponses = [
            `I've analyzed the image you uploaded ("${fileName}").

**My Analysis:**

Looking at this image, I can see several key elements:

1. **Visual Content**: The image appears to contain educational material
2. **Structure**: I notice organized information that could be helpful for studying
3. **Key Details**: There are important elements that relate to your learning

**How I can help:**
- I can explain any concepts shown in the image
- I can create flashcards based on this content
- I can generate quiz questions from this material

What specific aspect would you like me to focus on?`,

            `I've carefully examined your uploaded image ("${fileName}").

**What I See:**

Based on my analysis:
- **Main Subject**: Educational content that appears to cover important concepts
- **Format**: The image shows structured information suitable for learning
- **Notable Elements**: Key terms and relationships are visible

**Suggestions:**
- Want me to break down any specific part?
- I can help you understand the relationships between concepts
- Let me know if you need this explained at a different level

What would you like to explore further?`
        ];
        return imageResponses[Math.floor(Math.random() * imageResponses.length)];
    }

    if (fileType === 'code' && fileContent) {
        // Analyze code file
        const extension = fileName.split('.').pop();
        const language = {
            'js': 'JavaScript',
            'py': 'Python',
            'html': 'HTML',
            'css': 'CSS',
            'json': 'JSON'
        }[extension] || extension.toUpperCase();

        // Basic code analysis
        const lineCount = fileContent.split('\n').length;
        const hasFunctions = /function|def |const \w+ = \(|=>/i.test(fileContent);
        const hasClasses = /class /i.test(fileContent);
        const hasLoops = /for|while|forEach|map/i.test(fileContent);
        const hasConditionals = /if|else|switch|case/i.test(fileContent);

        return `I've analyzed your ${language} file ("${fileName}").

**Code Analysis:**

**Overview:**
- **Lines of code**: ${lineCount}
- **Language**: ${language}
- **Contains functions**: ${hasFunctions ? 'Yes' : 'No'}
- **Contains classes**: ${hasClasses ? 'Yes' : 'No'}
- **Uses loops**: ${hasLoops ? 'Yes' : 'No'}
- **Has conditionals**: ${hasConditionals ? 'Yes' : 'No'}

**Structure Assessment:**
${hasFunctions ? '✓ Good use of functions for organization' : '• Consider breaking code into functions'}
${hasClasses ? '✓ Object-oriented structure detected' : ''}
${lineCount > 100 ? '• Large file - consider splitting into modules' : '✓ File size is manageable'}

**What I can help with:**
- Explain what any part of this code does
- Suggest improvements or optimizations
- Find potential bugs or issues
- Help you understand the logic flow

${message ? `\n**Regarding your question "${message}":**\nI'd be happy to focus on that specific aspect. Could you point me to the relevant section?` : 'What would you like me to explain or help with?'}`;
    }

    if (fileType === 'pdf') {
        return `I've received your PDF document ("${fileName}").

**Document Analysis:**

I can see this is a PDF file that likely contains important study material. While I can't read PDFs directly in this demo, here's how I can help:

**Suggestions:**
1. **Copy key text** from the PDF and paste it here - I'll analyze and explain it
2. **Take a screenshot** of important pages - I can analyze images
3. **Tell me the topic** - I can provide additional context and explanations

What would you like to focus on from this document?`;
    }

    return `I've received your file ("${fileName}").

I can help you understand and work with this content. Please let me know:
- What specific part would you like me to explain?
- Do you need help understanding any concepts?
- Should I create study materials from this content?`;
}

function enhanceResponse(baseResponse, analysis, userPlan) {
    // Add personalization based on analysis and plan
    let enhanced = baseResponse;

    if (analysis.difficulty === 'simple') {
        enhanced += `\n\n**Simplified Explanation:**
Think of it like this - imagine explaining to a friend who's never heard of this before. The core idea is actually pretty straightforward once you break it down!`;
    }

    if (userPlan === 'ultimate') {
        enhanced += `\n\n**Ultimate Learner Bonus:**
Since you're on the Ultimate plan, I can also:
- Generate a custom quiz on this topic
- Create flashcards for memorization
- Provide advanced practice problems
- Give you a deeper dive into related concepts

Just ask!`;
    }

    return enhanced;
}

function generateIntelligentResponse(message, analysis, userPlan) {
    const { type, subject, difficulty, isDefinition, isHowTo, isExplanation, isComparison, needsExample, needsSteps } = analysis;

    // Extract the main topic
    const topic = message
        .replace(/what is|what are|how do i|how to|explain|define|tell me about|help me understand/gi, '')
        .trim();

    let response = '';

    // Opening based on question type
    if (isDefinition) {
        response = `Great question! Let me break down **"${topic}"** for you.\n\n`;
    } else if (isHowTo) {
        response = `I'll show you exactly how to approach this. Here's a clear guide:\n\n`;
    } else if (isExplanation) {
        response = `Let me explain this thoroughly so it really makes sense.\n\n`;
    } else if (isComparison) {
        response = `Interesting comparison! Let me break down the key differences:\n\n`;
    } else {
        response = `I've thought carefully about your question. Here's what you need to know:\n\n`;
    }

    // Generate subject-specific content
    if (subject === 'math') {
        response += generateMathResponse(topic, difficulty, needsSteps);
    } else if (subject === 'programming') {
        response += generateProgrammingResponse(topic, difficulty, needsExample);
    } else if (subject === 'science') {
        response += generateScienceResponse(topic, difficulty);
    } else if (subject === 'history') {
        response += generateHistoryResponse(topic, difficulty);
    } else {
        response += generateGeneralResponse(topic, analysis, difficulty);
    }

    // Add interactive elements
    response += `\n\n**Want to go deeper?**
- Ask me to simplify or elaborate
- Request real-world examples
- I can create a quiz to test your understanding

What aspect interests you most?`;

    return response;
}

function generateMathResponse(topic, difficulty) {
    const simpleIntro = difficulty === 'simple' ? "Let's start with the basics:\n\n" : "";

    return `${simpleIntro}**Understanding ${topic}:**

**The Core Concept:**
Mathematics is about patterns and relationships. For "${topic}", the key idea is understanding how quantities relate to each other.

**Key Points:**
1. **Foundation**: Every math concept builds on simpler ideas
2. **Patterns**: Look for repeating structures and rules
3. **Practice**: Math becomes intuitive with consistent practice

**Example Application:**
Imagine you're solving a real problem - how would ${topic} help you find the answer? This practical thinking makes abstract concepts concrete.

**Common Mistakes to Avoid:**
- Don't skip steps when learning
- Always check your work
- Understand WHY, not just HOW

**Pro Tips:**
- Work through practice problems
- Visualize when possible (graphs, diagrams)
- Connect new concepts to ones you already know`;
}

function generateProgrammingResponse(topic, difficulty, needsExample) {
    return `**Understanding ${topic} in Programming:**

**Core Concept:**
Programming is about giving precise instructions to computers. ${topic} is a fundamental building block that helps you:
- Write cleaner, more efficient code
- Solve problems systematically
- Build real applications

**Key Principles:**
1. **Start simple**: Begin with the basic form before adding complexity
2. **Read the code**: Understanding how to read code is as important as writing it
3. **Practice**: Write code yourself - don't just read examples

${needsExample ? `**Example:**
\`\`\`
// Here's a simple demonstration
// This shows the basic structure
// Try modifying it to see what happens
\`\`\`` : ''}

**Best Practices:**
- Use meaningful names
- Keep functions small and focused
- Test your code frequently
- Read documentation

**Common Pitfalls:**
- Overcomplicating solutions
- Not handling edge cases
- Forgetting to test

**Next Steps:**
1. Try writing a simple example yourself
2. Experiment with different variations
3. Build something small that uses this concept`;
}

function generateScienceResponse(topic, difficulty) {
    const levelIntro = difficulty === 'simple'
        ? "Let me explain this in simple terms:\n\n"
        : difficulty === 'advanced'
            ? "Here's a detailed scientific analysis:\n\n"
            : "";

    return `${levelIntro}**Scientific Understanding of ${topic}:**

**The Big Picture:**
Science helps us understand how the world works through observation, hypothesis, and testing. ${topic} is fascinating because it connects to many other concepts.

**Key Concepts:**
1. **Observation**: What can we see or measure?
2. **Explanation**: What causes this to happen?
3. **Prediction**: What will happen next?

**How It Works:**
Every scientific concept follows natural laws. Understanding these principles helps us:
- Predict outcomes
- Solve real-world problems
- Make new discoveries

**Real-World Connections:**
This concept appears in everyday life more than you might think! From the technology you use to the natural world around you.

**Interesting Facts:**
- Scientists discovered this through careful experimentation
- It connects to multiple fields of study
- New research continues to expand our understanding

**Study Tips:**
- Focus on understanding, not memorization
- Draw diagrams to visualize concepts
- Connect to real-world examples`;
}

function generateHistoryResponse(topic, difficulty) {
    return `**Historical Analysis of ${topic}:**

**Context Matters:**
To truly understand historical events, we need to consider the time period, the people involved, and the broader circumstances.

**Key Points:**
1. **Causes**: What led to this event/period?
2. **Key Figures**: Who were the important people?
3. **Consequences**: What were the lasting effects?

**Understanding the Significance:**
History helps us understand:
- How we got to where we are today
- Patterns that repeat across time
- Lessons we can learn from the past

**Multiple Perspectives:**
Every historical event looks different depending on who's telling the story. Consider:
- Different nations' viewpoints
- Different social groups' experiences
- How interpretations change over time

**Connections:**
This period/event connects to:
- Earlier historical developments
- Later consequences
- Modern-day relevance

**Study Strategies:**
- Create timelines to visualize sequences
- Focus on cause and effect relationships
- Remember that real people lived through these events`;
}

function generateGeneralResponse(topic, analysis, difficulty) {
    return `**Deep Dive into ${topic}:**

**Let me break this down:**

First, let's understand what we're really asking about. "${topic}" is a concept that has several important dimensions.

**Key Aspects:**
1. **Definition**: What exactly is it?
2. **Context**: Where and when does it apply?
3. **Importance**: Why does it matter?

**Understanding the Fundamentals:**
Every complex topic can be broken down into simpler parts. Here's how to approach it:

- **Start with the basics**: What's the core idea?
- **Build up gradually**: Add complexity step by step
- **Make connections**: How does this relate to what you already know?

**Practical Application:**
Knowledge becomes powerful when you can apply it. Think about:
- Real situations where this applies
- Problems this knowledge can solve
- Ways to practice and reinforce learning

**Learning Strategies:**
1. **Active recall**: Test yourself instead of just re-reading
2. **Spaced repetition**: Review over time for better retention
3. **Teaching others**: Explaining helps solidify understanding

**Going Further:**
Once you've mastered the basics, explore:
- Related topics that extend this knowledge
- Advanced applications
- Current developments in this area`;
}

function formatTutorResponse(content) {
    // Convert markdown-like formatting to HTML
    return content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>')
        .replace(/- (.*?)(<br>|$)/g, '<li>$1</li>')
        .replace(/<li>/g, '</p><ul><li>')
        .replace(/<\/li>(<br>)?(?!<li>)/g, '</li></ul><p>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>')
        .replace(/<p><\/p>/g, '')
        .replace(/<p><br>/g, '<p>')
        .replace(/<br><\/p>/g, '</p>');
}

// ==================== FILE UPLOAD FOR AI TUTOR ====================
let uploadedFile = null;
let uploadedFileData = null;

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    uploadedFile = file;
    const previewArea = document.getElementById('file-preview-area');
    const previewContent = document.getElementById('file-preview');

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        showToast('File too large. Max size is 10MB.', 'error');
        return;
    }

    // Handle different file types
    if (file.type.startsWith('image/')) {
        // Image preview
        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedFileData = e.target.result;
            previewContent.innerHTML = `
                <div class="preview-image-container">
                    <img src="${e.target.result}" alt="Uploaded image" class="preview-image">
                    <span class="preview-label">📸 ${file.name}</span>
                </div>
            `;
            previewArea.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
        // PDF preview
        uploadedFileData = { type: 'pdf', name: file.name };
        previewContent.innerHTML = `
            <div class="preview-file-container">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <path d="M9 15h6M9 11h6"/>
                </svg>
                <span class="preview-label">📄 ${file.name}</span>
            </div>
        `;
        previewArea.classList.remove('hidden');

        // Read PDF text content
        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedFileData = { type: 'pdf', name: file.name, content: 'PDF document uploaded' };
        };
        reader.readAsText(file);
    } else if (file.type.startsWith('text/') || file.name.match(/\.(js|py|html|css|json|md|txt)$/)) {
        // Text/code file preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            uploadedFileData = { type: 'code', name: file.name, content: content };
            const extension = file.name.split('.').pop();
            const iconColors = {
                'js': '#f7df1e',
                'py': '#3776ab',
                'html': '#e34c26',
                'css': '#1572b6',
                'json': '#292929',
                'md': '#083fa1'
            };
            previewContent.innerHTML = `
                <div class="preview-file-container">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${iconColors[extension] || '#6366f1'}" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <polyline points="16 17 12 21 8 17M16 12 12 8 8 12"/>
                    </svg>
                    <span class="preview-label"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>${file.name}</span>
                    <span class="preview-size">${(content.length / 1024).toFixed(1)}KB</span>
                </div>
            `;
            previewArea.classList.remove('hidden');
        };
        reader.readAsText(file);
    } else {
        // Other files
        uploadedFileData = { type: 'file', name: file.name };
        previewContent.innerHTML = `
            <div class="preview-file-container">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                </svg>
                <span class="preview-label">📎 ${file.name}</span>
            </div>
        `;
        previewArea.classList.remove('hidden');
    }

    // Clear the input so same file can be re-uploaded
    event.target.value = '';
}

function removeUploadedFile() {
    uploadedFile = null;
    uploadedFileData = null;
    document.getElementById('file-preview-area').classList.add('hidden');
    document.getElementById('file-preview').innerHTML = '';
}

// ==================== FLASHCARD FUNCTIONS ====================
function loadDecks() {
    const stored = localStorage.getItem(STORAGE_KEYS.DECKS);
    decks = stored ? JSON.parse(stored) : [];
}

function saveDecks() {
    localStorage.setItem(STORAGE_KEYS.DECKS, JSON.stringify(decks));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Quick Import
function importQuizlet() {
    const content = document.getElementById('quizlet-content').value.trim();
    const deckName = document.getElementById('quizlet-deck-name').value.trim() || 'Imported Deck';

    if (!content) {
        showToast('Please paste your flashcard content', 'error');
        return;
    }

    const cards = parseImportContent(content);

    if (cards.length === 0) {
        showToast('No valid flashcards found. Use format: Term - Definition', 'error');
        return;
    }

    previewCards = cards;
    previewDeckName = deckName;
    showPreviewModal();
}

function parseImportContent(content) {
    const cards = [];
    const lines = content.split('\n').filter(line => line.trim());

    for (const line of lines) {
        let front, back;

        if (line.includes('\t')) {
            [front, back] = line.split('\t').map(s => s.trim());
        } else if (line.includes(' - ')) {
            const parts = line.split(' - ');
            front = parts[0].trim();
            back = parts.slice(1).join(' - ').trim();
        } else if (line.includes(': ')) {
            const parts = line.split(': ');
            front = parts[0].trim();
            back = parts.slice(1).join(': ').trim();
        }

        if (front && back) {
            cards.push({ front, back });
        }
    }

    return cards;
}

// YouTube Functions
function summarizeYouTube() {
    if (!canUseAI()) {
        showLimitReached();
        return;
    }

    const transcript = document.getElementById('youtube-transcript').value.trim();

    if (!transcript) {
        showToast('Please paste the video transcript', 'error');
        return;
    }

    incrementUsage();

    const summary = generateSummary(transcript, 'video');
    const output = document.getElementById('youtube-output');
    output.innerHTML = `<h3>📋 Video Summary</h3><div class="summary">${summary}</div>`;
    output.classList.add('active');
}

function youtubeToFlashcards() {
    const transcript = document.getElementById('youtube-transcript').value.trim();
    const deckName = document.getElementById('youtube-deck-name').value.trim() || 'YouTube Video';

    if (!transcript) {
        showToast('Please paste the video transcript', 'error');
        return;
    }

    const cards = generateFlashcardsFromContent(transcript);

    if (cards.length === 0) {
        showToast('Could not generate flashcards', 'error');
        return;
    }

    previewCards = cards;
    previewDeckName = deckName;
    showPreviewModal();
}

// PDF Functions
function summarizePDF() {
    if (!canUseAI()) {
        showLimitReached();
        return;
    }

    const content = document.getElementById('pdf-content').value.trim();

    if (!content) {
        showToast('Please paste PDF content', 'error');
        return;
    }

    incrementUsage();

    const summary = generateSummary(content, 'document');
    const output = document.getElementById('pdf-output');
    output.innerHTML = `<h3>📋 Document Summary</h3><div class="summary">${summary}</div>`;
    output.classList.add('active');
}

function pdfToFlashcards() {
    const content = document.getElementById('pdf-content').value.trim();
    const deckName = document.getElementById('pdf-deck-name').value.trim() || 'PDF Study Deck';

    if (!content) {
        showToast('Please paste PDF content', 'error');
        return;
    }

    const cards = generateFlashcardsFromContent(content);
    previewCards = cards;
    previewDeckName = deckName;
    showPreviewModal();
}

// Notes Functions
function notesToFlashcards() {
    const content = document.getElementById('notes-content').value.trim();
    const deckName = document.getElementById('notes-deck-name').value.trim() || 'Notes Deck';
    const style = document.querySelector('input[name="notes-style"]:checked').value;

    if (!content) {
        showToast('Please enter your notes', 'error');
        return;
    }

    const cards = generateFlashcardsFromNotes(content, style);
    previewCards = cards;
    previewDeckName = deckName;
    showPreviewModal();
}

function generateFlashcardsFromNotes(content, style) {
    const cards = [];
    const lines = content.split('\n').filter(line => line.trim());

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Q/A format
        if (line.toLowerCase().startsWith('q:')) {
            const question = line.replace(/^q:/i, '').trim();
            const nextLine = lines[i + 1]?.trim() || '';
            if (nextLine.toLowerCase().startsWith('a:')) {
                cards.push({ front: question, back: nextLine.replace(/^a:/i, '').trim() });
                i++;
                continue;
            }
        }

        // Term: Definition
        if (line.includes(':') && !line.startsWith('•') && !line.startsWith('-')) {
            const [term, ...rest] = line.split(':');
            const definition = rest.join(':').trim();
            if (term.length < 100 && definition) {
                cards.push({ front: term.trim(), back: definition });
                continue;
            }
        }

        // Bullet points
        if ((line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) && line.length > 5) {
            const text = line.replace(/^[•\-*]\s*/, '').trim();
            if (text.includes(' - ')) {
                const [front, back] = text.split(' - ');
                cards.push({ front: front.trim(), back: back.trim() });
            } else if (style === 'cloze' && text.length > 20) {
                const words = text.split(' ');
                const keywordIndex = Math.floor(words.length / 2);
                const keyword = words[keywordIndex];
                if (keyword.length > 3) {
                    words[keywordIndex] = '_____';
                    cards.push({ front: words.join(' '), back: keyword });
                }
            } else {
                const question = generateQuestionFromStatement(text);
                if (question) {
                    cards.push({ front: question, back: text });
                }
            }
        }
    }

    return cards.slice(0, 50);
}

// PowerPoint Functions
function summarizePPT() {
    if (!canUseAI()) {
        showLimitReached();
        return;
    }

    const content = document.getElementById('ppt-content').value.trim();

    if (!content) {
        showToast('Please paste slide content', 'error');
        return;
    }

    incrementUsage();

    const summary = generateSummary(content, 'presentation');
    const output = document.getElementById('ppt-output');
    output.innerHTML = `<h3>📋 Presentation Summary</h3><div class="summary">${summary}</div>`;
    output.classList.add('active');
}

function pptToFlashcards() {
    const content = document.getElementById('ppt-content').value.trim();
    const deckName = document.getElementById('ppt-deck-name').value.trim() || 'PowerPoint Deck';

    if (!content) {
        showToast('Please paste slide content', 'error');
        return;
    }

    const cards = generateFlashcardsFromSlides(content);
    previewCards = cards;
    previewDeckName = deckName;
    showPreviewModal();
}

function generateFlashcardsFromSlides(content) {
    const cards = [];
    const slides = content.split(/slide\s*\d*:?/gi).filter(s => s.trim());

    for (const slide of slides) {
        const lines = slide.split('\n').filter(l => l.trim());
        if (lines.length === 0) continue;

        const title = lines[0].replace(/^[-•*]\s*/, '').trim();
        const bullets = lines.slice(1).map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(l => l);

        if (title && bullets.length > 0) {
            cards.push({
                front: `What are the key points about: ${title}?`,
                back: bullets.join('\n• ')
            });
        }
    }

    if (cards.length === 0) {
        return generateFlashcardsFromContent(content);
    }

    return cards;
}

// Content Processing
function generateSummary(content, type) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const wordCount = content.split(/\s+/).length;

    let summary = `Content Analysis:\n`;
    summary += `• Total words: ${wordCount}\n`;
    summary += `• Key sentences: ${sentences.length}\n\n`;
    summary += `Main Points:\n`;

    const keyPoints = sentences.slice(0, 8);
    for (const point of keyPoints) {
        summary += `• ${point.trim()}.\n`;
    }

    summary += `\nTip: Use "Create Flashcards" to study this ${type}!`;
    return summary;
}

function generateFlashcardsFromContent(content) {
    const cards = [];
    const sentences = content.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20 && s.length < 300);

    for (const sentence of sentences.slice(0, 25)) {
        const question = generateQuestionFromStatement(sentence);
        if (question) {
            cards.push({ front: question, back: sentence });
        }
    }

    return cards;
}

function generateQuestionFromStatement(statement) {
    const s = statement.trim();
    if (s.length < 20 || s.length > 250) return null;

    if (s.includes(' is ')) {
        const parts = s.split(' is ');
        if (parts[0].split(' ').length <= 5) {
            return `What is ${parts[0].toLowerCase()}?`;
        }
    }

    if (s.includes(' are ')) {
        const parts = s.split(' are ');
        if (parts[0].split(' ').length <= 5) {
            return `What are ${parts[0].toLowerCase()}?`;
        }
    }

    return `Explain: ${s.split(' ').slice(0, 4).join(' ')}...`;
}

// File Uploads
function setupFileUploads() {
    const pdfFile = document.getElementById('pdf-file');
    const pptFile = document.getElementById('ppt-file');

    if (pdfFile) {
        pdfFile.addEventListener('change', (e) => handleFileUpload(e, 'pdf-content', 'pdf-upload'));
    }
    if (pptFile) {
        pptFile.addEventListener('change', (e) => handleFileUpload(e, 'ppt-content', 'ppt-upload'));
    }
}

function handleFileUpload(e, textareaId, uploadId) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.name.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = (event) => {
            document.getElementById(textareaId).value = event.target.result;
        };
        reader.readAsText(file);
    }

    document.querySelector(`#${uploadId} .upload-area p`).textContent = `File: ${file.name}`;
}

// Preview Modal
function showPreviewModal() {
    const modal = document.getElementById('preview-modal');
    const container = document.getElementById('preview-cards');

    container.innerHTML = previewCards.map((card, i) => `
        <div class="preview-card">
            <div class="front"><strong>${i + 1}.</strong> ${escapeHtml(card.front)}</div>
            <div class="back">${escapeHtml(card.back)}</div>
        </div>
    `).join('');

    modal.classList.add('active');
}

function closePreviewModal() {
    document.getElementById('preview-modal').classList.remove('active');
    previewCards = [];
    previewDeckName = '';
}

function savePreviewedCards() {
    if (previewCards.length === 0) return;

    // Check limits
    const plan = PLAN_LIMITS[currentUser.plan];
    if (plan.maxDecks !== -1 && decks.length >= plan.maxDecks) {
        showLimitReached(`You've reached the maximum of ${plan.maxDecks} decks. Upgrade to create more!`);
        return;
    }

    if (plan.maxCardsPerDeck !== -1 && previewCards.length > plan.maxCardsPerDeck) {
        previewCards = previewCards.slice(0, plan.maxCardsPerDeck);
        showToast(`Limited to ${plan.maxCardsPerDeck} cards per deck on your plan`, 'warning');
    }

    const deck = {
        id: generateId(),
        name: previewDeckName,
        cards: previewCards,
        createdAt: new Date().toISOString(),
        language: document.getElementById('language').value
    };

    decks.push(deck);
    saveDecks();

    closePreviewModal();
    showToast(`Created deck "${deck.name}" with ${deck.cards.length} cards!`);

    // Clear inputs
    document.querySelectorAll('input[type="text"], textarea').forEach(el => el.value = '');

    // Switch to decks
    switchView('my-decks');
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === 'my-decks');
    });
}

// Deck Management
function renderDecks() {
    const container = document.getElementById('decks-list');

    if (decks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></div>
                <h3>No decks yet</h3>
                <p>Create your first flashcard deck using any of the tools!</p>
            </div>
        `;
        return;
    }

    const LANGUAGES = {
        en: 'English', es: 'Spanish', fr: 'French', de: 'German',
        it: 'Italian', pt: 'Portuguese', zh: 'Chinese', ja: 'Japanese',
        ko: 'Korean', ar: 'Arabic', hi: 'Hindi', ru: 'Russian'
    };

    container.innerHTML = decks.map(deck => `
        <div class="deck-card">
            <div class="deck-card-header">
                <h3>${escapeHtml(deck.name)}</h3>
            </div>
            <div class="deck-card-meta">
                <span>📇 ${deck.cards.length} cards</span>
                <span>🌐 ${LANGUAGES[deck.language] || 'English'}</span>
                <span>📅 ${new Date(deck.createdAt).toLocaleDateString()}</span>
            </div>
            <div class="deck-card-actions">
                <button class="deck-action-btn" onclick="startStudy('${deck.id}')">Study</button>
                <button class="deck-action-btn" onclick="editDeck('${deck.id}')">Edit</button>
                <button class="deck-action-btn" onclick="exportDeck('${deck.id}')">Export</button>
                <button class="deck-action-btn danger" onclick="deleteDeck('${deck.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function editDeck(deckId) {
    const deck = decks.find(d => d.id === deckId);
    if (!deck) return;

    editingDeckId = deckId;
    document.getElementById('edit-deck-name').value = deck.name;

    const editor = document.getElementById('cards-editor');
    editor.innerHTML = deck.cards.map((card, i) => `
        <div class="card-edit-item" data-index="${i}">
            <textarea placeholder="Front">${escapeHtml(card.front)}</textarea>
            <textarea placeholder="Back">${escapeHtml(card.back)}</textarea>
            <button class="delete-card" onclick="removeCardFromEditor(${i})"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
        </div>
    `).join('');

    document.getElementById('edit-deck-modal').classList.add('active');
}

function addCardToEditor() {
    const editor = document.getElementById('cards-editor');
    const index = editor.children.length;

    editor.insertAdjacentHTML('beforeend', `
        <div class="card-edit-item" data-index="${index}">
            <textarea placeholder="Front"></textarea>
            <textarea placeholder="Back"></textarea>
            <button class="delete-card" onclick="removeCardFromEditor(${index})"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
        </div>
    `);
}

function removeCardFromEditor(index) {
    const items = document.querySelectorAll('#cards-editor .card-edit-item');
    if (items[index]) items[index].remove();
}

function saveEditedDeck() {
    const deck = decks.find(d => d.id === editingDeckId);
    if (!deck) return;

    deck.name = document.getElementById('edit-deck-name').value.trim() || deck.name;

    const items = document.querySelectorAll('#cards-editor .card-edit-item');
    deck.cards = Array.from(items).map(item => {
        const textareas = item.querySelectorAll('textarea');
        return { front: textareas[0].value.trim(), back: textareas[1].value.trim() };
    }).filter(card => card.front && card.back);

    saveDecks();
    closeEditModal();
    renderDecks();
    showToast('Deck updated!');
}

function closeEditModal() {
    document.getElementById('edit-deck-modal').classList.remove('active');
    editingDeckId = null;
}

function deleteDeck(deckId) {
    if (!confirm('Delete this deck?')) return;
    decks = decks.filter(d => d.id !== deckId);
    saveDecks();
    renderDecks();
    showToast('Deck deleted');
}

function exportDeck(deckId) {
    const deck = decks.find(d => d.id === deckId);
    if (!deck) return;

    const content = deck.cards.map(c => `${c.front}\t${c.back}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${deck.name.replace(/[^a-z0-9]/gi, '_')}.txt`;
    a.click();

    URL.revokeObjectURL(url);
    showToast('Deck exported!');
}

// Study Mode
function renderStudySelect() {
    const container = document.getElementById('deck-select-list');

    if (decks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></div>
                <h3>No decks to study</h3>
                <p>Create some flashcard decks first!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = decks.map(deck => `
        <div class="deck-select-item" onclick="startStudy('${deck.id}')">
            <h4>${escapeHtml(deck.name)}</h4>
            <span>${deck.cards.length} cards</span>
        </div>
    `).join('');

    document.getElementById('study-select').style.display = 'block';
    document.getElementById('study-session').style.display = 'none';
    document.getElementById('study-complete').style.display = 'none';
}

function startStudy(deckId) {
    const deck = decks.find(d => d.id === deckId);
    if (!deck || deck.cards.length === 0) return;

    const shuffled = [...deck.cards].sort(() => Math.random() - 0.5);

    studySession = {
        deck: deck,
        cards: shuffled,
        currentIndex: 0,
        correct: [],
        wrong: [],
        isFlipped: false
    };

    document.getElementById('study-select').style.display = 'none';
    document.getElementById('study-session').style.display = 'block';
    document.getElementById('study-complete').style.display = 'none';

    switchView('study');
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === 'study');
    });

    updateStudyCard();
    updateStudyStats();
}

function updateStudyCard() {
    const card = studySession.cards[studySession.currentIndex];
    if (!card) return;

    document.getElementById('card-front-text').textContent = card.front;
    document.getElementById('card-back-text').textContent = card.back;

    document.getElementById('flashcard').classList.remove('flipped');
    studySession.isFlipped = false;

    const total = studySession.cards.length;
    const current = studySession.currentIndex + 1;
    const progress = (studySession.currentIndex / total) * 100;

    document.getElementById('study-progress-fill').style.width = `${progress}%`;
    document.getElementById('study-progress-text').textContent = `${current} / ${total}`;
}

function updateStudyStats() {
    document.getElementById('correct-count').textContent = studySession.correct.length;
    document.getElementById('wrong-count').textContent = studySession.wrong.length;
    document.getElementById('remaining-count').textContent =
        studySession.cards.length - studySession.currentIndex;
}

function flipCard() {
    document.getElementById('flashcard').classList.toggle('flipped');
    studySession.isFlipped = !studySession.isFlipped;
}

function markCard(result) {
    const card = studySession.cards[studySession.currentIndex];

    if (result === 'correct') {
        studySession.correct.push(card);
    } else {
        studySession.wrong.push(card);
    }

    studySession.currentIndex++;

    if (studySession.currentIndex >= studySession.cards.length) {
        showStudyComplete();
    } else {
        updateStudyCard();
        updateStudyStats();
    }
}

function showStudyComplete() {
    document.getElementById('study-session').style.display = 'none';
    document.getElementById('study-complete').style.display = 'block';

    const total = studySession.correct.length + studySession.wrong.length;
    const accuracy = total > 0 ? Math.round((studySession.correct.length / total) * 100) : 0;

    document.getElementById('final-correct').textContent = studySession.correct.length;
    document.getElementById('final-wrong').textContent = studySession.wrong.length;
    document.getElementById('final-accuracy').textContent = `${accuracy}%`;
}

function restartStudy() {
    if (studySession.deck) startStudy(studySession.deck.id);
}

function studyMissed() {
    if (studySession.wrong.length === 0) {
        showToast('No missed cards!');
        return;
    }

    studySession.cards = [...studySession.wrong].sort(() => Math.random() - 0.5);
    studySession.currentIndex = 0;
    studySession.correct = [];
    studySession.wrong = [];

    document.getElementById('study-session').style.display = 'block';
    document.getElementById('study-complete').style.display = 'none';

    updateStudyCard();
    updateStudyStats();
}

function endStudySession() {
    renderStudySelect();
}

// Utilities
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'success') {
    document.querySelectorAll('.toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (document.getElementById('study-session').style.display !== 'none') {
        if (e.code === 'Space') {
            e.preventDefault();
            flipCard();
        } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
            markCard('wrong');
        } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
            markCard('correct');
        }
    }
});

// ==================== AI VIDEO LEARNING ====================
let videoState = {
    topic: '',
    level: 'intermediate',
    duration: 'medium',
    style: 'animated',
    isPlaying: false,
    isMuted: false,
    currentSlide: 0,
    slides: [],
    chapters: [],
    takeaways: [],
    totalDuration: 0,
    currentTime: 0,
    intervalId: null,
    animationId: null,
    canvas: null,
    ctx: null,
    particles: [],
    objects: [],
    animations: []
};

// Canvas Animation System
class VideoAnimationEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.objects = [];
        this.texts = [];
        this.isRunning = false;
        this.currentAnimation = null;
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.offsetWidth;
        this.canvas.height = container.offsetHeight - 56;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Create gradient background
    drawBackground(colors, angle = 45) {
        const gradient = this.ctx.createLinearGradient(
            0, 0,
            this.canvas.width * Math.cos(angle * Math.PI / 180),
            this.canvas.height * Math.sin(angle * Math.PI / 180)
        );
        colors.forEach((color, i) => {
            gradient.addColorStop(i / (colors.length - 1), color);
        });
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Animated particles
    createParticles(count, options = {}) {
        this.particles = [];
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: options.size || Math.random() * 4 + 2,
                speedX: (Math.random() - 0.5) * (options.speed || 2),
                speedY: (Math.random() - 0.5) * (options.speed || 2),
                color: options.color || `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.2})`,
                pulse: Math.random() * Math.PI * 2
            });
        }
    }

    updateParticles() {
        this.particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            p.pulse += 0.05;

            // Wrap around
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;

            // Draw
            const size = p.size * (1 + Math.sin(p.pulse) * 0.3);
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.fill();
        });
    }

    // Draw connecting lines between particles
    drawConnections(maxDist = 100) {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < maxDist) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 * (1 - dist / maxDist)})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            }
        }
    }

    // Animated floating object
    createFloatingObject(emoji, x, y, options = {}) {
        return {
            emoji,
            x,
            y,
            baseY: y,
            size: options.size || 60,
            floatSpeed: options.floatSpeed || 0.02,
            floatAmount: options.floatAmount || 20,
            rotation: 0,
            rotationSpeed: options.rotationSpeed || 0,
            scale: 1,
            scaleDir: 1,
            phase: Math.random() * Math.PI * 2,
            glow: options.glow || false,
            glowColor: options.glowColor || 'rgba(99, 102, 241, 0.5)'
        };
    }

    updateFloatingObjects() {
        this.objects.forEach(obj => {
            obj.phase += obj.floatSpeed;
            obj.y = obj.baseY + Math.sin(obj.phase) * obj.floatAmount;
            obj.rotation += obj.rotationSpeed;

            // Pulse scale
            obj.scale += 0.005 * obj.scaleDir;
            if (obj.scale > 1.1 || obj.scale < 0.9) obj.scaleDir *= -1;

            // Draw glow
            if (obj.glow) {
                const gradient = this.ctx.createRadialGradient(obj.x, obj.y, 0, obj.x, obj.y, obj.size * 1.5);
                gradient.addColorStop(0, obj.glowColor);
                gradient.addColorStop(1, 'transparent');
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(obj.x - obj.size * 1.5, obj.y - obj.size * 1.5, obj.size * 3, obj.size * 3);
            }

            // Draw emoji
            this.ctx.save();
            this.ctx.translate(obj.x, obj.y);
            this.ctx.rotate(obj.rotation);
            this.ctx.scale(obj.scale, obj.scale);
            this.ctx.font = `${obj.size}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(obj.emoji, 0, 0);
            this.ctx.restore();
        });
    }

    // Animated text with effects
    drawAnimatedText(text, x, y, options = {}) {
        const fontSize = options.fontSize || 48;
        const color = options.color || '#ffffff';
        const progress = options.progress || 1;
        const effect = options.effect || 'none';

        this.ctx.font = `${options.bold ? 'bold ' : ''}${fontSize}px ${options.font || 'Arial'}`;
        this.ctx.textAlign = options.align || 'center';
        this.ctx.textBaseline = 'middle';

        if (effect === 'glow') {
            this.ctx.shadowColor = options.glowColor || color;
            this.ctx.shadowBlur = 20;
        }

        if (effect === 'typewriter') {
            const chars = Math.floor(text.length * progress);
            text = text.substring(0, chars);
        }

        if (effect === 'fadeIn') {
            this.ctx.globalAlpha = progress;
        }

        this.ctx.fillStyle = color;
        this.ctx.fillText(text, x, y);

        this.ctx.shadowBlur = 0;
        this.ctx.globalAlpha = 1;
    }

    // Draw animated diagram/chart
    drawCircularProgress(x, y, radius, progress, options = {}) {
        const lineWidth = options.lineWidth || 10;
        const bgColor = options.bgColor || 'rgba(255,255,255,0.2)';
        const fgColor = options.fgColor || '#6366f1';

        // Background circle
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = bgColor;
        this.ctx.lineWidth = lineWidth;
        this.ctx.stroke();

        // Progress arc
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * progress));
        this.ctx.strokeStyle = fgColor;
        this.ctx.lineWidth = lineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();

        // Center text
        if (options.text) {
            this.ctx.font = `bold ${radius * 0.5}px Arial`;
            this.ctx.fillStyle = '#fff';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(options.text, x, y);
        }
    }

    // Animated bar chart
    drawBarChart(x, y, width, height, data, progress) {
        const barWidth = width / data.length - 10;
        const maxValue = Math.max(...data.map(d => d.value));

        data.forEach((item, i) => {
            const barHeight = (item.value / maxValue) * height * progress;
            const barX = x + i * (barWidth + 10);
            const barY = y + height - barHeight;

            // Bar gradient
            const gradient = this.ctx.createLinearGradient(barX, barY + barHeight, barX, barY);
            gradient.addColorStop(0, item.color || '#6366f1');
            gradient.addColorStop(1, item.colorEnd || '#a855f7');

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.roundRect(barX, barY, barWidth, barHeight, 5);
            this.ctx.fill();

            // Label
            this.ctx.font = '14px Arial';
            this.ctx.fillStyle = '#fff';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(item.label, barX + barWidth / 2, y + height + 20);
        });
    }

    // Draw animated arrow/path
    drawAnimatedPath(points, progress, options = {}) {
        if (points.length < 2) return;

        const totalLength = points.reduce((sum, p, i) => {
            if (i === 0) return 0;
            const dx = p.x - points[i-1].x;
            const dy = p.y - points[i-1].y;
            return sum + Math.sqrt(dx*dx + dy*dy);
        }, 0);

        const drawLength = totalLength * progress;
        let currentLength = 0;

        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
            const dx = points[i].x - points[i-1].x;
            const dy = points[i].y - points[i-1].y;
            const segmentLength = Math.sqrt(dx*dx + dy*dy);

            if (currentLength + segmentLength <= drawLength) {
                this.ctx.lineTo(points[i].x, points[i].y);
                currentLength += segmentLength;
            } else {
                const remaining = drawLength - currentLength;
                const ratio = remaining / segmentLength;
                const endX = points[i-1].x + dx * ratio;
                const endY = points[i-1].y + dy * ratio;
                this.ctx.lineTo(endX, endY);
                break;
            }
        }

        this.ctx.strokeStyle = options.color || '#fff';
        this.ctx.lineWidth = options.lineWidth || 3;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();

        // Draw arrow head at end
        if (options.arrow && progress > 0.1) {
            const lastPoint = progress >= 1 ? points[points.length - 1] : null;
            if (lastPoint) {
                const prevPoint = points[points.length - 2];
                const angle = Math.atan2(lastPoint.y - prevPoint.y, lastPoint.x - prevPoint.x);

                this.ctx.save();
                this.ctx.translate(lastPoint.x, lastPoint.y);
                this.ctx.rotate(angle);
                this.ctx.beginPath();
                this.ctx.moveTo(0, 0);
                this.ctx.lineTo(-15, -8);
                this.ctx.lineTo(-15, 8);
                this.ctx.closePath();
                this.ctx.fillStyle = options.color || '#fff';
                this.ctx.fill();
                this.ctx.restore();
            }
        }
    }

    // Orbit animation (for solar system, atoms, etc)
    drawOrbit(centerX, centerY, radius, items, progress) {
        // Draw orbit path
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Draw orbiting items
        items.forEach((item, i) => {
            const angle = (progress * Math.PI * 2) + (i * Math.PI * 2 / items.length);
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            this.ctx.font = `${item.size || 30}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(item.emoji, x, y);
        });
    }
}

// Animation presets for different topics
const ANIMATION_PRESETS = {
    gravity: (engine, progress, slideIndex) => {
        engine.drawBackground(['#0f0c29', '#302b63', '#24243e']);
        engine.createParticles(30, { speed: 0.5, color: 'rgba(255,255,255,0.3)' });
        engine.updateParticles();

        if (slideIndex === 1) {
            // Falling apple animation
            const appleY = 100 + (progress * 300);
            engine.ctx.font = '80px Arial';
            engine.ctx.textAlign = 'center';
            engine.ctx.fillText('🍎', engine.canvas.width / 2, Math.min(appleY, 400));

            // Ground
            engine.ctx.fillStyle = '#3d5a3d';
            engine.ctx.fillRect(0, engine.canvas.height - 50, engine.canvas.width, 50);
        } else if (slideIndex === 2) {
            // Earth and moon orbit
            engine.drawOrbit(
                engine.canvas.width / 2,
                engine.canvas.height / 2,
                150,
                [{ emoji: '🌙', size: 40 }],
                progress
            );
            engine.ctx.font = '100px Arial';
            engine.ctx.textAlign = 'center';
            engine.ctx.fillText('🌍', engine.canvas.width / 2, engine.canvas.height / 2);
        }
    },

    photosynthesis: (engine, progress, slideIndex) => {
        engine.drawBackground(['#1a472a', '#2d5a3d', '#3d7a5a']);

        // Sun rays
        const sunX = engine.canvas.width - 100;
        const sunY = 80;
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2 + progress;
            const length = 50 + Math.sin(progress * 5 + i) * 20;
            engine.ctx.beginPath();
            engine.ctx.moveTo(sunX, sunY);
            engine.ctx.lineTo(
                sunX + Math.cos(angle) * length,
                sunY + Math.sin(angle) * length
            );
            engine.ctx.strokeStyle = 'rgba(255, 200, 50, 0.6)';
            engine.ctx.lineWidth = 3;
            engine.ctx.stroke();
        }
        engine.ctx.font = '60px Arial';
        engine.ctx.fillText('☀️', sunX, sunY);

        // Plant
        engine.ctx.font = '120px Arial';
        engine.ctx.textAlign = 'center';
        engine.ctx.fillText('🌱', engine.canvas.width / 2, engine.canvas.height - 100);

        // Animated arrows showing water up, CO2 in, O2 out
        if (progress > 0.3) {
            // Water arrow (up)
            engine.drawAnimatedPath([
                { x: engine.canvas.width / 2 - 50, y: engine.canvas.height - 30 },
                { x: engine.canvas.width / 2 - 50, y: engine.canvas.height - 150 }
            ], Math.min((progress - 0.3) * 2, 1), { color: '#4fc3f7', arrow: true, lineWidth: 4 });

            engine.ctx.font = '16px Arial';
            engine.ctx.fillStyle = '#4fc3f7';
            engine.ctx.fillText('H₂O', engine.canvas.width / 2 - 50, engine.canvas.height - 10);
        }
    },

    'machine learning': (engine, progress, slideIndex) => {
        engine.drawBackground(['#1a1a2e', '#16213e', '#0f3460']);
        engine.createParticles(50, { speed: 1, color: 'rgba(99, 102, 241, 0.4)' });
        engine.updateParticles();
        engine.drawConnections(120);

        // Neural network visualization
        const layers = [3, 5, 5, 2];
        const layerSpacing = engine.canvas.width / (layers.length + 1);
        const nodes = [];

        layers.forEach((nodeCount, layerIndex) => {
            const x = layerSpacing * (layerIndex + 1);
            const nodeSpacing = engine.canvas.height / (nodeCount + 1);

            for (let i = 0; i < nodeCount; i++) {
                const y = nodeSpacing * (i + 1);
                nodes.push({ x, y, layer: layerIndex });

                // Draw node
                const gradient = engine.ctx.createRadialGradient(x, y, 0, x, y, 20);
                gradient.addColorStop(0, '#6366f1');
                gradient.addColorStop(1, '#4f46e5');

                engine.ctx.beginPath();
                engine.ctx.arc(x, y, 15 * progress, 0, Math.PI * 2);
                engine.ctx.fillStyle = gradient;
                engine.ctx.fill();
            }
        });

        // Draw connections
        if (progress > 0.5) {
            const connectionProgress = (progress - 0.5) * 2;
            nodes.forEach(node => {
                nodes.filter(n => n.layer === node.layer + 1).forEach(nextNode => {
                    engine.ctx.beginPath();
                    engine.ctx.moveTo(node.x, node.y);
                    engine.ctx.lineTo(
                        node.x + (nextNode.x - node.x) * connectionProgress,
                        node.y + (nextNode.y - node.y) * connectionProgress
                    );
                    engine.ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
                    engine.ctx.lineWidth = 1;
                    engine.ctx.stroke();
                });
            });
        }
    },

    'water cycle': (engine, progress, slideIndex) => {
        // Sky gradient
        engine.drawBackground(['#87ceeb', '#4a90c2', '#2c5f8a']);

        // Sun
        engine.ctx.font = '60px Arial';
        engine.ctx.fillText('☀️', engine.canvas.width - 80, 60);

        // Cloud
        engine.ctx.font = '80px Arial';
        engine.ctx.fillText('☁️', engine.canvas.width / 2, 100);

        // Ocean
        engine.ctx.fillStyle = '#1e90ff';
        engine.ctx.fillRect(0, engine.canvas.height - 80, engine.canvas.width, 80);
        engine.ctx.font = '40px Arial';
        engine.ctx.fillText('🌊', 100, engine.canvas.height - 40);
        engine.ctx.fillText('🌊', 300, engine.canvas.height - 40);
        engine.ctx.fillText('🌊', 500, engine.canvas.height - 40);

        // Evaporation arrows
        for (let i = 0; i < 3; i++) {
            const baseX = 150 + i * 200;
            const waveOffset = Math.sin(progress * 5 + i) * 10;

            engine.ctx.beginPath();
            engine.ctx.setLineDash([5, 5]);
            engine.ctx.moveTo(baseX, engine.canvas.height - 90);
            engine.ctx.lineTo(baseX + waveOffset, 150);
            engine.ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            engine.ctx.lineWidth = 2;
            engine.ctx.stroke();
            engine.ctx.setLineDash([]);
        }

        // Rain drops
        if (progress > 0.5) {
            for (let i = 0; i < 5; i++) {
                const dropY = 150 + ((progress - 0.5) * 2 * (engine.canvas.height - 230)) + (i * 30);
                if (dropY < engine.canvas.height - 80) {
                    engine.ctx.font = '20px Arial';
                    engine.ctx.fillText('💧', engine.canvas.width / 2 - 60 + i * 30, dropY);
                }
            }
        }
    },

    default: (engine, progress, slideIndex) => {
        engine.drawBackground(['#667eea', '#764ba2']);
        engine.createParticles(40, { speed: 1 });
        engine.updateParticles();
        engine.drawConnections(80);
    }
};

let animationEngine = null;

// Video content database
const VIDEO_CONTENT_DB = {
    'gravity': {
        title: 'How Does Gravity Work?',
        slides: [
            { type: 'intro', icon: '🌍', title: 'Understanding Gravity', text: 'The invisible force that shapes our universe', duration: 8 },
            { type: 'content', visual: '🍎', title: 'What is Gravity?', text: 'Gravity is a force that pulls objects toward each other. Every object with mass has gravity - including you!', duration: 12 },
            { type: 'content', visual: '🌙', title: 'Newton\'s Discovery', text: 'Isaac Newton discovered that the same force that makes an apple fall also keeps the Moon orbiting Earth.', duration: 12 },
            { type: 'content', visual: '⚖️', title: 'Mass Matters', text: 'The more mass an object has, the stronger its gravitational pull. Earth\'s gravity is stronger than the Moon\'s because Earth has more mass.', duration: 15 },
            { type: 'content', visual: '📏', title: 'Distance Matters Too', text: 'Gravity gets weaker the farther away you are from an object. That\'s why astronauts float in space!', duration: 12 },
            { type: 'content', visual: '🕳️', title: 'Einstein\'s View', text: 'Einstein showed that gravity is actually the bending of space and time around massive objects. Imagine a bowling ball on a trampoline!', duration: 15 },
            { type: 'summary', icon: '✨', title: 'Key Takeaways', text: '1. Gravity pulls objects together\n2. More mass = stronger gravity\n3. Farther distance = weaker gravity', duration: 10 }
        ],
        chapters: [
            { time: '0:00', title: 'Introduction' },
            { time: '0:08', title: 'What is Gravity?' },
            { time: '0:20', title: 'Newton\'s Discovery' },
            { time: '0:32', title: 'Mass and Gravity' },
            { time: '0:47', title: 'Distance Effect' },
            { time: '0:59', title: 'Einstein\'s Theory' },
            { time: '1:14', title: 'Summary' }
        ],
        takeaways: [
            { icon: '🍎', text: 'Gravity is a force that pulls objects with mass toward each other' },
            { icon: '🌍', text: 'Larger objects have stronger gravitational pull' },
            { icon: '🚀', text: 'Gravity gets weaker with distance' },
            { icon: '🧠', text: 'Einstein showed gravity bends space and time' }
        ]
    },
    'photosynthesis': {
        title: 'How Photosynthesis Works',
        slides: [
            { type: 'intro', icon: '🌱', title: 'Photosynthesis', text: 'How plants make their own food from sunlight', duration: 8 },
            { type: 'content', visual: '☀️', title: 'Capturing Sunlight', text: 'Plants have special cells called chloroplasts that contain chlorophyll - a green pigment that absorbs sunlight.', duration: 12 },
            { type: 'content', visual: '💧', title: 'Ingredients Needed', text: 'Plants need three things: sunlight, water (from roots), and carbon dioxide (from air through tiny holes called stomata).', duration: 15 },
            { type: 'content', visual: '⚡', title: 'The Light Reaction', text: 'Sunlight energy splits water molecules, releasing oxygen and creating energy molecules (ATP).', duration: 12 },
            { type: 'content', visual: '🔄', title: 'The Calvin Cycle', text: 'The energy from light reactions is used to turn CO2 into glucose - the plant\'s food!', duration: 12 },
            { type: 'content', visual: '🌿', title: 'Why It Matters', text: 'Photosynthesis produces the oxygen we breathe and is the foundation of almost all food chains on Earth.', duration: 12 },
            { type: 'summary', icon: '✅', title: 'Remember This!', text: '6CO₂ + 6H₂O + Light → C₆H₁₂O₆ + 6O₂\nCarbon dioxide + Water + Light = Glucose + Oxygen', duration: 10 }
        ],
        chapters: [
            { time: '0:00', title: 'Introduction' },
            { time: '0:08', title: 'Chlorophyll & Light' },
            { time: '0:20', title: 'Ingredients' },
            { time: '0:35', title: 'Light Reaction' },
            { time: '0:47', title: 'Calvin Cycle' },
            { time: '0:59', title: 'Importance' },
            { time: '1:11', title: 'Summary' }
        ],
        takeaways: [
            { icon: '☀️', text: 'Chlorophyll in leaves captures sunlight energy' },
            { icon: '💧', text: 'Water + CO2 + Light = Glucose + Oxygen' },
            { icon: '🌍', text: 'Photosynthesis produces the oxygen we breathe' },
            { icon: '🍃', text: 'Plants are the base of most food chains' }
        ]
    },
    'machine learning': {
        title: 'Introduction to Machine Learning',
        slides: [
            { type: 'intro', icon: '🤖', title: 'Machine Learning', text: 'Teaching computers to learn from experience', duration: 8 },
            { type: 'content', visual: '🧠', title: 'What is ML?', text: 'Machine Learning is a type of AI where computers learn patterns from data instead of following explicit instructions.', duration: 12 },
            { type: 'content', visual: '📊', title: 'Learning from Data', text: 'Just like you learn from examples, ML algorithms learn by analyzing thousands or millions of examples.', duration: 12 },
            { type: 'content', visual: '🏷️', title: 'Supervised Learning', text: 'The computer learns from labeled examples. Like showing it 1000 cat photos labeled "cat" so it can recognize new cats.', duration: 15 },
            { type: 'content', visual: '🔍', title: 'Unsupervised Learning', text: 'The computer finds patterns on its own without labels. It groups similar things together automatically.', duration: 12 },
            { type: 'content', visual: '🎮', title: 'Reinforcement Learning', text: 'The computer learns by trial and error, getting rewards for good actions. This is how game-playing AI works!', duration: 12 },
            { type: 'content', visual: '📱', title: 'ML Everywhere', text: 'ML powers recommendations on Netflix, voice assistants, spam filters, self-driving cars, and much more!', duration: 12 },
            { type: 'summary', icon: '💡', title: 'Key Points', text: '1. ML = Learning from data\n2. Three types: Supervised, Unsupervised, Reinforcement\n3. ML is all around us!', duration: 10 }
        ],
        chapters: [
            { time: '0:00', title: 'Introduction' },
            { time: '0:08', title: 'What is ML?' },
            { time: '0:20', title: 'Learning from Data' },
            { time: '0:32', title: 'Supervised Learning' },
            { time: '0:47', title: 'Unsupervised Learning' },
            { time: '0:59', title: 'Reinforcement Learning' },
            { time: '1:11', title: 'ML Applications' },
            { time: '1:23', title: 'Summary' }
        ],
        takeaways: [
            { icon: '🧠', text: 'ML lets computers learn patterns from data' },
            { icon: '🏷️', text: 'Supervised learning uses labeled examples' },
            { icon: '🔍', text: 'Unsupervised learning finds hidden patterns' },
            { icon: '🎮', text: 'Reinforcement learning uses rewards' }
        ]
    },
    'water cycle': {
        title: 'The Water Cycle Explained',
        slides: [
            { type: 'intro', icon: '💧', title: 'The Water Cycle', text: 'Nature\'s way of recycling water', duration: 8 },
            { type: 'content', visual: '☀️', title: 'Evaporation', text: 'The sun heats water in oceans, lakes, and rivers, turning it into water vapor that rises into the air.', duration: 12 },
            { type: 'content', visual: '☁️', title: 'Condensation', text: 'As water vapor rises and cools, it condenses into tiny water droplets that form clouds.', duration: 12 },
            { type: 'content', visual: '🌧️', title: 'Precipitation', text: 'When clouds get heavy with water, it falls back to Earth as rain, snow, sleet, or hail.', duration: 12 },
            { type: 'content', visual: '🏔️', title: 'Collection', text: 'Water collects in oceans, rivers, lakes, and underground. Then the cycle starts again!', duration: 12 },
            { type: 'content', visual: '🌲', title: 'Transpiration', text: 'Plants also release water vapor through their leaves, adding to the cycle.', duration: 10 },
            { type: 'summary', icon: '🔄', title: 'The Endless Cycle', text: 'Evaporation → Condensation → Precipitation → Collection → Repeat!', duration: 10 }
        ],
        chapters: [
            { time: '0:00', title: 'Introduction' },
            { time: '0:08', title: 'Evaporation' },
            { time: '0:20', title: 'Condensation' },
            { time: '0:32', title: 'Precipitation' },
            { time: '0:44', title: 'Collection' },
            { time: '0:56', title: 'Transpiration' },
            { time: '1:06', title: 'Summary' }
        ],
        takeaways: [
            { icon: '☀️', text: 'Sun heats water causing evaporation' },
            { icon: '☁️', text: 'Water vapor condenses to form clouds' },
            { icon: '🌧️', text: 'Precipitation returns water to Earth' },
            { icon: '🔄', text: 'The cycle repeats endlessly' }
        ]
    },
    'human heart': {
        title: 'How the Human Heart Works',
        slides: [
            { type: 'intro', icon: '❤️', title: 'The Human Heart', text: 'Your body\'s incredible pump', duration: 8 },
            { type: 'content', visual: '💪', title: 'A Powerful Muscle', text: 'Your heart is a muscle about the size of your fist that beats 100,000 times per day!', duration: 12 },
            { type: 'content', visual: '4️⃣', title: 'Four Chambers', text: 'The heart has 4 chambers: 2 atria (top) receive blood, 2 ventricles (bottom) pump blood out.', duration: 15 },
            { type: 'content', visual: '🔵', title: 'Right Side', text: 'The right side receives used blood from your body and pumps it to your lungs for fresh oxygen.', duration: 12 },
            { type: 'content', visual: '🔴', title: 'Left Side', text: 'The left side receives oxygen-rich blood from lungs and pumps it to your entire body.', duration: 12 },
            { type: 'content', visual: '🚪', title: 'Heart Valves', text: 'Four valves act like one-way doors, making sure blood flows in the right direction.', duration: 12 },
            { type: 'content', visual: '⚡', title: 'Electrical System', text: 'Your heart has its own electrical system that controls when each part contracts.', duration: 12 },
            { type: 'summary', icon: '💓', title: 'Amazing Facts', text: 'Your heart pumps about 2,000 gallons of blood every day through 60,000 miles of blood vessels!', duration: 10 }
        ],
        chapters: [
            { time: '0:00', title: 'Introduction' },
            { time: '0:08', title: 'Heart as a Muscle' },
            { time: '0:20', title: 'Four Chambers' },
            { time: '0:35', title: 'Right Side Function' },
            { time: '0:47', title: 'Left Side Function' },
            { time: '0:59', title: 'Heart Valves' },
            { time: '1:11', title: 'Electrical System' },
            { time: '1:23', title: 'Summary' }
        ],
        takeaways: [
            { icon: '💪', text: 'The heart beats about 100,000 times per day' },
            { icon: '4️⃣', text: 'Four chambers work together as a pump' },
            { icon: '🫁', text: 'Right side sends blood to lungs for oxygen' },
            { icon: '🔴', text: 'Left side pumps oxygen-rich blood to body' }
        ]
    },
    'world war 2': {
        title: 'World War 2 Summary',
        slides: [
            { type: 'intro', icon: '🌍', title: 'World War II', text: 'The largest conflict in human history (1939-1945)', duration: 8 },
            { type: 'content', visual: '📜', title: 'How It Started', text: 'Germany, led by Adolf Hitler, invaded Poland on September 1, 1939, triggering declarations of war from Britain and France.', duration: 15 },
            { type: 'content', visual: '⚔️', title: 'Two Sides', text: 'Allied Powers (US, UK, USSR, France) vs Axis Powers (Germany, Italy, Japan)', duration: 12 },
            { type: 'content', visual: '🇺🇸', title: 'US Enters War', text: 'Japan attacked Pearl Harbor on December 7, 1941, bringing the United States into the war.', duration: 12 },
            { type: 'content', visual: '🏖️', title: 'D-Day', text: 'On June 6, 1944, Allied forces invaded Normandy, France - the largest seaborne invasion in history.', duration: 12 },
            { type: 'content', visual: '🏳️', title: 'War Ends', text: 'Germany surrendered May 8, 1945 (V-E Day). Japan surrendered August 15, 1945 after atomic bombs were dropped.', duration: 15 },
            { type: 'content', visual: '💔', title: 'The Cost', text: 'Over 70 million people died, including 6 million Jews in the Holocaust. The deadliest war in history.', duration: 12 },
            { type: 'summary', icon: '🕊️', title: 'Legacy', text: 'WW2 led to the United Nations, reshaped global politics, and showed the importance of preventing such conflicts.', duration: 10 }
        ],
        chapters: [
            { time: '0:00', title: 'Introduction' },
            { time: '0:08', title: 'Start of the War' },
            { time: '0:23', title: 'Allied vs Axis' },
            { time: '0:35', title: 'Pearl Harbor' },
            { time: '0:47', title: 'D-Day Invasion' },
            { time: '0:59', title: 'War Ends' },
            { time: '1:14', title: 'Human Cost' },
            { time: '1:26', title: 'Legacy' }
        ],
        takeaways: [
            { icon: '📅', text: 'WW2 lasted from 1939 to 1945' },
            { icon: '⚔️', text: 'Allies (US, UK, USSR) vs Axis (Germany, Italy, Japan)' },
            { icon: '💔', text: 'Over 70 million people died' },
            { icon: '🕊️', text: 'Led to the creation of the United Nations' }
        ]
    },
    'economics': {
        title: 'Supply and Demand Basics',
        slides: [
            { type: 'intro', icon: '📈', title: 'Supply & Demand', text: 'The fundamental forces of economics', duration: 8 },
            { type: 'content', visual: '🛒', title: 'What is Demand?', text: 'Demand is how much of something people want to buy at different prices. Lower prices usually mean higher demand.', duration: 12 },
            { type: 'content', visual: '🏭', title: 'What is Supply?', text: 'Supply is how much of something sellers are willing to sell at different prices. Higher prices mean sellers want to sell more.', duration: 12 },
            { type: 'content', visual: '⚖️', title: 'Finding Balance', text: 'The market price is where supply equals demand - called equilibrium. This is where buyers and sellers agree.', duration: 15 },
            { type: 'content', visual: '📈', title: 'Price Goes Up', text: 'When demand is high but supply is low, prices rise. Think of concert tickets or limited edition items!', duration: 12 },
            { type: 'content', visual: '📉', title: 'Price Goes Down', text: 'When supply is high but demand is low, prices fall. Like sales after holidays!', duration: 12 },
            { type: 'summary', icon: '💡', title: 'Key Takeaway', text: 'Prices are signals that help balance what people want with what\'s available.', duration: 10 }
        ],
        chapters: [
            { time: '0:00', title: 'Introduction' },
            { time: '0:08', title: 'Understanding Demand' },
            { time: '0:20', title: 'Understanding Supply' },
            { time: '0:32', title: 'Market Equilibrium' },
            { time: '0:47', title: 'When Prices Rise' },
            { time: '0:59', title: 'When Prices Fall' },
            { time: '1:11', title: 'Summary' }
        ],
        takeaways: [
            { icon: '🛒', text: 'Demand = how much people want to buy' },
            { icon: '🏭', text: 'Supply = how much sellers offer' },
            { icon: '⚖️', text: 'Equilibrium = where supply meets demand' },
            { icon: '💰', text: 'Prices adjust to balance supply and demand' }
        ]
    }
};

function setVideoTopic(topic) {
    document.getElementById('video-topic').value = topic;
}

// YouTube Video Database - Curated educational videos with verified embeddable IDs
const YOUTUBE_VIDEOS_DB = {
    'gravity': [
        { id: 'Jk5E-CrE1zg', title: 'Gravity Explained Simply', channel: 'Kurzgesagt', duration: '7:34', views: '15M' },
        { id: 'MTY1Kje0yLg', title: 'What is Gravity?', channel: 'SciShow', duration: '4:23', views: '2.1M' },
        { id: 'AwhKZ3fd9JA', title: 'Gravity for Kids', channel: 'SciShow Kids', duration: '4:12', views: '1.5M' }
    ],
    'water cycle': [
        { id: 'al-do-HGuIk', title: 'The Water Cycle', channel: 'Happy Learning', duration: '4:07', views: '8.5M' },
        { id: 'ncORPosDrjI', title: 'Water Cycle Song', channel: 'Have Fun Teaching', duration: '2:57', views: '12M' },
        { id: '9_TTLb0M3IY', title: 'How the Water Cycle Works', channel: 'National Geographic', duration: '3:12', views: '3.1M' }
    ],
    'machine learning': [
        { id: 'aircAruvnKk', title: 'Machine Learning Explained', channel: 'CGP Grey', duration: '6:01', views: '12M' },
        { id: 'R9OHn5ZF4Uo', title: 'ML for Beginners', channel: 'Google', duration: '7:34', views: '4.2M' },
        { id: 'ukzFI9rgwfU', title: 'What is Machine Learning?', channel: 'IBM Technology', duration: '5:12', views: '1.8M' }
    ],
    'human heart': [
        { id: 'wWOLLd3GCIg', title: 'How Your Heart Works', channel: 'TED-Ed', duration: '4:29', views: '5.4M' },
        { id: 'X9ZZ6tcxArI', title: 'The Heart Explained', channel: 'Nucleus Medical Media', duration: '5:43', views: '28M' },
        { id: 'lFlFEgoOtrg', title: 'Circulatory System', channel: 'Crash Course', duration: '10:02', views: '8.2M' }
    ],
    'world war 2': [
        { id: '_uk_6vfqwTA', title: 'WW2 - Oversimplified Part 1', channel: 'Oversimplified', duration: '13:43', views: '62M' },
        { id: 'fo2Rb9h788s', title: 'WW2 - Oversimplified Part 2', channel: 'Oversimplified', duration: '15:42', views: '45M' },
        { id: 'HUqy-OQvVtI', title: 'WW2 in 7 Minutes', channel: 'History Matters', duration: '7:23', views: '8.1M' }
    ],
    'python': [
        { id: 'x7X9w_GIm1s', title: 'Python in 100 Seconds', channel: 'Fireship', duration: '2:31', views: '8.5M' },
        { id: 'kqtD5dpn9C8', title: 'Python for Beginners', channel: 'Programming with Mosh', duration: '6:14', views: '28M' },
        { id: 'rfscVS0vtbw', title: 'Python Full Course', channel: 'freeCodeCamp', duration: '4:26:52', views: '42M' }
    ],
    'photosynthesis': [
        { id: 'UPBMG5EYydo', title: 'Photosynthesis', channel: 'Crash Course', duration: '13:14', views: '7.2M' },
        { id: 'sQK3Yr4Sc_k', title: 'The Simple Story of Photosynthesis', channel: 'TED-Ed', duration: '5:28', views: '4.8M' },
        { id: 'g78utcLQrJ4', title: 'Photosynthesis for Kids', channel: 'Homeschool Pop', duration: '5:13', views: '2.1M' }
    ],
    'economics': [
        { id: 'PHe0bXAIuk0', title: 'How The Economic Machine Works', channel: 'Ray Dalio', duration: '31:00', views: '35M' },
        { id: 'd8uTB5XorBw', title: 'Economics Explained', channel: 'Economics Explained', duration: '12:22', views: '5.4M' },
        { id: '3ez10ADR_gM', title: 'Supply and Demand', channel: 'Khan Academy', duration: '10:56', views: '2.1M' }
    ],
    'france': [
        { id: 'EHPPRssMy9M', title: 'France - Geography, History & Culture', channel: 'Cogito', duration: '12:45', views: '2.1M' },
        { id: 'GMkSuMAgBpw', title: 'French Revolution Explained', channel: 'OverSimplified', duration: '18:34', views: '45M' },
        { id: 'rjhIzemLdos', title: 'France History in 12 Minutes', channel: 'History Matters', duration: '12:02', views: '3.8M' }
    ],
    'french revolution': [
        { id: 'GMkSuMAgBpw', title: 'French Revolution Explained', channel: 'OverSimplified', duration: '18:34', views: '45M' },
        { id: '8qRZcXIODNU', title: 'French Revolution Documentary', channel: 'Epic History', duration: '22:15', views: '8.2M' },
        { id: 'wXsZbkt0yqo', title: 'Causes of French Revolution', channel: 'Tom Richey', duration: '14:56', views: '1.4M' }
    ],
    'default': [
        { id: 'aircAruvnKk', title: 'Educational Video', channel: 'CGP Grey', duration: '6:01', views: '12M' }
    ]
};

let currentVideoTopic = '';
let currentVideos = [];

function searchVideos() {
    const topic = document.getElementById('video-topic').value.trim();
    if (!topic) {
        showToast('Please enter a topic to search', 'error');
        return;
    }

    currentVideoTopic = topic;

    // Show searching state
    document.getElementById('video-input-section').classList.add('hidden');
    document.getElementById('video-searching').classList.remove('hidden');
    document.getElementById('video-results-section').classList.add('hidden');

    // Simulate search delay
    setTimeout(() => {
        showVideoResults(topic);
    }, 1500);
}

function showVideoResults(topic) {
    const topicLower = topic.toLowerCase();

    // Find matching videos
    let videos = [];
    for (const key in YOUTUBE_VIDEOS_DB) {
        if (topicLower.includes(key) || key.includes(topicLower.split(' ')[0])) {
            videos = YOUTUBE_VIDEOS_DB[key];
            break;
        }
    }

    // If no match, use default educational videos
    if (videos.length === 0) {
        videos = YOUTUBE_VIDEOS_DB['default'] || [
            { id: 'aircAruvnKk', title: `Learn about ${topic}`, channel: 'CGP Grey', duration: '6:01', views: '12M' }
        ];
    }

    currentVideos = videos;

    // Hide searching, show results
    document.getElementById('video-searching').classList.add('hidden');
    document.getElementById('video-results-section').classList.remove('hidden');

    // Update search query display
    document.getElementById('search-query-display').textContent = topic;

    // Render video list
    renderVideoList(videos);

    // Play first video
    if (videos.length > 0) {
        playYouTubeVideo(videos[0], 0);
    }

    showToast(`Found ${videos.length} videos on "${topic}"`);
}

function renderVideoList(videos) {
    const list = document.getElementById('video-list');
    list.innerHTML = videos.map((video, index) => `
        <div class="video-card ${index === 0 ? 'active' : ''}" onclick="playYouTubeVideo(currentVideos[${index}], ${index})">
            <div class="video-thumbnail">
                <img src="https://img.youtube.com/vi/${video.id}/mqdefault.jpg" alt="${escapeHtml(video.title)}">
                <div class="video-duration-badge">${video.duration}</div>
                <div class="play-overlay">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                </div>
            </div>
            <div class="video-card-info">
                <div class="video-card-title">${escapeHtml(video.title)}</div>
                <div class="video-card-channel">${escapeHtml(video.channel)}</div>
                <div class="video-card-views">${video.views} views</div>
            </div>
        </div>
    `).join('');
}

let currentSelectedVideo = null;

function playYouTubeVideo(video, index) {
    currentSelectedVideo = video;

    // Update thumbnail preview
    const thumbnail = document.getElementById('video-preview-thumbnail');
    thumbnail.src = `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`;
    thumbnail.onerror = function() {
        this.src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
    };

    // Update video info display
    document.getElementById('current-video-title').textContent = video.title;
    document.getElementById('current-video-channel').textContent = video.channel + ' • ' + video.views + ' views';

    // Update active card
    document.querySelectorAll('.video-card').forEach((card, i) => {
        card.classList.toggle('active', i === index);
    });
}

function openCurrentVideo() {
    if (currentSelectedVideo) {
        window.open(`https://www.youtube.com/watch?v=${currentSelectedVideo.id}`, '_blank');
        showToast(`Opening "${currentSelectedVideo.title}" on YouTube...`);
    }
}

function newVideoSearch() {
    // Reset and show input
    document.getElementById('video-results-section').classList.add('hidden');
    document.getElementById('video-searching').classList.add('hidden');
    document.getElementById('video-input-section').classList.remove('hidden');

    // Stop video playback
    document.getElementById('youtube-player').src = '';
}

function createFlashcardsFromTopic() {
    if (!currentVideoTopic) {
        showToast('No topic selected', 'error');
        return;
    }

    // Create flashcards based on topic
    const deckName = currentVideoTopic + ' - Video Notes';
    const cards = [
        { front: `What is ${currentVideoTopic}?`, back: `${currentVideoTopic} is a topic you learned about through video content.` },
        { front: `Key concept from ${currentVideoTopic}`, back: 'Add your own notes from the video here.' },
        { front: `Why is ${currentVideoTopic} important?`, back: 'Think about the real-world applications discussed in the video.' }
    ];

    const newDeck = {
        id: generateId(),
        name: deckName,
        cards: cards,
        createdAt: new Date().toISOString(),
        source: 'video'
    };

    decks.push(newDeck);
    saveDecks();

    showToast(`Created deck "${deckName}" - add your own notes!`);
    switchView('my-decks');
}

function createQuizFromTopic() {
    if (!currentVideoTopic) {
        showToast('No topic selected', 'error');
        return;
    }

    document.getElementById('quiz-topic').value = currentVideoTopic;
    switchView('quiz');
    showToast('Topic set! Click "Generate Quiz" to test your knowledge.');
}

function simulateVideoGeneration(topic) {
    let progress = 0;
    const steps = [
        { progress: 25, status: 'Analyzing topic and creating script...', step: 1 },
        { progress: 50, status: 'Generating visual elements...', step: 2 },
        { progress: 75, status: 'Adding narration and timing...', step: 3 },
        { progress: 100, status: 'Finalizing video...', step: 4 }
    ];

    let currentStepIndex = 0;

    const interval = setInterval(() => {
        progress += 2;

        document.getElementById('video-progress-fill').style.width = progress + '%';
        document.getElementById('video-progress-text').textContent = progress + '%';

        // Update steps
        while (currentStepIndex < steps.length && progress >= steps[currentStepIndex].progress) {
            const step = steps[currentStepIndex];
            document.getElementById('generating-status').textContent = step.status;

            // Mark previous steps as completed
            for (let i = 1; i <= 4; i++) {
                const stepEl = document.getElementById(`gen-step-${i}`);
                if (i < step.step) {
                    stepEl.classList.remove('active');
                    stepEl.classList.add('completed');
                } else if (i === step.step) {
                    stepEl.classList.add('active');
                    stepEl.classList.remove('completed');
                } else {
                    stepEl.classList.remove('active', 'completed');
                }
            }

            currentStepIndex++;
        }

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => showGeneratedVideo(topic), 500);
        }
    }, 100);
}

function showGeneratedVideo(topic) {
    // Find matching content or generate generic
    const topicLower = topic.toLowerCase();
    let content = null;

    for (const key in VIDEO_CONTENT_DB) {
        if (topicLower.includes(key) || key.includes(topicLower.split(' ')[0])) {
            content = VIDEO_CONTENT_DB[key];
            break;
        }
    }

    if (!content) {
        // Generate generic content
        content = generateGenericVideoContent(topic);
    }

    videoState.slides = content.slides;
    videoState.chapters = content.chapters;
    videoState.takeaways = content.takeaways;
    videoState.currentSlide = 0;
    videoState.currentTime = 0;
    videoState.totalDuration = content.slides.reduce((sum, s) => sum + s.duration, 0);

    // Hide generating, show player
    document.getElementById('video-generating').classList.add('hidden');
    document.getElementById('video-player-section').classList.remove('hidden');

    // Initialize animation engine
    setTimeout(() => {
        initAnimationEngine();
        if (animationEngine) {
            animationEngine.resize();
            // Draw initial frame
            const topicLower = videoState.topic.toLowerCase();
            let preset = ANIMATION_PRESETS.default;
            for (const key in ANIMATION_PRESETS) {
                if (topicLower.includes(key)) {
                    preset = ANIMATION_PRESETS[key];
                    break;
                }
            }
            preset(animationEngine, 0, 0);
        }
    }, 100);

    // Update video info
    document.getElementById('video-title').textContent = content.title || `Learn: ${topic}`;
    document.getElementById('video-level-display').textContent = capitalizeFirst(videoState.level);
    document.getElementById('video-duration-display').textContent = formatVideoDuration(videoState.totalDuration);
    document.getElementById('video-style-display').textContent = capitalizeFirst(videoState.style);

    // Render chapters
    renderChapters();

    // Render takeaways
    renderTakeaways();

    // Render first slide
    renderVideoSlides();
    updateTimeDisplay();

    showToast('Video generated successfully!');
}

function generateGenericVideoContent(topic) {
    return {
        title: `Understanding ${topic}`,
        slides: [
            { type: 'intro', icon: '📚', title: topic, text: `Let's explore ${topic} together!`, duration: 8 },
            { type: 'content', visual: '🔍', title: 'Overview', text: `${topic} is a fascinating subject with many interesting aspects to discover.`, duration: 12 },
            { type: 'content', visual: '💡', title: 'Key Concepts', text: `Understanding the fundamentals of ${topic} helps build a strong foundation for deeper learning.`, duration: 12 },
            { type: 'content', visual: '🎯', title: 'Important Points', text: `There are several key factors to consider when studying ${topic}.`, duration: 12 },
            { type: 'content', visual: '🌟', title: 'Why It Matters', text: `${topic} has real-world applications and impacts our daily lives in many ways.`, duration: 12 },
            { type: 'summary', icon: '✅', title: 'Summary', text: `Now you have a basic understanding of ${topic}. Keep exploring to learn more!`, duration: 10 }
        ],
        chapters: [
            { time: '0:00', title: 'Introduction' },
            { time: '0:08', title: 'Overview' },
            { time: '0:20', title: 'Key Concepts' },
            { time: '0:32', title: 'Important Points' },
            { time: '0:44', title: 'Why It Matters' },
            { time: '0:56', title: 'Summary' }
        ],
        takeaways: [
            { icon: '📖', text: `${topic} has many interesting aspects to explore` },
            { icon: '🎯', text: 'Understanding fundamentals is key to mastery' },
            { icon: '🌍', text: 'This topic has real-world applications' },
            { icon: '📈', text: 'Continue learning to deepen your knowledge' }
        ]
    };
}

function renderVideoSlides() {
    const canvas = document.getElementById('video-canvas');
    canvas.innerHTML = '';

    // Add floating particles
    const particlesDiv = document.createElement('div');
    particlesDiv.className = 'video-particles';
    for (let i = 0; i < 10; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particlesDiv.appendChild(particle);
    }
    canvas.appendChild(particlesDiv);

    videoState.slides.forEach((slide, index) => {
        const slideEl = document.createElement('div');
        slideEl.className = `video-slide ${slide.type} ${index === videoState.currentSlide ? 'active' : ''}`;
        slideEl.dataset.index = index;

        if (slide.type === 'intro' || slide.type === 'summary') {
            slideEl.innerHTML = `
                <div class="slide-icon">${slide.icon}</div>
                <h2>${slide.title}</h2>
                <div class="slide-text"><span class="text-content">${slide.text.replace(/\n/g, '<br>')}</span></div>
                <div class="speaker-indicator">
                    <div class="speaker-waves">
                        <div class="speaker-wave"></div>
                        <div class="speaker-wave"></div>
                        <div class="speaker-wave"></div>
                        <div class="speaker-wave"></div>
                        <div class="speaker-wave"></div>
                    </div>
                    <span>AI Narrator</span>
                </div>
            `;
        } else {
            slideEl.innerHTML = `
                <div class="visual">${slide.visual}</div>
                <h2>${slide.title}</h2>
                <div class="slide-text"><span class="text-content">${slide.text}</span></div>
                <div class="speaker-indicator">
                    <div class="speaker-waves">
                        <div class="speaker-wave"></div>
                        <div class="speaker-wave"></div>
                        <div class="speaker-wave"></div>
                        <div class="speaker-wave"></div>
                        <div class="speaker-wave"></div>
                    </div>
                    <span>AI Narrator</span>
                </div>
            `;
        }

        canvas.appendChild(slideEl);
    });

    // Add slide progress dots
    const progressDiv = document.createElement('div');
    progressDiv.className = 'slide-progress';
    videoState.slides.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = `slide-dot ${i === 0 ? 'active' : ''} ${i < videoState.currentSlide ? 'completed' : ''}`;
        dot.dataset.index = i;
        dot.onclick = () => jumpToSlide(i);
        progressDiv.appendChild(dot);
    });
    canvas.appendChild(progressDiv);

    // Start typing animation for first slide
    if (videoState.isPlaying) {
        typeSlideText(0);
    }
}

function jumpToSlide(index) {
    // Calculate time at start of this slide
    let time = 0;
    for (let i = 0; i < index; i++) {
        time += videoState.slides[i].duration;
    }
    videoState.currentTime = time;
    videoState.currentSlide = index;

    updateActiveSlide();
    updateActiveChapter();
    updateTimeDisplay();
    updateTimeline();
    updateSlideDots();
}

function updateSlideDots() {
    const dots = document.querySelectorAll('.slide-dot');
    dots.forEach((dot, i) => {
        dot.classList.remove('active', 'completed');
        if (i === videoState.currentSlide) {
            dot.classList.add('active');
        } else if (i < videoState.currentSlide) {
            dot.classList.add('completed');
        }
    });
}

function typeSlideText(slideIndex) {
    const slide = document.querySelector(`.video-slide[data-index="${slideIndex}"]`);
    if (!slide) return;

    const textContent = slide.querySelector('.text-content');
    if (!textContent) return;

    const fullText = textContent.textContent;
    textContent.innerHTML = '<span class="typing-text"></span>';
    const typingSpan = textContent.querySelector('.typing-text');

    let charIndex = 0;
    const typingSpeed = 30; // ms per character

    function typeChar() {
        if (!videoState.isPlaying) return;
        if (charIndex < fullText.length) {
            typingSpan.textContent = fullText.substring(0, charIndex + 1);
            charIndex++;
            setTimeout(typeChar, typingSpeed);
        } else {
            // Remove cursor after typing complete
            typingSpan.classList.remove('typing-text');
            typingSpan.classList.add('typed-complete');
        }
    }

    setTimeout(typeChar, 500); // Delay before starting to type
}

function renderChapters() {
    const list = document.getElementById('chapters-list');
    list.innerHTML = videoState.chapters.map((ch, i) => `
        <div class="chapter-item ${i === 0 ? 'active' : ''}" onclick="jumpToChapter(${i})">
            <span class="chapter-time">${ch.time}</span>
            <span class="chapter-title">${ch.title}</span>
        </div>
    `).join('');
}

function renderTakeaways() {
    const list = document.getElementById('takeaways-list');
    list.innerHTML = videoState.takeaways.map(t => `
        <div class="takeaway-item">
            <span class="takeaway-icon">${t.icon}</span>
            <span class="takeaway-text">${t.text}</span>
        </div>
    `).join('');
}

function toggleVideoPlay() {
    if (videoState.isPlaying) {
        pauseVideo();
    } else {
        playVideo();
    }
}

function initAnimationEngine() {
    const canvas = document.getElementById('video-animation-canvas');
    if (canvas && !animationEngine) {
        animationEngine = new VideoAnimationEngine(canvas);
    }
    return animationEngine;
}

function startCanvasAnimation() {
    if (!animationEngine) {
        initAnimationEngine();
    }
    if (!animationEngine) return;

    const topicLower = videoState.topic.toLowerCase();
    let animationPreset = ANIMATION_PRESETS.default;

    // Find matching preset
    for (const key in ANIMATION_PRESETS) {
        if (topicLower.includes(key)) {
            animationPreset = ANIMATION_PRESETS[key];
            break;
        }
    }

    let animationProgress = 0;

    function animate() {
        if (!videoState.isPlaying) return;

        animationEngine.clear();

        // Calculate progress within current slide
        let timeInCurrentSlide = videoState.currentTime;
        for (let i = 0; i < videoState.currentSlide; i++) {
            timeInCurrentSlide -= videoState.slides[i].duration;
        }
        const slideProgress = Math.min(timeInCurrentSlide / videoState.slides[videoState.currentSlide].duration, 1);

        // Run animation preset
        animationPreset(animationEngine, slideProgress, videoState.currentSlide);

        videoState.animationId = requestAnimationFrame(animate);
    }

    animate();
}

function stopCanvasAnimation() {
    if (videoState.animationId) {
        cancelAnimationFrame(videoState.animationId);
        videoState.animationId = null;
    }
}

function playVideo() {
    videoState.isPlaying = true;
    updatePlayButton();

    // Start canvas animation
    startCanvasAnimation();

    // Start typing animation for current slide
    typeSlideText(videoState.currentSlide);

    videoState.intervalId = setInterval(() => {
        videoState.currentTime++;
        updateTimeDisplay();
        updateTimeline();

        // Check if need to advance slide
        let timeInSlide = videoState.currentTime;
        let slideIndex = 0;

        for (let i = 0; i < videoState.slides.length; i++) {
            if (timeInSlide < videoState.slides[i].duration) {
                slideIndex = i;
                break;
            }
            timeInSlide -= videoState.slides[i].duration;
            if (i === videoState.slides.length - 1) {
                slideIndex = i;
            }
        }

        if (slideIndex !== videoState.currentSlide) {
            videoState.currentSlide = slideIndex;
            updateActiveSlide();
            updateActiveChapter();
        }

        // Check if video ended
        if (videoState.currentTime >= videoState.totalDuration) {
            pauseVideo();
            videoState.currentTime = videoState.totalDuration;
        }
    }, 1000);
}

function pauseVideo() {
    videoState.isPlaying = false;
    updatePlayButton();

    // Stop canvas animation
    stopCanvasAnimation();

    if (videoState.intervalId) {
        clearInterval(videoState.intervalId);
        videoState.intervalId = null;
    }
}

function updatePlayButton() {
    const btn = document.getElementById('play-pause-btn');
    if (videoState.isPlaying) {
        btn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"/>
                <rect x="14" y="4" width="4" height="16"/>
            </svg>
        `;
    } else {
        btn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
        `;
    }
}

function updateActiveSlide() {
    const slides = document.querySelectorAll('.video-slide');
    slides.forEach((slide, i) => {
        const wasActive = slide.classList.contains('active');
        slide.classList.toggle('active', i === videoState.currentSlide);

        // Trigger typing animation when slide becomes active
        if (!wasActive && i === videoState.currentSlide && videoState.isPlaying) {
            typeSlideText(i);
        }
    });

    updateSlideDots();
}

function updateActiveChapter() {
    const chapters = document.querySelectorAll('.chapter-item');
    let activeChapter = 0;

    // Find which chapter we're in based on time
    for (let i = 0; i < videoState.chapters.length; i++) {
        const time = parseChapterTime(videoState.chapters[i].time);
        if (videoState.currentTime >= time) {
            activeChapter = i;
        }
    }

    chapters.forEach((ch, i) => {
        ch.classList.toggle('active', i === activeChapter);
    });
}

function parseChapterTime(timeStr) {
    const parts = timeStr.split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

function jumpToChapter(index) {
    const time = parseChapterTime(videoState.chapters[index].time);
    videoState.currentTime = time;

    // Find which slide this corresponds to
    let slideTime = 0;
    for (let i = 0; i < videoState.slides.length; i++) {
        if (slideTime + videoState.slides[i].duration > time) {
            videoState.currentSlide = i;
            break;
        }
        slideTime += videoState.slides[i].duration;
    }

    updateActiveSlide();
    updateActiveChapter();
    updateTimeDisplay();
    updateTimeline();
}

function updateTimeDisplay() {
    const current = formatVideoTime(videoState.currentTime);
    const total = formatVideoTime(videoState.totalDuration);
    document.getElementById('time-display').textContent = `${current} / ${total}`;
}

function updateTimeline() {
    const progress = (videoState.currentTime / videoState.totalDuration) * 100;
    document.getElementById('timeline-progress').style.width = progress + '%';
}

function formatVideoTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatVideoDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (secs === 0) return `${mins} min`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function toggleVideoMute() {
    videoState.isMuted = !videoState.isMuted;
    const btn = document.getElementById('mute-btn');
    if (videoState.isMuted) {
        btn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <line x1="23" y1="9" x2="17" y2="15"/>
                <line x1="17" y1="9" x2="23" y2="15"/>
            </svg>
        `;
    } else {
        btn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
            </svg>
        `;
    }
}

function toggleFullscreen() {
    const player = document.getElementById('video-player');
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        player.requestFullscreen();
    }
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function saveVideoAsFlashcards() {
    const cards = videoState.takeaways.map(t => ({
        front: t.text.split(' ').slice(0, 5).join(' ') + '...?',
        back: t.text
    }));

    // Add slide content as cards too
    videoState.slides.filter(s => s.type === 'content').forEach(slide => {
        cards.push({
            front: slide.title,
            back: slide.text
        });
    });

    const deckName = videoState.topic + ' - Video Notes';

    const newDeck = {
        id: generateId(),
        name: deckName,
        cards: cards,
        createdAt: new Date().toISOString(),
        source: 'video'
    };

    decks.push(newDeck);
    saveDecks();
    showToast(`Created deck "${deckName}" with ${cards.length} flashcards!`);
}

function generateQuizFromVideo() {
    // Set quiz topic and switch to quiz view
    document.getElementById('quiz-topic').value = videoState.topic;
    switchView('quiz');
    showToast('Topic set! Click "Generate Quiz" to create a quiz.');
}

function generateNewVideo() {
    // Reset and show input
    pauseVideo();
    videoState.currentSlide = 0;
    videoState.currentTime = 0;

    document.getElementById('video-player-section').classList.add('hidden');
    document.getElementById('video-generating').classList.add('hidden');
    document.getElementById('video-input-section').classList.remove('hidden');

    // Reset progress UI
    document.getElementById('video-progress-fill').style.width = '0%';
    document.getElementById('video-progress-text').textContent = '0%';

    for (let i = 1; i <= 4; i++) {
        const stepEl = document.getElementById(`gen-step-${i}`);
        stepEl.classList.remove('active', 'completed');
        if (i === 1) stepEl.classList.add('active');
    }
}

// Track page visits only once per session
(function trackVisit() {
    if (!sessionStorage.getItem('visit_counted')) {
        const visits = parseInt(localStorage.getItem('learnflow_visits') || '0') + 1;
        localStorage.setItem('learnflow_visits', visits);
        sessionStorage.setItem('visit_counted', 'true');
    }
})();

// Track stats
function trackQuiz() {
    const count = parseInt(localStorage.getItem('learnflow_quizzes') || '0') + 1;
    localStorage.setItem('learnflow_quizzes', count);
}

function trackChat() {
    const count = parseInt(localStorage.getItem('learnflow_chats') || '0') + 1;
    localStorage.setItem('learnflow_chats', count);
}

// ==================== INFO MODALS (About, Privacy, Terms, Contact) ====================
function getModalContent(type) {
    const today = new Date().toLocaleDateString();

    const contents = {
        about: '<h2>About LearnFlow</h2>' +
            '<p>LearnFlow is an AI-powered learning platform designed to make education accessible, engaging, and effective for everyone.</p>' +
            '<h3>Our Mission</h3>' +
            '<p>We believe that everyone deserves access to quality education. LearnFlow uses cutting-edge AI technology to create personalized learning experiences.</p>' +
            '<h3>Features</h3>' +
            '<ul>' +
            '<li><strong>AI Tutor</strong> - Get instant help on any topic</li>' +
            '<li><strong>Smart Quizzes</strong> - AI-generated quizzes that adapt to you</li>' +
            '<li><strong>Flashcards</strong> - Create and study with AI-powered decks</li>' +
            '<li><strong>Video Learning</strong> - Find educational videos on any subject</li>' +
            '</ul>' +
            '<h3>Created By</h3>' +
            '<p>Made with love by <strong>Chewang Tamang</strong></p>',

        privacy: '<h2>Privacy Policy</h2>' +
            '<p><em>Last updated: ' + today + '</em></p>' +
            '<h3>Information We Collect</h3>' +
            '<p>LearnFlow collects minimal information:</p>' +
            '<ul>' +
            '<li>Account information (name, email) when you sign up</li>' +
            '<li>Learning progress and quiz results</li>' +
            '<li>Chat history with AI tutor (stored locally)</li>' +
            '</ul>' +
            '<h3>Data Storage</h3>' +
            '<p>Most data is stored locally in your browser. We do not sell or share your personal information.</p>' +
            '<h3>Your Rights</h3>' +
            '<ul>' +
            '<li>Access your personal data at any time</li>' +
            '<li>Delete your account and all data</li>' +
            '<li>Export your learning data</li>' +
            '</ul>',

        terms: '<h2>Terms of Service</h2>' +
            '<p><em>Last updated: ' + today + '</em></p>' +
            '<h3>Acceptance of Terms</h3>' +
            '<p>By using LearnFlow, you agree to these terms.</p>' +
            '<h3>Use of Service</h3>' +
            '<ul>' +
            '<li>You must be at least 13 years old</li>' +
            '<li>You are responsible for account security</li>' +
            '<li>Do not misuse or abuse AI features</li>' +
            '</ul>' +
            '<h3>AI-Generated Content</h3>' +
            '<p>Our AI provides educational assistance but may occasionally make mistakes. Verify important information from authoritative sources.</p>' +
            '<h3>Limitation of Liability</h3>' +
            '<p>LearnFlow is provided "as is" without warranties.</p>',

        contact: '<h2>Contact Us</h2>' +
            '<p>We would love to hear from you!</p>' +
            '<h3>Get in Touch</h3>' +
            '<div class="contact-form">' +
            '<input type="text" id="contact-name" placeholder="Your Name">' +
            '<input type="email" id="contact-email" placeholder="Your Email">' +
            '<textarea id="contact-message" placeholder="Your Message..."></textarea>' +
            '<button type="button" onclick="sendContactForm()">Send Message</button>' +
            '</div>' +
            '<h3>Contact Information</h3>' +
            '<p><a href="mailto:u0383772169@gmail.com">Email: u0383772169@gmail.com</a></p>' +
            '<p>Made by <strong>Chewang Tamang</strong></p>'
    };

    return contents[type] || null;
}

function showModal(type) {
    try {
        var overlay = document.getElementById('infoModalOverlay');
        var contentEl = document.getElementById('modalContent');

        if (!overlay || !contentEl) {
            alert('Modal not found');
            return;
        }

        var html = getModalContent(type);
        if (html) {
            contentEl.innerHTML = html;
            overlay.style.display = 'flex';
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

function closeModal() {
    try {
        var overlay = document.getElementById('infoModalOverlay');
        if (overlay) {
            overlay.classList.remove('active');
            overlay.style.display = 'none';
            document.body.style.overflow = '';
        }
    } catch (err) {
        // Silent fail
    }
}

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

function sendContactForm() {
    var nameEl = document.getElementById('contact-name');
    var emailEl = document.getElementById('contact-email');
    var messageEl = document.getElementById('contact-message');

    if (!nameEl || !emailEl || !messageEl) {
        alert('Form elements not found');
        return;
    }

    var name = nameEl.value.trim();
    var email = emailEl.value.trim();
    var message = messageEl.value.trim();

    if (!name || !email || !message) {
        alert('Please fill in all fields!');
        return;
    }

    var subject = encodeURIComponent('LearnFlow Contact: Message from ' + name);
    var body = encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\n\nMessage:\n' + message);

    window.location.href = 'mailto:u0383772169@gmail.com?subject=' + subject + '&body=' + body;

    alert('Opening your email app!');
    closeModal();
}

// Modal functions are defined inline in index.html
