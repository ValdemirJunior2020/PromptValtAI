export interface PromptData {
  id: string;
  title: string;
  description: string;
  category: 'Coding' | 'Marketing' | 'Writing' | 'Image Gen' | 'Productivity';
  platform: 'Claude' | 'ChatGPT' | 'Midjourney' | 'General';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  promptText: string;
}

export const PROMPTS: PromptData[] = [
  {
    id: 'c1',
    title: 'React Native Component Generator',
    description: 'Generates a fully typed React Native functional component with Tailwind styling.',
    category: 'Coding',
    platform: 'Claude',
    difficulty: 'Intermediate',
    promptText: 'Act as an expert React Native developer. Create a functional component named [Component Name] using TypeScript and NativeWind (Tailwind CSS) for styling. Ensure the component accepts [List of Props] as props. Implement safe area views where necessary and use Lucide-react-native for any requested icons. Output only the code block.'
  },
  {
    id: 'm1',
    title: 'SaaS Landing Page Copy',
    description: 'Writes high-converting landing page copy based on the PAS (Problem-Agitation-Solution) framework.',
    category: 'Marketing',
    platform: 'General',
    difficulty: 'Advanced',
    promptText: 'Act as a world-class copywriter. Write the landing page copy for a new SaaS product called [Product Name] that helps [Target Audience] achieve [Main Benefit]. Use the PAS (Problem, Agitation, Solution) framework. Include a compelling H1 headline, a supportive subheadline, 3 core feature bullet points with emotional benefits, and a strong Call to Action (CTA).'
  },
  {
    id: 'w1',
    title: 'SEO Blog Post Outline',
    description: 'Creates a structured, SEO-optimized outline for a technical or informational blog post.',
    category: 'Writing',
    platform: 'General',
    difficulty: 'Beginner',
    promptText: 'Generate a comprehensive, SEO-optimized outline for a blog post titled "[Blog Post Title]". Include an introduction, 4-5 main H2 headings (each with 2-3 H3 subheadings), and a conclusion. Suggest specific keyword clusters to include in each section based on the primary keyword "[Primary Keyword]".'
  },
  {
    id: 'i1',
    title: 'Cinematic Portrait Photography',
    description: 'A detailed Midjourney prompt for hyper-realistic cinematic portraits.',
    category: 'Image Gen',
    platform: 'Midjourney',
    difficulty: 'Intermediate',
    promptText: 'Cinematic portrait of a [Subject Description], shot on 35mm lens, f/1.8, dramatic volumetric lighting, neon city backdrop, cyberpunk aesthetic, hyper-detailed skin texture, 8k resolution, photorealistic, cinematic color grading --ar 16:9 --style raw --v 6.0'
  },
  {
    id: 'p1',
    title: 'Weekly Task Prioritizer (Eisenhower)',
    description: 'Categorizes an unstructured list of tasks into the Eisenhower Matrix.',
    category: 'Productivity',
    platform: 'ChatGPT',
    difficulty: 'Beginner',
    promptText: 'Here is an unstructured list of my tasks for the week: [Paste Tasks]. Please categorize them using the Eisenhower Matrix (Urgent & Important, Important but Not Urgent, Urgent but Not Important, Neither). Provide actionable advice on how to tackle the "Important but Not Urgent" quadrant to prevent them from becoming emergencies.'
  },
  {
    id: 'c2',
    title: 'PostgreSQL Schema Designer',
    description: 'Designs a normalized SQL database schema based on business requirements.',
    category: 'Coding',
    platform: 'Claude',
    difficulty: 'Advanced',
    promptText: 'Act as a Senior Database Architect. Design a normalized PostgreSQL database schema for a [Type of Application, e.g., Food Delivery App]. Provide the SQL statements to create the tables, including primary keys, foreign keys, indexes for performance optimization, and appropriate data types. Explain your rationale for the relationships between the core tables.'
  },
  {
    id: 'm2',
    title: 'Cold Email Sequence Generator',
    description: 'Writes a 3-part B2B cold email sequence that gets replies.',
    category: 'Marketing',
    platform: 'General',
    difficulty: 'Intermediate',
    promptText: 'Write a 3-part B2B cold email sequence targeting [Job Title] at [Industry] companies. The goal is to get them to book a 15-minute demo of our product, [Product Name], which solves [Pain Point]. Email 1: Value-driven introduction. Email 2: Case study/Social proof (2 days later). Email 3: The breakup/final attempt (4 days later). Keep the tone professional but conversational.'
  },
  {
    id: 'i2',
    title: 'Flat Vector Illustration',
    description: 'Generates clean, modern vector-style illustrations for UI design.',
    category: 'Image Gen',
    platform: 'Midjourney',
    difficulty: 'Beginner',
    promptText: 'A modern, flat vector illustration of [Subject/Action, e.g., a team collaborating around a giant laptop], vibrant corporate colors, clean lines, minimalist background, UI design asset, dribbble style --ar 3:2 --no shading, gradients'
  }
];