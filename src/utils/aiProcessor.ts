import { pipeline, env } from '@huggingface/transformers';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { Matrix } from 'ml-matrix';

// Configure transformers.js
env.allowLocalModels = false;
env.allowRemoteModels = true;

// Initialize AI models
let textEmbeddingModel: any = null;
let isModelLoading = false;

const initializeModels = async () => {
  if (textEmbeddingModel || isModelLoading) return;
  
  isModelLoading = true;
  try {
    console.log('Loading AI model...');
    textEmbeddingModel = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    );
    console.log('AI model loaded successfully');
  } catch (error) {
    console.error('Failed to load AI model:', error);
  } finally {
    isModelLoading = false;
  }
};

// Text extraction utilities
export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + ' ';
    }

    return fullText.trim();
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

export const extractTextFromDocx = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error('Error extracting DOCX text:', error);
    throw new Error('Failed to extract text from DOCX');
  }
};

export const extractTextFromFile = async (file: File): Promise<string> => {
  const fileType = file.type;
  
  if (fileType === 'application/pdf') {
    return extractTextFromPDF(file);
  } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return extractTextFromDocx(file);
  } else if (fileType === 'text/plain') {
    return file.text();
  } else {
    throw new Error('Unsupported file type');
  }
};

// Text preprocessing
export const preprocessText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

// Skill extraction
export const extractSkills = (text: string): string[] => {
  const commonSkills = [
    // Programming languages
    'javascript', 'python', 'java', 'typescript', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
    'swift', 'kotlin', 'scala', 'r', 'matlab', 'sql', 'html', 'css',
    
    // Frameworks and libraries
    'react', 'angular', 'vue', 'nodejs', 'express', 'django', 'flask', 'spring', 'laravel',
    'rails', 'nextjs', 'nuxt', 'svelte', 'ember', 'backbone', 'jquery',
    
    // Databases
    'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'sqlite', 'oracle',
    'cassandra', 'dynamodb', 'firebase',
    
    // Cloud and DevOps
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'github', 'gitlab',
    'terraform', 'ansible', 'vagrant', 'linux', 'unix', 'bash',
    
    // Data and AI
    'machine learning', 'deep learning', 'data science', 'artificial intelligence',
    'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn', 'tableau', 'powerbi',
    
    // Soft skills
    'leadership', 'communication', 'teamwork', 'problem solving', 'project management',
    'agile', 'scrum', 'kanban', 'analytical thinking', 'creativity'
  ];

  const preprocessedText = preprocessText(text);
  const foundSkills: string[] = [];

  commonSkills.forEach(skill => {
    if (preprocessedText.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });

  return [...new Set(foundSkills)]; // Remove duplicates
};

// Calculate cosine similarity
export const calculateCosineSimilarity = (vecA: number[], vecB: number[]): number => {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }

  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
};

// Generate embeddings
export const generateEmbeddings = async (text: string): Promise<number[]> => {
  await initializeModels();
  
  if (!textEmbeddingModel) {
    throw new Error('Text embedding model not available');
  }

  try {
    const result = await textEmbeddingModel(text, { pooling: 'mean', normalize: true });
    return Array.from(result.data);
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw new Error('Failed to generate text embeddings');
  }
};

// Main analysis function
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

export const analyzeResumeMatch = async (
  resumeText: string,
  jobDescriptionText: string,
  onProgress?: (progress: number) => void
): Promise<AnalysisResult> => {
  try {
    onProgress?.(10);
    
    // Extract skills from both texts
    const resumeSkills = extractSkills(resumeText);
    const jobSkills = extractSkills(jobDescriptionText);
    
    onProgress?.(30);
    
    // Find matched and missing skills
    const matchedSkills = resumeSkills.filter(skill => 
      jobSkills.some(jobSkill => jobSkill.toLowerCase().includes(skill.toLowerCase()))
    );
    const missingSkills = jobSkills.filter(skill => 
      !resumeSkills.some(resumeSkill => resumeSkill.toLowerCase().includes(skill.toLowerCase()))
    );
    
    onProgress?.(50);
    
    // Generate embeddings for semantic similarity
    const resumeEmbedding = await generateEmbeddings(preprocessText(resumeText));
    const jobEmbedding = await generateEmbeddings(preprocessText(jobDescriptionText));
    
    onProgress?.(70);
    
    // Calculate semantic similarity
    const semanticSimilarity = calculateCosineSimilarity(resumeEmbedding, jobEmbedding);
    
    onProgress?.(80);
    
    // Calculate section scores
    const skillsScore = jobSkills.length > 0 ? (matchedSkills.length / jobSkills.length) * 100 : 100;
    const experienceScore = Math.min(semanticSimilarity * 120, 100); // Boost semantic similarity
    const educationScore = semanticSimilarity * 100;
    const keywordsScore = skillsScore; // For now, same as skills
    
    // Calculate overall score (weighted average)
    const overallScore = Math.round(
      (skillsScore * 0.4) + 
      (experienceScore * 0.3) + 
      (educationScore * 0.2) + 
      (keywordsScore * 0.1)
    );
    
    onProgress?.(90);
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    if (missingSkills.length > 0) {
      recommendations.push(`Add these missing skills to your resume: ${missingSkills.slice(0, 5).join(', ')}`);
    }
    
    if (skillsScore < 70) {
      recommendations.push('Consider highlighting more relevant technical skills that match the job requirements.');
    }
    
    if (semanticSimilarity < 0.6) {
      recommendations.push('Try to use more keywords and phrases from the job description in your resume.');
    }
    
    if (overallScore < 60) {
      recommendations.push('Consider restructuring your resume to better align with the job requirements.');
    }
    
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
      missingSkills: missingSkills.slice(0, 10), // Limit to top 10
      recommendations
    };
    
  } catch (error) {
    console.error('Error during analysis:', error);
    throw new Error('Analysis failed. Please try again.');
  }
};