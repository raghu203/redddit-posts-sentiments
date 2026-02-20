// Shared mock thread data used by both the thread list and thread detail pages

export type Comment = {
    id: number;
    user: string;
    text: string;
    upvotes: number;
    time: string;
    sentiment: 'Positive' | 'Neutral' | 'Negative';
    replies?: Comment[];
};

export type Thread = {
    id: number;
    subreddit: string;
    title: string;
    body: string;
    author: string;
    upvotes: number;
    comments: number;
    time: string;
    sentiment: 'Positive' | 'Neutral' | 'Negative';
    flair?: string;
    commentList: Comment[];
};

export const threads: Thread[] = [
    {
        id: 1,
        subreddit: 'r/technology',
        title: 'OpenAI releases GPT-5 with unprecedented reasoning capabilities',
        body: "OpenAI's latest model, GPT-5, has been released today and initial benchmarks show a dramatic improvement in multi-step reasoning. Early testers say it can write functional software from a brief description alone. What are your thoughts?",
        author: 'u/TechGuru99',
        upvotes: 24300,
        comments: 892,
        time: '3 hours ago',
        sentiment: 'Positive',
        flair: 'AI',
        commentList: [
            {
                id: 1, user: 'u/CodeMaster', text: "This is incredible. I've been waiting for this level of reasoning for years. Can't wait to integrate it.", upvotes: 1240, time: '2h ago', sentiment: 'Positive', replies: [
                    { id: 11, user: 'u/SkepticalDev', text: 'Bold claim. Benchmark performance rarely translates to real-world utility. I\'ll believe it when I see it.', upvotes: 430, time: '2h ago', sentiment: 'Negative' },
                ]
            },
            { id: 2, user: 'u/AIResearcher', text: 'The multi-step reasoning leap is genuinely impressive. The paper will be fascinating to read.', upvotes: 980, time: '2h ago', sentiment: 'Positive' },
            { id: 3, user: 'u/EthicsWatcher', text: 'When are we going to have a serious conversation about the societal implications? This is moving too fast.', upvotes: 760, time: '1h ago', sentiment: 'Negative' },
            { id: 4, user: 'u/StartupFounder', text: "Already building a product around this. The API pricing is the make-or-break factor for solo devs.", upvotes: 520, time: '1h ago', sentiment: 'Neutral' },
        ],
    },
    {
        id: 2,
        subreddit: 'r/science',
        title: 'New study links gut microbiome diversity to mental health outcomes',
        body: 'A landmark study published in Nature this week found a strong correlation between gut microbiome diversity and reduced rates of anxiety and depression. Researchers followed 12,000 participants over 5 years.',
        author: 'u/ScienceNerd42',
        upvotes: 18750,
        comments: 534,
        time: '6 hours ago',
        sentiment: 'Positive',
        flair: 'Health',
        commentList: [
            { id: 1, user: 'u/NutritionDoc', text: 'Fascinating research. Diet is consistently underestimated in mental health treatment. This reinforces why.', upvotes: 870, time: '5h ago', sentiment: 'Positive' },
            { id: 2, user: 'u/BiomeSkeptic', text: "Correlation is not causation. The study design needs scrutiny before we draw sweeping conclusions.", upvotes: 650, time: '4h ago', sentiment: 'Neutral' },
        ],
    },
    {
        id: 3,
        subreddit: 'r/space',
        title: 'SpaceX Starship completes first fully successful orbital test flight',
        body: 'After years of development and several dramatic test failures, Starship completed its first fully successful orbital test, splashing down in the designated zone in the Pacific Ocean.',
        author: 'u/SpaceFanatic',
        upvotes: 41200,
        comments: 2100,
        time: '1 day ago',
        sentiment: 'Positive',
        flair: 'SpaceX',
        commentList: [
            { id: 1, user: 'u/RocketScience101', text: "This is the moment we've been waiting for. Reusable heavy-lift launch changes the economics of space forever.", upvotes: 3200, time: '22h ago', sentiment: 'Positive' },
            { id: 2, user: 'u/MarsOrBust', text: 'Mars in 5 years feels less crazy now. The engineering achievement here is staggering.', upvotes: 2100, time: '20h ago', sentiment: 'Positive' },
            { id: 3, user: 'u/RegulatorWatch', text: 'Hope the FAA keeps a close eye on the environmental impact of these launches.', upvotes: 890, time: '18h ago', sentiment: 'Neutral' },
        ],
    },
    {
        id: 4,
        subreddit: 'r/worldnews',
        title: 'Global inflation hits 40-year high as energy prices surge',
        body: 'According to data released by the IMF, global inflation has reached its highest point in four decades, driven primarily by energy costs and ongoing supply chain disruptions.',
        author: 'u/EconomicsWatcher',
        upvotes: 9800,
        comments: 1450,
        time: '8 hours ago',
        sentiment: 'Negative',
        flair: 'Inflation',
        commentList: [
            { id: 1, user: 'u/WorkingClass99', text: "I haven't been able to afford groceries without cutting something else for 6 months. This is real and it's painful.", upvotes: 4500, time: '7h ago', sentiment: 'Negative' },
            { id: 2, user: 'u/EconProf', text: 'Energy price shocks have historically driven inflationary waves. The question is the duration and central bank response.', upvotes: 1200, time: '6h ago', sentiment: 'Neutral' },
        ],
    },
    {
        id: 5,
        subreddit: 'r/Python',
        title: 'Python 4.0 roadmap released - what features are you most excited about?',
        body: "The Python steering council has released a draft roadmap for Python 4.0. Key highlights include a new JIT compiler by default, structural pattern matching enhancements, and removal of several legacy features.",
        author: 'u/SnakeLover_Dev',
        upvotes: 12600,
        comments: 678,
        time: '12 hours ago',
        sentiment: 'Positive',
        flair: 'Python',
        commentList: [
            { id: 1, user: 'u/GIL_Hater', text: 'If they finally remove the GIL by default, this will be a massive upgrade for concurrency-heavy applications.', upvotes: 2100, time: '11h ago', sentiment: 'Positive' },
            { id: 2, user: 'u/BackwardsCompat', text: "Please don't break my existing codebases. The Python 2→3 migration was traumatic enough.", upvotes: 1800, time: '10h ago', sentiment: 'Negative' },
        ],
    },
];
