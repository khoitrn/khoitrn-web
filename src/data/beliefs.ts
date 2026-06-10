export interface Belief {
  num: string;
  slug: string;
  title: string;
  body: string[];
}

export const beliefs: Belief[] = [
  {
    num: '01',
    slug: 'start-before-ready',
    title: 'Start before you\'re ready. Readiness is mostly a feeling, not a state.',
    body: [
      'I\'ve never felt ready for anything that mattered. Not the first product I shipped, not the first time I spoke in front of people, not the first time I had to make a real decision with real consequences. The feeling of readiness, I\'ve come to think, is mostly about familiarity — and you can only get familiar with something by doing it.',
      'There\'s a version of waiting that masquerades as preparation. It feels responsible. It feels careful. But most of the time it\'s fear wearing sensible clothes. The preparation that actually matters usually happens after you start — when the problem is real and the stakes are visible.',
      'So I try to start. Not recklessly, not without thinking — but before the feeling of readiness arrives, because it often doesn\'t arrive at all until you\'re already in the middle of something.',
    ],
  },
  {
    num: '02',
    slug: 'build-honest-things',
    title: 'Build things that are honest. If you have to oversell it, something\'s off.',
    body: [
      'There\'s a specific feeling I get when I\'m pitching something I don\'t fully believe in. A slight performance to it. A small gap between what I\'m saying and what I actually think. I\'ve learned to pay attention to that gap.',
      'The best things I\'ve been part of didn\'t need much selling. The value was either obvious or it emerged quickly once people tried them. The products that required the most energy to explain were often the ones with the most fundamental problems.',
      'Honest building means being willing to say: this isn\'t ready yet. Or: this doesn\'t work the way I thought. Or: I built this for me, not for you, and that\'s okay. It\'s a harder standard to hold but a much easier thing to live with.',
    ],
  },
  {
    num: '03',
    slug: 'write-to-think',
    title: 'Write to think, not to record. Most good ideas don\'t exist until you write them.',
    body: [
      'I used to think writing was something you did after you had the thought — a way to capture something that was already formed. It\'s almost the opposite. Writing is where the thought gets formed. The blank page is where you find out what you actually think, as opposed to what you vaguely feel.',
      'There\'s a specific kind of idea that only shows up under the pressure of putting words together. It resists being summarized in advance. You have to work toward it through sentences, follow the thread, and sometimes end up somewhere completely different from where you started. That\'s not a failure of planning — that\'s the work.',
      'This is also why I don\'t write to perform. The posts that feel most alive to me are the ones where I figured something out in the writing itself. The ones where I knew the conclusion before I started tend to be the flattest.',
    ],
  },
  {
    num: '04',
    slug: 'quiet-work-compounds',
    title: 'The quiet work compounds. Most of what matters isn\'t visible for a long time.',
    body: [
      'There\'s a version of ambition that needs constant feedback — that measures itself in what\'s visible, what\'s shareable, what gets acknowledged. I understand it. I\'ve felt it. But I\'ve also watched it exhaust people.',
      'The work that has compounded most for me has been the quiet kind. Reading things no one assigned. Building things no one asked for. Writing thoughts I didn\'t publish. Conversations that didn\'t produce anything measurable. None of it looked like progress at the time.',
      'Compounding is hard to observe in the moment because the payoff isn\'t proportional to any single input — it\'s proportional to the duration. Which means it requires a kind of faith that doesn\'t come with receipts. I think that\'s the point.',
    ],
  },
  {
    num: '05',
    slug: 'caring-about-craft',
    title: 'Caring about craft isn\'t precious — it\'s efficient. Sloppy work costs more later.',
    body: [
      'There\'s a way people frame caring about craft as a luxury — something you do when you have time, or when the stakes are high enough, or when someone important is watching. I think this gets it backwards.',
      'In my experience, cutting corners on craft almost always costs more than it saves. Not in an abstract moral sense — in a very literal, practical one. Technical debt accumulates. Unclear communication creates rework. Rushed decisions need to be relitigated. The bill arrives eventually, and it\'s usually larger than the original savings.',
      'Caring about how something is made is also a way of caring about the people who will use or inherit it. That seems worth something beyond efficiency too.',
    ],
  },
  {
    num: '06',
    slug: 'you-can-learn-anything',
    title: 'You can learn almost anything. The real question is whether you want it enough to be bad at it first.',
    body: [
      'Most skills aren\'t guarded secrets. The information is available. The question is almost never access — it\'s tolerance for the period of being bad at something, which is uncomfortable in proportion to how much you care about appearing competent.',
      'The people I\'ve watched learn the fastest are usually the ones with the lowest embarrassment threshold. They ask obvious questions. They show unfinished work. They say "I don\'t know" and then actually go find out. The ego management is the learning.',
      'There\'s also something about choosing carefully what you want to be bad at. You can\'t be a beginner at everything simultaneously. Choosing what to learn is choosing what to be temporarily incompetent in, and that\'s actually a meaningful decision.',
    ],
  },
  {
    num: '07',
    slug: 'curiosity-is-practice',
    title: 'Curiosity is a practice, not a personality trait. It requires showing up to things with no obvious payoff.',
    body: [
      'People talk about curiosity as if it\'s something you either have or don\'t. I think that\'s wrong. Curiosity is something you practice — and like most practices, it atrophies when you stop.',
      'Staying curious requires deliberately doing things that have no clear return. Reading about subjects adjacent to your work. Talking to people in different fields. Following questions that aren\'t on anyone\'s roadmap. The environment actively selects against this. Everything is optimized for relevance, for conversion, for measurable output.',
      'I try to protect time for things I can\'t justify. Not because I think it\'ll pay off — I genuinely don\'t know if it will. But because the alternative is a kind of narrowing I find more frightening than the inefficiency.',
    ],
  },
];
