import { pipeline, env } from '@huggingface/transformers';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { Matrix } from 'ml-matrix';

// PDF.js worker configuration
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Transformers config
env.allowLocalModels = false;
env.allowRemoteModels = true;

let textEmbeddingModel: any = null;
let isModelLoading = false;

const initializeModels = async () => {
  if (textEmbeddingModel || isModelLoading) return;
  isModelLoading = true;

  try {
    console.log('Loading HuggingFace model...');
    textEmbeddingModel = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('Model loaded successfully');
  } catch (error) {
    console.error('Model loading failed:', error);
  } finally {
    isModelLoading = false;
  }
};

// Text extraction from different file types
export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(' ');
      text += pageText + '\n';
    }

    return text.trim();
  } catch (error) {
    console.error('PDF text extraction failed:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

export const extractTextFromDocx = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value.trim();
  } catch (error) {
    console.error('DOCX text extraction failed:', error);
    throw new Error('Failed to extract text from DOCX');
  }
};

export const extractTextFromFile = async (file: File): Promise<string> => {
  const { type } = file;

  if (type === 'application/pdf') {
    return extractTextFromPDF(file);
  }
  if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return extractTextFromDocx(file);
  }
  if (type === 'text/plain') {
    return file.text();
  }

  throw new Error('Unsupported file type');
};

// Preprocessing
export const preprocessText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

// Skill extraction
export const extractSkills = (text: string): string[] => {
  const skills = [
    // Programming
    'javascript', 'python', 'java', 'typescript', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
    'swift', 'kotlin', 'scala', 'r', 'matlab', 'sql', 'html', 'css',
    // Frameworks
    'react', 'angular', 'vue', 'nodejs', 'express', 'django', 'flask', 'spring', 'laravel',
    'rails', 'nextjs', 'nuxt', 'svelte', 'ember', 'backbone', 'jquery',
    // Databases
    'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'sqlite', 'oracle',
    'cassandra', 'dynamodb', 'firebase',
    // DevOps & Cloud
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'github', 'gitlab',
    'terraform', 'ansible', 'vagrant', 'linux', 'unix', 'bash',
    // Data Science
    'machine learning', 'deep learning', 'data science', 'artificial intelligence',
    'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn', 'tableau', 'powerbi',
    // Soft Skills
    'leadership', 'communication', 'teamwork', 'problem solving', 'project management',
    'agile', 'scrum', 'kanban', 'analytical thinking', 'creativity'
  ];

  const lowerText = preprocessText(text);
  return [...new Set(skills.filter(skill => lowerText.includes(skill)))];
};

// Cosine similarity
export const calculateCosineSimilarity = (vecA: number[], vecB: number[]): number => {
  if (vecA.length !== vecB.length) throw new Error('Vector length mismatch');

  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  return (magA && magB) ? dot / (magA * magB) : 0;
};

// Embedding generation
export const generateEmbeddings = async (text: string): Promise<number[]> => {
  await initializeModels();

  if (!textEmbeddingModel) {
    throw new Error('Embedding model not ready');
  }

  try {
    const result = await textEmbeddingModel(text, { pooling: 'mean', normalize: true });
    return Array.from(result.data);
  } catch (err) {
    console.error('Embedding failed:', err);
    throw new Error('Embedding generation error');
  }
};

// Types
export interface AnalysisResult {
  overallScore: number;
  sectionScores: {
    skills: number;
    experience: number;
    education: number;
    keywords: number;
  };
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
}

// Resume vs JD analyzer
export const analyzeResumeMatch = async (
  resumeText: string,
  jobText: string,
  onProgress?: (progress: number) => void
): Promise<AnalysisResult> => {
  try {
    onProgress?.(10);

    const resumeSkills = extractSkills(resumeText);
    const jobSkills = extractSkills(jobText);

    onProgress?.(30);

    const matchedSkills = resumeSkills.filter(skill =>
      jobSkills.some(j => j.toLowerCase().includes(skill.toLowerCase()))
    );
    const missingSkills = jobSkills.filter(skill =>
      !resumeSkills.some(r => r.toLowerCase().includes(skill.toLowerCase()))
    );

    onProgress?.(50);

    const resumeVec = await generateEmbeddings(preprocessText(resumeText));
    const jobVec = await generateEmbeddings(preprocessText(jobText));

    onProgress?.(70);

    const similarity = calculateCosineSimilarity(resumeVec, jobVec);

    onProgress?.(80);

    const skillsScore = jobSkills.length ? (matchedSkills.length / jobSkills.length) * 100 : 100;
    const experienceScore = Math.min(similarity * 120, 100);
    const educationScore = similarity * 100;
    const keywordsScore = skillsScore;

    const overallScore = Math.round(
      skillsScore * 0.4 +
      experienceScore * 0.3 +
      educationScore * 0.2 +
      keywordsScore * 0.1
    );

    const recommendations: string[] = [];

    if (missingSkills.length)
      recommendations.push(`Missing skills: ${missingSkills.slice(0, 5).join(', ')}`);
    if (skillsScore < 70)
      recommendations.push('Highlight more relevant skills in your resume.');
    if (similarity < 0.6)
      recommendations.push('Use more job description keywords.');
    if (overallScore < 60)
      recommendations.push('Restructure your resume to better fit the job.');

    onProgress?.(100);

    return {
      overallScore,
      sectionScores: {
        skills: Math.round(skillsScore),
        experience: Math.round(experienceScore),
        education: Math.round(educationScore),
        keywords: Math.round(keywordsScore)
      },
      matchedSkills,
      missingSkills: missingSkills.slice(0, 10),
      recommendations
    };
  } catch (error) {
    console.error('Resume match analysis failed:', error);
    throw new Error('Analysis failed. Try again.');
  }
};
